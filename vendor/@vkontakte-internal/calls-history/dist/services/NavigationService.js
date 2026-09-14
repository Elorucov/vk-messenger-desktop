import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
let NavigationService = class NavigationService {
};
NavigationService = __decorate([
    scope.container()
], NavigationService);
export { NavigationService };
export const createNavigationServiceImplementation = (navigateToConvo, navigateToProfile) => {
    let NavigationServiceImpl = class NavigationServiceImpl {
        constructor() {
            this.navigateToConvo = (...args) => {
                return navigateToConvo(...args);
            };
            this.navigateToProfile = (...args) => {
                return navigateToProfile(...args);
            };
        }
    };
    NavigationServiceImpl = __decorate([
        scope.container()
    ], NavigationServiceImpl);
    return NavigationServiceImpl;
};
//# sourceMappingURL=NavigationService.js.map