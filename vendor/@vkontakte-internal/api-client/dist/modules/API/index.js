import { getClient } from '@sentry/browser';
import { API_ERROR_APP_AUTH, API_ERROR_AUTH, API_ERROR_CAPTCHA, API_ERROR_AUTH_ANONYMOUS_TOKEN_HAS_EXPIRED, API_ERROR_CUA_2_CONFIRMATION_REQUIRED, } from '../../error-codes';
import { PendingTask } from '../../helpers/PendingTask';
import { RequestTask } from '../../helpers/RequestTask';
import { Retries } from '../../helpers/Retries';
import { corsRequest, makeParams, toFormData } from '../../utils/utilsUrl';
import { CUA_STATE_PARAM, CUA_SESSION_PARAM, STORAGE_CUA_STATE } from '../CUA/constants';
import { waitTimeExp } from '../../utils/utilsWait';
import { APIErrorType, } from './types';
import { getApiConfig, setApiConfig } from './config';
import { getRequestHash, rejectWithApiError, isNotAllowedToMakeMoreRequests } from './utils';
const reApiRetries = new Retries();
const reLoginRetries = new Retries();
let activeCaptchaRequest = null;
let activeCuaRequest = null;
let timeoutId = null;
const BATCH_CAPACITY = 25;
// Максимальное количество adhoc запросов в батче
const BATCH_ADHOC_RATIO = 0.2;
const BATCH_ADHOC_CAPACITY = Math.floor(BATCH_CAPACITY * BATCH_ADHOC_RATIO);
const adhocTimeoutIds = new Map();
const queue = [];
const adhocQueue = [];
export { setApiConfig } from './config';
export function api(method, methodParams, overrideApiConfig = {}, fetchOptions = {}, meta = {}) {
    const workGroupingImpl = window?.vk?.pe['frontend.web_statlogs_transport']
        ? workGroupingWithAdhoc
        : workGrouping;
    const task = new RequestTask(method, methodParams, getApiConfig(), overrideApiConfig, fetchOptions);
    if (task.apiConfig.adhoc && workGroupingImpl === workGroupingWithAdhoc) {
        if (!task.canGroupInExecute()) {
            console.warn('adhoc tasks must be groupable');
        }
        const adhocTimeoutId = window.setTimeout(() => {
            // Специально выполняем через workGrouping, чтобы запрос выполнился через execute
            workGroupingImpl(queue, overrideApiConfig, fetchOptions, task.apiConfig.enableForks);
        }, task.apiConfig.adhoc.timeout);
        adhocTimeoutIds.set(task, adhocTimeoutId);
        adhocQueue.push(task);
        return task.promise;
    }
    if (task.canGroupInExecute()) {
        // @ts-expect-error TS0000: Временный код для поиска проблемы фонящей в Sentry
        // eslint-disable-next-line no-restricted-syntax
        if (window?.vk?.pe['frontend.add_stack_to_groups_join_api'] && method === 'groups.join') {
            const apiGroupsTestError = new Error('Call api.groups.join in execute: ' + (meta?.source ?? ''));
            getClient()?.captureException(apiGroupsTestError);
        }
        queue.push(task);
        timeoutId && window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            workGroupingImpl(queue, overrideApiConfig, fetchOptions, task.apiConfig.enableForks);
        }, 0);
    }
    else {
        task.setGrouping(false);
        request(task);
    }
    return task.promise;
}
/**
 * @deprecated
 * @see {workGroupingWithAdhoc}
 * @param overrideApiConfig
 * @param fetchOptions
 * @param enableForks
 */
