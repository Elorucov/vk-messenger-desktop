import { API_VERSION, API_ERROR_AUTH, API_ERROR_CAPTCHA, API_ERROR_SECTION_DISABLED, API_ERROR_TOO_MANY, API_ERROR_FLOOD, API_ERROR_METHOD_DISABLED, API_ERROR_RATE_LIMIT, API_ERROR_SERVER, API_ERROR_UNKNOWN, API_ERROR_USER_DEACTIVATED, API_ERROR_UNKNOWN_USER, API_ERROR_ACCESS, API_ERROR_CUA_CONFIRMATION_REQUIRED, } from '@vkontakte-internal/api-schema-typescript';
import { IApi, COMMUNITY_ADMIN_NEED_2FA } from '../env/IApi';
import { API_DEFAULT_TIMEOUT, API_USER_FIELDS, API_MIN_RETRY_TIMEOUT, API_MAX_RETRY_TIMEOUT, API_GROUP_FIELDS, API_CHANNEL_FIELDS, API_GROUP_COMMON_FIELDS, } from '../../core/config/config';
import { getRandomInt, sleep } from '../../core/utils/misc';
import { Semaphore } from '../../core/utils/Semaphore';
export class Api {
    logger;
    baseUrl;
    request;
    onCaptcha;
    onCua;
    onApiUnavailable;
    onLogout;
    prefetchCache;
    online;
    lang;
    token;
    semaphore;
    rateLimitWindow;
    isDisposed = false;
    /**
     * Капча, которую в данный момент разгадывает юзер
     */
    captcha;
    /**
     * Мапа с abort функциями, чтобы прервать вызов метода.
     *
     * Для возможности прерывания вызова метода нужно:
     * 1. создать TrackId с помощью IApi.resolveTrackId
     * 2. передать его в opts при вызове api.fetch/fetchMany/fetchSeq
     * 3. прервать метод через api.dangerouslyAbort(trackId)
     *
     * Однако существует хук, который сделает всю работу за вас: useApiFetch
     */
    abortTrackers = new Map();
    abortControllers = new Set();
    prefetchStats = [];
    constructor(logger, baseUrl, request, token, onCaptcha, onCua, onApiUnavailable, { rateLimit, rateLimitWindow }, onLogout, prefetchCache, 
    /**
     * Позволяет завязываться на браузерный эвент online() вместо ретраев по таймауту
     */
    online, 
    /**
     * Позволяет определять язык, на котором будут возвращаться различные данные,
     * например названия стран и городов.
     *
     * @see https://dev.vk.com/ru/api/api-requests
     */
    lang) {
        this.logger = logger;
        this.baseUrl = baseUrl;
        this.request = request;
        this.onCaptcha = onCaptcha;
        this.onCua = onCua;
        this.onApiUnavailable = onApiUnavailable;
        this.onLogout = onLogout;
        this.prefetchCache = prefetchCache;
        this.online = online;
        this.lang = lang;
        /**
         * У API есть лимит на запросы: можно вызывать не больше
         * rateLimit запросов за последние rateLimitWindow миллисекунд.
         * Семафор позволяет удобно распоряжаться очередью запросов с учетом
         * указанных лимитов
         */
        this.semaphore = new Semaphore(rateLimit, rateLimitWindow);
        this.rateLimitWindow = rateLimitWindow;
        this.token = async (isExpired) => {
            try {
                return await token(isExpired);
            }
            catch (err) {
                let message = 'Unknown';
                if (err instanceof Error) {
                    message = err.message;
                }
                throw new IApi.AuthError(`[API] AuthError: ${message}`);
            }
        };
    }
    /**
     * Сделать запрос к методу АПИ.
     *
     * Используем 2 дженерика: один для метода апи, другой для префикса трек айди и задаем их равенство, чтобы
     * тс не соединял метод апи и префикс в юнион тип, если они имеют разные значения.
     */
    async fetch(method, params, opts = {}) {
        if (this.isDisposed) {
            throw Error('API уничтожен');
        }
        if (opts.usePrefetch) {
            const prefetched = this.prefetch(method, params);
            if (prefetched) {
                return prefetched;
            }
        }
        const retries = opts.retries || 0;
        let takenAttempts = 0;
        while (true) {
            try {
                const res = await this.doFetch(method, params, opts.timeout || API_DEFAULT_TIMEOUT, opts.trackId, opts.fromExternalLib);
                return res;
            }
            catch (err) {
                // Выбрасываем ошибку дальше, если запрос был отменен абортом
                if (err instanceof IApi.AbortError) {
                    throw err;
                }
                takenAttempts++;
                let requestErrors = [];
                if (err instanceof IApi.RequestError) {
                    requestErrors = [err];
                }
                if (err instanceof IApi.ExecuteErrors) {
                    requestErrors = err.list;
                }
                const alreadyHandledErrors = new Set();
                for (const err of requestErrors) {
                    switch (err.code) {
                        // Истек токен
                        case API_ERROR_AUTH: {
                            // Мы передаем api.fetchForExternalLibs внешним либам, и если они
                            // передают свой токен, значит они сами должны обрабатывать
                            // истекание токена
                            if (opts.fromExternalLib &&
                                'access_token' in params &&
                                params.access_token) {
                                throw err;
                            }
                            if (alreadyHandledErrors.has(err.code)) {
                                continue;
                            }
                            await this.token(true);
                            // Сбросим число попыток, потому что не будем считать
                            // эту ошибку за потраченную попытку
                            takenAttempts = 0;
                            break;
                        }
                        case API_ERROR_CAPTCHA: {
                            let sid, data;
                            if (this.captcha) {
                                // Если капча уже показывается, подождем пока это закончится
                                // и попробуем заретраить тот же самый запрос с результатами капчи
                                sid = this.captcha.sid;
                                data = await this.captcha.data;
                            }
                            else {
                                // Иначе будем показывать капчу пользователю
                                if (!IApi.isCaptchaData(err.apiError)) {
                                    throw err;
                                }
                                const captchaData = err.apiError;
                                sid = captchaData.captcha_sid;
                                // Запоминаем промис с показом капчи, чтобы тормозить остальные запросы
                                // TODO: возможно стоит хранить капчи отдельно в мапке по методам,
                                // но пока сделаем так
                                this.captcha = {
                                    sid,
                                    data: this.onCaptcha(captchaData),
                                };
                                data = await this.captcha.data;
                                // Как только получили ключ от пользователя, запоминать больше не нужно
                                this.captcha = undefined;
                            }
                            // Если пользователь решил не вводить капчу,
                            // то мы перестанем ретраить запрос и выкинем ошибку
                            if (!data) {
                                throw err;
                            }
                            // @ts-expect-error
                            params.captcha_sid = sid;
                            // @ts-expect-error
                            params.captcha_key = data.key;
                            // @ts-expect-error
                            params.is_sound_captcha = Number(data.isAudio);
                            // @ts-expect-error
                            params.success_token = data.successToken;
                            // Сбросим число попыток, потому что не будем считать
                            // эту ошибку за потраченную попытку
                            takenAttempts = 0;
                            break;
                        }
                        case API_ERROR_SECTION_DISABLED: {
                            this.onApiUnavailable(API_ERROR_SECTION_DISABLED);
                            // Выбрасываем err, так как при этой ошибке нет смысла ретраить
                            throw err;
                        }
                        case API_ERROR_TOO_MANY: {
                            if (alreadyHandledErrors.has(err.code)) {
                                continue;
                            }
                            // Сбросим число попыток, потому что не будем считать
                            // эту ошибку за потраченную попытку
                            takenAttempts = 0;
                            // Ждем гарантированного выхода из окна лимита и пробуем сделать запрос еще раз
                            await sleep(this.rateLimitWindow);
                            break;
                        }
                        case API_ERROR_USER_DEACTIVATED:
                        case API_ERROR_UNKNOWN_USER: {
                            await this.onLogout?.();
                            throw err;
                        }
                        case API_ERROR_UNKNOWN:
                        case API_ERROR_FLOOD:
                        case API_ERROR_SERVER:
                        case API_ERROR_METHOD_DISABLED:
                        case API_ERROR_RATE_LIMIT: {
                            // Позволяем ретраить эти методы
                            break;
                        }
                        case API_ERROR_ACCESS: {
                            if (err.subcode === COMMUNITY_ADMIN_NEED_2FA) {
                                this.onApiUnavailable(COMMUNITY_ADMIN_NEED_2FA);
                            }
                            throw err;
                        }
                        case API_ERROR_CUA_CONFIRMATION_REQUIRED: {
                            if (!IApi.isCuaData(err.apiError)) {
                                throw err;
                            }
                            const data = await this.onCua(err.apiError);
                            if (!data) {
                                throw err;
                            }
                            // Сбросим число попыток, потому что не будем считать
                            // эту ошибку за потраченную попытку
                            takenAttempts = 0;
                            break;
                        }
                        default: {
                            throw err;
                        }
                    }
                    alreadyHandledErrors.add(err.code);
                }
                // Выбрасываем ошибку дальше если закончились ретраи
                if (takenAttempts === retries + 1) {
                    throw err;
                }
                /**
                 * Мы делаем бэкофф полурандомным, чтобы на каждом клиенте
                 * ретрай запроса в апи происходил в разное время. Это предотвращает
                 * всплески запросов, если с апи случилась какая-то проблема и он
                 * начал отдавать всем клиентам ошибку
                 *
                 * Подробнее: https://aws.amazon.com/ru/blogs/architecture/exponential-backoff-and-jitter
                 */
                const exponentialBackoff = Math.min(API_MIN_RETRY_TIMEOUT * 2 ** takenAttempts, API_MAX_RETRY_TIMEOUT);
                const equalJitterBackoff = exponentialBackoff / 2 + getRandomInt(0, exponentialBackoff / 2);
                await sleep(equalJitterBackoff);
                if (this.online) {
                    await this.online();
                }
            }
        }
    }
    /**
     * Сделать несколько запросов к методам АПИ в виде 1ого HTTP запроса.
     * Порядок, в котором запросы выполняются на беке не гарантирован.
     *
     * Запрос не может исполниться частично.
     * Если один из методов сфейлился, сфейлится все целиком.
     */
    async fetchMany(reqs, opts = {}) {
        if (this.isDisposed) {
            return Promise.reject('API уничтожен');
        }
        const pids = [];
        const result = [];
        const prefetcheds = [];
        let prefetchedCount = 0;
        let noForkOptimizationApplied = false;
        // Идем по массиву в обратном порядке ради оптимизации ниже
        for (let i = reqs.length - 1; i >= 0; i--) {
            const req = reqs[i];
            if (!req) {
                result[i] = 'null';
                continue;
            }
            if (opts.usePrefetch) {
                const prefetched = this.prefetch(req.method, req.params);
                if (prefetched) {
                    result[i] = 'null';
                    prefetcheds[i] = prefetched;
                    prefetchedCount++;
                    continue;
                }
            }
            const varName = `res${i}`;
            const apiCall = `API.${req.method}(${JSON.stringify(this.enrichParams(req.method, req.params))})`;
            // Тут мы реализауем оптимизацию форков.
            // Смысл в том, что последний запрос форкать не нужно, он может продолжать
            // выполняться в мейн треде. Таким образом мы экономим ресурсы на беке и это хорошо.
            // Поскольку мы идем в обратном цикле, то "последний" такой запрос становится первым в нашем цикле.
            // Это позволяет упростить логику, поскольку у нас есть запросы, которые отбиваются раньше из-за
            // null или prefetch.
            if (!noForkOptimizationApplied) {
                noForkOptimizationApplied = true;
                pids[i] = `var ${varName}=${apiCall};`;
                result[i] = `${varName}`;
            }
            else {
                pids[i] = `var ${varName}=fork(${apiCall});`;
                result[i] = `wait(${varName})`;
            }
        }
        if (prefetchedCount === reqs.filter(Boolean).length) {
            // Тут можно замучаться кастовать типы, при этом код утилитарный,
            // который написан раз и на всегда. Поэтому допускаем игнор типов.
            return prefetcheds;
        }
        const code = `${pids.join('')}return [${result.join(',')}];`;
        const res = await this.fetch('execute', { code }, opts);
        for (let i = 0; i < res.length; i++) {
            if (prefetcheds[i]) {
                res[i] = prefetcheds[i];
            }
        }
        return res;
    }
    /**
     * Сделать несколько запросов к методам АПИ в виде 1ого HTTP запроса.
     * На бекенде запросы будут выполняться строго по порядку -
     * пока первый не закончен, второй не начнется.
     *
     * Запрос не может исполниться частично.
     * Если один из методов сфейлился, сфейлится все целиком.
     */
    fetchSeq(reqs, opts) {
        if (this.isDisposed) {
            return Promise.reject('API уничтожен');
        }
        const pids = [];
        const result = [];
        for (let i = 0; i < reqs.length; i++) {
            const req = reqs[i];
            if (!req) {
                result.push('null');
                continue;
            }
            const varName = `res${i}`;
            pids.push(`var ${varName}=API.${req.method}(${JSON.stringify(this.enrichParams(req.method, req.params))});`);
            result.push(`${varName}`);
        }
        const code = `${pids.join('')}return [${result.join(',')}];`;
        return this.fetch('execute', { code }, opts);
    }
    fetchForExternalLibs(method, params, opts) {
        if (this.isDisposed) {
            return Promise.reject('API уничтожен');
        }
        return this.fetch(method, params, {
            ...opts,
            fromExternalLib: true,
        });
    }
    /**
     * Отмена запроса. Небезопасно для write-запросов.
     * Запрос может отмениться в момент, когда данные уже были отправлены. В таком случае они будут обработаны сервером, что может привести к рассинхронизации состояния.
     * Используйте только там, где полностью контролируется синхронизация или для read-запросов.
     * Если остались сомнения, можно обратиться к vk.com/sdev
     */
    dangerouslyAbort(trackId) {
        if (!trackId) {
            return;
        }
        this.abortTrackers.get(trackId)?.();
        this.abortTrackers.delete(trackId);
    }
    getPrefetchedStats() {
        return this.prefetchStats;
    }
    /**
     * Дополняем параметры запроса полями для расширенных данных.
     * Это упрощает жизнь конечному разработчику, убирает необходимость за этим следить.
     */
    enrichParams = (method, params) => {
        const [scope, scopeMethod] = method.split('.');
        switch (scope) {
            case 'users':
            case 'friends': {
                return {
                    ...params,
                    lang: this.lang,
                    // Если вдруг ты оказался тут и пытаешься понять зачем мы оверрайдим
                    // переданные поля, прочитай комментарии к Enforce* типам в IApi
                    fields: API_USER_FIELDS.join(','),
                };
            }
            case 'groups': {
                let fields;
                switch (scopeMethod) {
                    case 'tagAdd':
                    case 'tagBind':
                    case 'tagDelete':
                    case 'tagUpdate':
                        break;
                    default:
                        // Если вдруг ты оказался тут и пытаешься понять зачем мы оверрайдим
                        // переданные поля, прочитай комментарии к Enforce* типам в IApi
                        fields = API_GROUP_FIELDS.join(',');
                        break;
                }
                return { ...params, lang: this.lang, fields };
            }
            case 'channels':
                return {
                    ...params,
                    lang: this.lang,
                    // Если вдруг ты оказался тут и пытаешься понять зачем мы оверрайдим
                    // переданные поля, прочитай комментарии к Enforce* типам в IApi
                    fields: API_CHANNEL_FIELDS.join(','),
                };
            default:
                return ('extended' in params && params.extended) ||
                    ('extended_filters' in params && params.extended_filters)
                    ? {
                        ...params,
                        lang: this.lang,
                        // Если вдруг ты оказался тут и пытаешься понять зачем мы оверрайдим
                        // переданные поля, прочитай комментарии к Enforce* типам в IApi
                        fields: Array.from(new Set([...API_USER_FIELDS, ...API_GROUP_COMMON_FIELDS])).join(','),
                    }
                    : {
                        ...params,
                        lang: this.lang,
                    };
        }
    };
    /**
     * Выполняет запрос к АПИ ВКонтакте.
     * Так же делает дополнительные попытки, в случае ошибки.
     */
    doFetch = async (method, params, timeout, trackId, fromExternalLib) => {
        await this.semaphore.lock();
        try {
            this.logger.info('[API] Request', method, params);
            const enrichedParams = {
                access_token: await this.token(false),
                ...(fromExternalLib ? params : this.enrichParams(method, params)),
            };
            const version = fromExternalLib && 'v' in params ? params.v : API_VERSION;
            const url = `${this.baseUrl}/method/${method}?v=${version}`;
            const ctrl = new AbortController();
            this.abortControllers.add(ctrl);
            if (trackId) {
                this.abortTrackers.set(trackId, () => ctrl.abort());
            }
            let isTimeout = false;
            const timeoutId = setTimeout(() => {
                isTimeout = true;
                ctrl.abort();
            }, timeout);
            const result = await this.request(url, enrichedParams, ctrl.signal)
                .catch((err) => {
                if (ctrl.signal.aborted) {
                    if (isTimeout) {
                        throw new IApi.TimeoutError(`[API] Timeout Error: ${method}`);
                    }
                    else {
                        throw new IApi.AbortError(`[API] Abort Error: ${method}`);
                    }
                }
                throw err;
            })
                .finally(() => {
                clearTimeout(timeoutId);
                if (trackId) {
                    this.abortTrackers.delete(trackId);
                }
                this.abortControllers.delete(ctrl);
            });
            this.logger.info('[API] Response', method, result);
            if (result.error) {
                return Promise.reject(new IApi.RequestError(result.error.error_code, `[API] RequestError: ${result.error.error_code} ${method} (${result.error.error_msg})`, result.error, result.error.error_subcode, result.error.error_text));
            }
            /**
             * Если запрос был сделан через метод execute, то могут вернуться
             * ошибки отдельных методов
             */
            if (result.execute_errors) {
                return Promise.reject(new IApi.ExecuteErrors(result.execute_errors.map((error) => new IApi.RequestError(error.error_code, `[API] RequestError: ${error.error_code} ${error.method} (${error.error_msg})`, error, error.error_subcode)), result.response));
            }
            return result.response;
        }
        catch (err) {
            this.logger.info('[API] Error', err);
            return Promise.reject(err);
        }
        finally {
            this.semaphore.release();
        }
    };
    prefetch(method, params) {
        if (!this.prefetchCache) {
            return undefined;
        }
        params = this.enrichParams(method, params);
        const idx = this.prefetchCache.findIndex((item) => {
            if (item.version !== API_VERSION) {
                return false;
            }
            if (item.method !== method) {
                return false;
            }
            if (Object.keys(params).length !== Object.keys(item.request).length) {
                return false;
            }
            return Object.keys(params).every((param) => 
            // На практике ключи тут одни и те же, но тайпскрипту объяснить это сложно.
            // Да и Object.keys в реальные ключи тут не умеет.
            // Опять же поскольку это сервисный код, который меняется наиболее редко,
            // отключить ошибку тут будет приемлемо.
            // @ts-expect-error
            params[param] === item.request[param]);
        });
        const found = this.prefetchCache[idx];
        this.prefetchStats.push({
            method,
            isPrefetched: !!found,
        });
        if (!found) {
            return undefined;
        }
        this.prefetchCache.splice(idx, 1);
        if (found.error) {
            return undefined;
        }
        return found.response;
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.isDisposed = true;
        this.abortControllers.forEach((ctrl) => ctrl.abort());
    }
}
//# sourceMappingURL=Api.js.map