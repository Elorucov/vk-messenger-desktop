import { __decorate, __metadata } from "tslib";
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { AsrService } from '../../services/asr';
import { OnboardingService } from '../../services/onboarding';
let OnboardingNotificationModel = class OnboardingNotificationModel {
    constructor(props, asrService, onboardingService) {
        this.props = props;
        this.asrService = asrService;
        this.onboardingService = onboardingService;
        this.toggleAsrPopup = () => {
            this.asrService.toggleAsrPopup();
        };
        this.onOpenWatchTogetherFeature = () => {
            this.onboardingService.onOpenWatchTogetherFeature();
        };
        this.onOpenVmojiFeature = () => {
            this.onboardingService.onOpenVmojiFeature();
        };
        this.onStartSubtitlesFeature = () => {
            this.onboardingService.onStartSubtitlesFeature();
        };
        makeAutoObservable(this);
    }
    get closeOnboardingBanner() {
        return this.props.current.closeOnboardingBanner;
    }
    get onboardingFeature() {
        return this.props.current.onboardingFeature;
    }
    get isMeCanManageAsr() {
        return this.asrService.isMeCanManageAsr;
    }
    get asr() {
        return this.asrService.asr;
    }
};
OnboardingNotificationModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        AsrService,
        OnboardingService])
], OnboardingNotificationModel);
export { OnboardingNotificationModel };
export const { Provider: OnboardingNotificationModelProvider, useModel: useOnboardingNotificationModel } = createProvider(OnboardingNotificationModel);
//# sourceMappingURL=OnboardingNotificationModel.js.map