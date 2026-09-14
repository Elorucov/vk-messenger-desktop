import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { api, login, upload } from '@vkontakte-internal/api-client';
/**
 * @deprecated Используется для обратной совместимости по аналогии с APIClientDeprecatedImpl.
 *  Если ваш код использует этот класс, значит он НЕ обернут в DI контейнер,
 *  но использует сущности новой архитектуры. Исправьте это, иначе код не будет работать в dev режиме.
 */
let APIClientMissingGlobalDeprecatedImpl = class APIClientMissingGlobalDeprecatedImpl {
    request(method, params, options = {}) {
        if (process.env.NODE_ENV === 'development') {
            throw new Error('APIClientMissingGlobalDeprecatedImpl usage is forbidden. Wrap your APP with DI root container ASAP');
        }
        return api(method, params, {
            ...(options.version !== undefined ? { version: options.version } : {}),
            ...(options.grouping !== undefined ? { grouping: options.grouping } : {}),
            ...(options.accessToken !== undefined ? { accessToken: options.accessToken } : {}),
        }, {
            signal: options?.signal,
        });
    }
    fetchWebToken(methodParams, overrideLoginConfig) {
        return login('web_token', methodParams, overrideLoginConfig);
    }
    fetchConnectExchangeHash(data) {
        return login('connect_exchange_hash', data);
    }
    fetchConnectExchangeToken(data) {
        return login('connect_exchange_token', data);
    }
    upload(url, formData) {
        return upload(url, formData);
    }
};
APIClientMissingGlobalDeprecatedImpl = __decorate([
    scope.global()
], APIClientMissingGlobalDeprecatedImpl);
export { APIClientMissingGlobalDeprecatedImpl };
//# sourceMappingURL=APIClientMissingGlobalDeprecatedImpl.js.map