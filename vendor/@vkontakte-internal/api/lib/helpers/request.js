import VKBridge from '@vkontakte/vk-bridge';
import { generateId } from '../utils/generateId';
import { getExecuteMethod } from '../utils/getExecuteMethod';
export class APIRequest {
    constructor({ api, method, params = {}, options = {} }) {
        this.retries = 0;
        this.api = api;
        this.method = method;
        this.params = { ...params };
        this.options = { ...options };
        this.options.abortController ??= new AbortController();
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    /**
     * Возвращает строку для execute
     */
    toString() {
        return getExecuteMethod(this.method, this.params);
    }
    buildParams(params = {}) {
        const { options: { token, version, language } } = this.api;
        return Object.fromEntries([
            ...Object.entries({
                ...(!this.isCustomMethod && {
                    v: version,
                    access_token: token,
                }),
                lang: language,
                ...params
            }),
            ...this.api.globalParams.entries()
        ]
            .filter(([, value]) => value !== undefined));
    }
    /**
     * Возвращает отфильтрованные параметры
     */
    get filteredParams() {
        return this.buildParams(this.params);
    }
    get isCustomMethod() {
        const { requestMethod } = this.api.options;
        return typeof requestMethod === 'function';
    }
    /**
     * Отправка запроса
     */
    async make() {
        const { options: { timeout, requestMethod } } = this.api;
        this.timeout = setTimeout(() => this.options.abortController?.abort(), timeout);
        try {
            if (this.isCustomMethod) {
                return await this.custom();
            }
            return await this[requestMethod]();
        }
        finally {
            clearTimeout(this.timeout);
        }
    }
    /**
     * Выполняет запрос с использованием fetch
     */
    fetch() {
        const { abortController, body: customBody } = this.options;
        const { options: { baseUrl, } } = this.api;
        const url = new URL(`/method/${this.method}`, baseUrl);
        if (customBody !== undefined) {
            url.search = (new URLSearchParams(this.buildParams())).toString();
        }
        return fetch(url, {
            method: 'POST',
            signal: abortController?.signal,
            headers: {
                connection: 'keep-alive'
            },
            body: customBody ?? new URLSearchParams(this.filteredParams)
        })
            .then((response) => response.json());
    }
    /**
     * Выполняет запрос с использованием VK Bridge
     */
    bridge() {
        const { abortController, } = this.options;
        return new Promise((resolve, reject) => {
            if (abortController?.signal.aborted) {
                reject(abortController.signal.reason);
            }
            abortController?.signal.addEventListener('abort', () => {
                reject(abortController.signal.reason);
            });
            VKBridge.send('VKWebAppCallAPIMethod', {
                method: this.method,
                // @ts-expect-error
                params: this.filteredParams
            })
                .then(resolve)
                .catch((error) => {
                const { error_data } = error;
                resolve({
                    error: error_data?.error_reason || error_data || error
                });
            });
        });
    }
    /**
     * Выполняет запрос при помощи подключения inline-скрипта к странице
     */
    script() {
        const { abortController, } = this.options;
        const { options: { baseUrl, } } = this.api;
        return new Promise((resolve, reject) => {
            if (abortController?.signal.aborted) {
                reject(abortController.signal.reason);
            }
            const callback = generateId(20);
            const params = new URLSearchParams(this.filteredParams);
            params.set('callback', callback);
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = new URL(`/method/${this.method}?${params}`, baseUrl)
                .toString();
            // @ts-expect-error TS7015: Динамически модифицируем объект
            window[callback] = (data) => {
                script.remove();
                // @ts-expect-error TS7015: Динамически модифицируем объект
                delete window[callback];
                resolve(data);
            };
            abortController?.signal.addEventListener('abort', () => {
                script.remove();
                // @ts-expect-error TS7015: Динамически модифицируем объект
                delete window[callback];
                reject(abortController.signal.reason);
            });
            document.head.appendChild(script);
        });
    }
    custom() {
        const { abortController, } = this.options;
        const { requestMethod } = this.api.options;
        if (typeof requestMethod !== 'function') {
            return;
        }
        return new Promise((resolve, reject) => {
            if (abortController?.signal.aborted) {
                reject(abortController.signal.reason);
            }
            abortController?.signal.addEventListener('abort', () => {
                reject(abortController.signal.reason);
            });
            requestMethod(this.method, this.filteredParams)
                .then(resolve)
                .catch(reject);
        });
    }
}
//# sourceMappingURL=request.js.map