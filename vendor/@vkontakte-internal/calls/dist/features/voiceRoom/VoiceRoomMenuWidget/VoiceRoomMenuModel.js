import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { VmojiService } from '../../../services/vmoji';
import { SubtitlesService } from '../../../services/subtitles';
import { StreamActionSettingsService } from '../../../services/streamActionSettings';
import { OnboardingService } from '../../../services/onboarding';
import { PermissionsService } from '../../../services/permissions';
import { StateBridge } from '../../../utils/stateBridge';
import { WatchTogetherPermissionService } from '../../watchTogether/services/WatchTogetherPermissionService';
import { WatchTogetherService } from '../../watchTogether/services/WatchTogetherService';
let VoiceRoomMenuModel = class VoiceRoomMenuModel {
    constructor(vmojiService, subtitlesService, streamActionSettingsService, onboardingService, permissionsService, stateBridge, watchTogetherService, watchTogetherPermissionService) {
        this.vmojiService = vmojiService;
        this.subtitlesService = subtitlesService;
        this.streamActionSettingsService = streamActionSettingsService;
        this.onboardingService = onboardingService;
        this.permissionsService = permissionsService;
        this.stateBridge = stateBridge;
        this.watchTogetherService = watchTogetherService;
        this.watchTogetherPermissionService = watchTogetherPermissionService;
        this.toggleVmoji = () => {
            this.onboardingService.closeOnboardingBannerIfVmojiOpen(this.vmojiService.isCapture);
            this.vmojiService.toggleVmoji();
        };
        this.toggleSubtitles = (clickSource) => {
            this.onboardingService.closeOnboardingBannerIfASROpen(this.vmojiService.isCapture);
            this.subtitlesService.toggleSubtitles(clickSource);
        };
        this.getRecordActionSettings = () => {
            return this.streamActionSettingsService.getRecordSettings();
        };
        this.onOpenWatchTogetherFeature = () => {
            this.onboardingService.onOpenWatchTogetherFeature();
        };
        makeAutoObservable(this);
    }
    get isSubtitlesFeatureEnabled() {
        return this.subtitlesService.isSubtitlesFeatureEnabled;
    }
    get isSubtitlesEnabled() {
        return this.subtitlesService.isEnabled;
    }
    get isMeCanManageWatchTogether() {
        return this.watchTogetherPermissionService.isMeCanManageWatchTogether;
    }
    get watchTogetherOwner() {
        return this.watchTogetherService.owner;
    }
};
VoiceRoomMenuModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [VmojiService,
        SubtitlesService,
        StreamActionSettingsService,
        OnboardingService,
        PermissionsService,
        StateBridge,
        WatchTogetherService,
        WatchTogetherPermissionService])
], VoiceRoomMenuModel);
export { VoiceRoomMenuModel };
export const { useModel: useVoiceRoomMenuModel, Provider: VoiceRoomMenuModelProvider } = createProvider(VoiceRoomMenuModel);
//# sourceMappingURL=VoiceRoomMenuModel.js.map