import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { ApiNamespace } from '../ApiNamespace';
let OnboardingApi = class OnboardingApi extends ApiNamespace {
    constructor() {
        super(...arguments);
        this.getOnboardings = this.makeMethod('get');
        this.interactOnboarding = this.makeMethod('interact');
    }
    get namespace() {
        return 'onboarding';
    }
};
OnboardingApi = __decorate([
    scope.global()
], OnboardingApi);
export { OnboardingApi };
//# sourceMappingURL=OnboardingApi.js.map