import { __decorate, __metadata } from "tslib";
import { API_VERSION } from '@vkontakte-internal/api-schema-typescript';
import { scope } from '@vkontakte-internal/di';
import { ApiPrefetch } from '../ApiPrefetch';
import { APIClient } from '../APIClient';
/**
 * Базовый класс для API-класса с прикрепленным неймспейсом
 */
let ApiNamespace = class ApiNamespace {
    constructor(apiClient, apiPrefetch) {
        this.apiClient = apiClient;
        this.apiPrefetch = apiPrefetch;
    }
    /**
     * Создает функцию для обращения к конкретному методу API неймспейса
     *
     * @param name название метода без указания неймспейса
     * @param withPrefetch
     */
    makeMethod(name, withPrefetch) {
        return async (params, options) => {
            const method = `${this.namespace}.${name}`;
            if (withPrefetch) {
                const apiVersion = options?.version ?? API_VERSION;
                // TODO: Подумать над нормальным решением
                if (typeof window !== 'undefined' && window.apiPrefetchReadyPromise) {
                    await window.apiPrefetchReadyPromise;
                }
                try {
                    const cache = this.apiPrefetch?.loadPrefetchCache(method, apiVersion, params);
                    if (cache) {
                        return cache;
                    }
                }
                catch (err) {
                    console.error(err);
                    throw err;
                }
            }
            return this.apiClient.request(method, params, options);
        };
    }
};
ApiNamespace = __decorate([
    scope.global({ abstract: true }),
    __metadata("design:paramtypes", [APIClient,
        ApiPrefetch])
], ApiNamespace);
export { ApiNamespace };
//# sourceMappingURL=ApiNamespace.js.map