async function workGrouping(queue, overrideApiConfig, fetchOptions = {}, enableForks) {
    if (queue.length === 1) {
        const currentTask = queue.shift();
        request(currentTask);
        currentTask.setGrouping(false);
    }
    else {
        const tasks = [];
        const forks = [];
        const results = [];
        for (let i = 0; i < queue.length; i += 1) {
            if (!queue[i].canGroupInExecute()) {
                continue;
            }
            const task = queue.splice(i, 1)[0];
            i -= 1;
            tasks.push(task);
            if (enableForks && queue.length !== 0) {
                forks.push(`'${task.method}': fork(${task})`);
                results.push(`wait(forks['${task.method}'])`);
            }
            if (tasks.length >= 25) {
                break;
            }
        }
        let code = `return [${tasks.join(',')}];`;
        if (enableForks) {
            const lastTask = tasks[tasks.length - 1];
            code = `
        var forks = { ${forks.join(',')} };

        return [${results.join(',')},${lastTask}];
      `;
        }
        const currentTask = new RequestTask('execute', { code }, getApiConfig(), overrideApiConfig, fetchOptions);
        currentTask.setGrouping(true);
        request(currentTask);
        try {
            const result = await currentTask.promise;
            let errors = 0;
            result.response.forEach((response, i) => {
                if (response !== false) {
                    tasks[i].resolve(response);
                    return;
                }
                rejectWithApiError(tasks[i], {
                    type: APIErrorType.API_ERROR,
                    error: result.execute_errors[errors],
                });
                errors += 1;
            });
        }
        catch (error) {
            tasks.forEach((task) => rejectWithApiError(task, error));
        }
    }
    if (queue.length > 0) {
        window.setTimeout(() => workGrouping(queue, overrideApiConfig, fetchOptions, enableForks), 1000);
    }
}
async function workGroupingWithAdhoc(queue, overrideApiConfig, fetchOptions = {}, enableForks) {
    if (queue.length === 1 && adhocQueue.length === 0) {
        const currentTask = queue.shift();
        request(currentTask);
        currentTask.setGrouping(false);
    }
    else {
        const forks = [];
        const results = [];
        let remainingCapacity = BATCH_CAPACITY;
        const adhocTasks = [];
        const commonTasks = [];
        for (let i = 0; i < adhocQueue.length; i += 1) {
            if (adhocTasks.length >= BATCH_ADHOC_CAPACITY) {
                break;
            }
            if (!adhocQueue[i].canGroupInExecute()) {
                continue;
            }
            const task = adhocQueue.splice(i, 1)[0];
            i -= 1;
            remainingCapacity -= 1;
            // Удаляем таймаут только после фактического добавления в очередь исполнения
            clearTimeout(adhocTimeoutIds.get(task));
            adhocTimeoutIds.delete(task);
            adhocTasks.push(task);
            if (enableForks && queue.length !== 0) {
                forks.push(`'${task.method}': fork(${task})`);
                results.push(`wait(forks['${task.method}'])`);
            }
        }
        for (let i = 0; i < queue.length; i += 1) {
            if (remainingCapacity === 0) {
                break;
            }
            if (!queue[i].canGroupInExecute()) {
                continue;
            }
            const task = queue.splice(i, 1)[0];
            i -= 1;
            remainingCapacity -= 1;
            commonTasks.push(task);
            if (enableForks && queue.length !== 0) {
                forks.push(`'${task.method}': fork(${task})`);
                results.push(`wait(forks['${task.method}'])`);
            }
        }
        const tasks = [...commonTasks, ...adhocTasks];
        let code = `return [${tasks.join(',')}];`;
        if (enableForks) {
            const lastTask = tasks[tasks.length - 1];
            code = `
        var forks = { ${forks.join(',')} };

        return [${results.join(',')},${lastTask}];
      `;
        }
        const currentTask = new RequestTask('execute', { code }, getApiConfig(), overrideApiConfig, fetchOptions);
        currentTask.setGrouping(true);
        request(currentTask);
        try {
            const result = await currentTask.promise;
            let errors = 0;
            result.response.forEach((response, i) => {
                if (response !== false) {
                    tasks[i].resolve(response);
                    return;
                }
                rejectWithApiError(tasks[i], {
                    type: APIErrorType.API_ERROR,
                    error: result.execute_errors[errors],
                });
                errors += 1;
            });
        }
        catch (error) {
            tasks.forEach((task) => rejectWithApiError(task, error));
        }
    }
    if (queue.length > 0) {
        window.setTimeout(() => {
            workGroupingWithAdhoc(queue, overrideApiConfig, fetchOptions, enableForks);
        }, 1000);
    }
}
function lsGetItem(key) {
    try {
        return window.localStorage?.getItem(key);
    }
    catch (e) {
        return null;
    }
}
function shouldRetryLogin(error, task) {
    const { error_code: code, error_msg: errorMessage } = error;
    if (task.overrideApiConfig?.accessToken) {
        return false;
    }
    if (code === API_ERROR_AUTH_ANONYMOUS_TOKEN_HAS_EXPIRED) {
        return true;
    }
    if (code === API_ERROR_AUTH || code === API_ERROR_APP_AUTH) {
        // Обычно ошибки с этими кодами означают, что токен устарел или был инвалидирован, но проблема не всегда в этом.
        // Если не подошёл тип токена, то релогин не поможет. Отличить такие мы можем только по строке error_msg.
        if (errorMessage.endsWith('method is unavailable with service token.') ||
            errorMessage.endsWith('method is unavailable with anonymous token.')) {
            return false;
        }
        return true;
    }
    return false;
}
async function request(task) {
    const captchaSid = task.methodParams.captcha_sid;
    const cuaSession = task.methodParams.session;
    if ((activeCaptchaRequest && activeCaptchaRequest.sid !== captchaSid) ||
        (activeCuaRequest && activeCuaRequest.session !== cuaSession)) {
        rejectWithApiError(task, {
            type: APIErrorType.API_ERROR,
            error: {
                error_code: 0,
                error_msg: 'Ddos limit exceeded',
                error_text: 'Ddos limit exceeded',
            },
        });
    }
    const { domain, formattedExecuteResponse } = task.apiConfig;
    const apiQueryParams = makeParams(task.queryParams);
    const url = `https://${domain}/method/${task.method}?${apiQueryParams}`;
    const params = Object.assign({
        [CUA_STATE_PARAM]: (lsGetItem(STORAGE_CUA_STATE) || '').trim() || undefined,
        [CUA_SESSION_PARAM]: cuaSession || undefined,
    }, task.methodParams, task.bodyParams);
    const retryKey = getRequestHash(url, task.methodParams);
    const reLoginAttempt = reLoginRetries.get(retryKey) || reLoginRetries.create(retryKey, task.apiConfig.maxRetries);
    const reApiAttempt = reApiRetries.get(retryKey) || reApiRetries.create(retryKey, task.apiConfig.maxRetries);
    try {
        await waitTimeExp(reLoginAttempt.get() || reApiAttempt.get());
        const response = await corsRequest(url, params, task.fetchOptions);
        // Hitman. Не переносить ниже. Это должен быть первый обработчик ответа, до капчи или любых других перехватчиков.
        if (task.apiConfig.challenge?.(response)) {
            // Внутри challenge должен произойти редирект, так что этот код никогда не исполнится.
            // Но на всякий случай пусть лучше бросает ошибку, если вдруг внутри challenge что-то изменится.
            // Если убрать setTimeout и синхронно бросать ошибку, то до редиректа успевает промелькнуть сообщение об ошибке.
            setTimeout(() => {
                rejectWithApiError(task, {
                    type: APIErrorType.API_ERROR,
                    error: {
                        error_code: 0,
                        error_msg: 'Unknown',
                        error_text: 'Unknown',
                    },
                });
            }, 10_000);
            return;
        }
        const data = await response.json();
        if (data.response !== undefined) {
            reLoginRetries.delete(retryKey);
            reApiRetries.delete(retryKey);
            if (activeCaptchaRequest && activeCaptchaRequest.sid === captchaSid) {
                activeCaptchaRequest.task?.resolve(undefined);
                activeCaptchaRequest = null;
                task.apiConfig.onCaptchaSuccess?.();
            }
            if (activeCuaRequest && activeCuaRequest.session === cuaSession) {
                activeCuaRequest.task?.resolve(undefined);
                activeCuaRequest = null;
                task.apiConfig.onCuaSuccess?.();
            }
            if (data.execute_errors) {
                if (formattedExecuteResponse) {
                    task.resolve({
                        response: data.response || [],
                        execute_errors: data.execute_errors,
                    });
                }
                else {
                    if (task.grouping) {
                        task.resolve({
                            response: data.response || [],
                            execute_errors: data.execute_errors,
                        });
                    }
                    else {
                        task.resolve({
                            ...data.response,
                            execute_errors: data.execute_errors,
                        });
                    }
                }
                return;
            }
            if (task.grouping) {
                task.resolve({
                    response: data.response,
                });
            }
            else {
                task.resolve(data.response);
            }
            return;
        }
        const error = data.error;
        if (!error) {
            rejectWithApiError(task, {
                type: APIErrorType.API_ERROR,
                error: {
                    error_code: 0,
                    error_msg: 'Unknown',
                    error_text: 'Unknown',
                },
            });
            return;
        }
        if (task.apiConfig.onCaptcha && error?.error_code === API_ERROR_CAPTCHA) {
            handleCaptchaError(error, task, captchaSid);
            return;
        }
        if (activeCaptchaRequest && activeCaptchaRequest.sid === captchaSid) {
            activeCaptchaRequest.task?.resolve(undefined);
            activeCaptchaRequest = null;
            task.apiConfig.onCaptchaSuccess?.();
        }
        if (task.apiConfig.onCua && error?.error_code === API_ERROR_CUA_2_CONFIRMATION_REQUIRED) {
            handleCuaError(error, task);
            return;
        }
        if (activeCuaRequest && activeCuaRequest.session === captchaSid) {
            activeCuaRequest.task?.resolve(undefined);
            activeCuaRequest = null;
            task.apiConfig.onCuaSuccess?.();
        }
        if (task.apiConfig.maxRetries === 0) {
            rejectWithApiError(task, {
                type: APIErrorType.API_ERROR,
                error: error,
            });
            return;
        }
        if (reLoginAttempt.isExceeded() || reApiAttempt.isExceeded()) {
            reLoginRetries.delete(retryKey);
            reApiRetries.delete(retryKey);
            rejectWithApiError(task, {
                type: APIErrorType.API_ERROR,
                error: {
                    error_code: error.error_code,
                    error_msg: 'Maximum of api retries exceeded',
                    error_text: error.error_text,
                },
            });
            return;
        }
        if (isNotAllowedToMakeMoreRequests(error.error_code)) {
            reApiAttempt.increment();
            reLoginRetries.delete(retryKey);
            request(task);
            return;
        }
        else {
            reApiRetries.delete(retryKey);
        }
        if (task.apiConfig.onTokenExpired && shouldRetryLogin(error, task)) {
            const result = await task.apiConfig.onTokenExpired();
            reLoginAttempt.increment();
            setApiConfig({
                accessToken: result,
            });
            task.setAccessToken(result);
            request(task);
            return;
        }
        else {
            reLoginRetries.delete(retryKey);
        }
        rejectWithApiError(task, {
            type: APIErrorType.API_ERROR,
            error: data.error,
        });
    }
    catch (error) {
        if (activeCaptchaRequest && activeCaptchaRequest.sid === captchaSid) {
            activeCaptchaRequest = null;
            task.apiConfig.onCaptchaSuccess?.();
        }
        task.reject({
            type: APIErrorType.NETWORK_ERROR,
            error,
        });
    }
}
async function handleCaptchaError(error, task, captchaSid) {
    if (!task.apiConfig.onCaptcha) {
        return;
    }
    const { captcha_sid, captcha_img, captcha_height, captcha_width, captcha_attempt, captcha_ts, is_refresh_enabled, is_sound_captcha_available, captcha_track, is_enabled_vkui, uiux_changes, redirect_uri, } = error;
    if (activeCaptchaRequest) {
        /**
         * Если это ответ от резолва старой капчи, значит мы ввели ее неправильно
         */
        if (activeCaptchaRequest.sid === captchaSid) {
            const newCaptchaTask = new PendingTask();
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax, @vkontakte-internal/vkcom-plugins/no-then
            newCaptchaTask.get().then(activeCaptchaRequest.task.resolve).catch(activeCaptchaRequest.task.reject);
            activeCaptchaRequest = {
                sid: captcha_sid,
                task: newCaptchaTask,
            };
        }
        else {
            // Дожидаемся резолва капчи и ретраим запрос
            await activeCaptchaRequest.task.get();
            await request(task);
            return;
        }
    }
    else {
        activeCaptchaRequest = {
            sid: captcha_sid,
            task: new PendingTask(),
        };
    }
    try {
        const result = await task.apiConfig.onCaptcha({
            captcha_sid,
            captcha_img,
            captcha_height,
            captcha_width,
            is_refresh_enabled,
            is_sound_captcha_available,
            captcha_track,
            is_enabled_vkui,
            uiux_changes,
            redirect_uri,
        });
        const additionalCaptchaParams = { captcha_ts, captcha_attempt };
        const newParams = Object.assign({}, task.methodParams, result, additionalCaptchaParams);
        task.setParams(newParams);
        // Captcha is not affect of retry count
        request(task);
    }
    catch (error) {
        activeCaptchaRequest = null;
        task.reject({
            type: APIErrorType.API_ERROR,
            error: error,
        });
    }
}
async function handleCuaError(error, task) {
    if (!task.apiConfig.onCua) {
        return;
    }
    const { cua_session } = error;
    if (activeCuaRequest) {
        if (activeCuaRequest.session === cua_session) {
            const newCuaTask = new PendingTask();
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax, @vkontakte-internal/vkcom-plugins/no-then
            newCuaTask.get().then(activeCuaRequest.task.resolve).catch(activeCuaRequest.task.reject);
            activeCuaRequest = {
                session: cua_session,
                task: newCuaTask,
            };
        }
        else {
            // Дожидаемся резолва CUA и ретраим запрос
            await activeCuaRequest.task.get();
            await request(task);
            return;
        }
    }
    else {
        activeCuaRequest = {
            session: cua_session,
            task: new PendingTask(),
        };
    }
    try {
        const result = await task.apiConfig.onCua({
            cua_session,
        });
        const newParams = Object.assign({}, task.methodParams, result);
        task.setParams(newParams);
        // CUA не учитывается как ретрай
        request(task);
    }
    catch (error) {
        activeCuaRequest = null;
        task.reject({
            type: APIErrorType.CUA_ERROR,
            error: error,
        });
    }
}
export async function upload(url, formData) {
    // eslint-disable-next-line no-restricted-globals
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
    });
    return response.json();
}
export function apiBeacon(method, methodParams, overrideApiConfig) {
    const task = new RequestTask(method, methodParams, getApiConfig(), overrideApiConfig);
    const { domain } = task.apiConfig;
    const apiQueryParams = makeParams(task.queryParams);
    const url = `https://${domain}/method/${task.method}?${apiQueryParams}`;
    const params = Object.assign({}, task.methodParams, task.bodyParams);
    return navigator.sendBeacon(url, toFormData(params));
}
//# sourceMappingURL=index.js.map