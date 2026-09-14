import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
let NavigationService = class NavigationService {
};
NavigationService = __decorate([
    scope.container({ abstract: true })
], NavigationService);
export { NavigationService };
export const createNavServiceImplementation = ({ navigateToConvo, navigateToProfile, }) => {
    let NavigationServiceImpl = class NavigationServiceImpl {
        constructor() {
            this.navigateToConvo = navigateToConvo;
            this.navigateToProfile = navigateToProfile;
        }
    };
    NavigationServiceImpl = __decorate([
        scope.container()
    ], NavigationServiceImpl);
    return NavigationServiceImpl;
};
//# sourceMappingURL=NavigationService.js.map