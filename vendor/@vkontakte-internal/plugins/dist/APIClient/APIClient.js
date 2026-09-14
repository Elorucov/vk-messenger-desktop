import { __decorate } from "tslib";
// eslint-disable-next-line no-restricted-imports
import { scope, rootContainer } from '@vkontakte-internal/di';
import { APIClientMissingGlobalDeprecatedImpl } from './APIClientMissingGlobalDeprecatedImpl';
let APIClient = class APIClient {
};
APIClient = __decorate([
    scope.global({ abstract: true })
], APIClient);
export { APIClient };
rootContainer.replace(APIClient, APIClientMissingGlobalDeprecatedImpl);
//# sourceMappingURL=APIClient.js.map