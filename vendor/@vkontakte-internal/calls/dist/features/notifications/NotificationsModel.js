import { __decorate, __metadata } from "tslib";
import { createProvider, scope, update } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { AdminMessagesModel } from '../adminMessages';
import { DisabledBannersService } from '../../services/disabledBanners';
import { OnboardingService } from '../../services/onboarding/OnboardingService';
import { VmojiService } from '../../services/vmoji';
/**
 * Пока не используется вместо redux
 * достаточно transient
 */
let NotificationsModel = class NotificationsModel {
    constructor(adminMessages, disabledBannersService, onboardingService, vmojiService) {
        this.adminMessages = adminMessages;
        this.disabledBannersService = disabledBannersService;
        this.onboardingService = onboardingService;
        this.vmojiService = vmojiService;
        this.closeOnboardingBanner = () => {
            this.onboardingService.closeOnboardingBanner(this.vmojiService.isCapture);
        };
        makeAutoObservable(this);
    }
    get shouldShowAdminMessages() {
        return this.adminMessages.shouldShowMessages;
    }
    get enableDesktopAppNotification() {
        return this.disabledBannersService.enableDesktopAppNotification;
    }
    get isOnboardingBannerOpen() {
        return this.onboardingService.isOnboardingBannerOpen;
    }
    get onboardingFeatureType() {
        return this.onboardingService.featureType;
    }
    [update]() {
        this.onboardingService.setInitialFeature(this.vmojiService.isCapture);
    }
};
NotificationsModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [AdminMessagesModel,
        DisabledBannersService,
        OnboardingService,
        VmojiService])
], NotificationsModel);
export { NotificationsModel };
export const { Provider: NotificationsModelProvider, useModel: useNotificationsModel } = createProvider(NotificationsModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=NotificationsModel.js.map