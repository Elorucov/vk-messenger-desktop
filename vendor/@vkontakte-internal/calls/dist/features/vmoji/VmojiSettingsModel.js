import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { VmojiService } from '../../services/vmoji';
import { LayoutService } from '../../services/layout';
import { AccountService } from '../../services/account';
let VmojiSettingsModel = class VmojiSettingsModel {
    constructor(accountService, layoutService, vmojiService) {
        this.accountService = accountService;
        this.layoutService = layoutService;
        this.vmojiService = vmojiService;
        this.toggleMyVmoji = () => {
            this.vmojiService.toggleMyVmoji();
        };
        makeAutoObservable(this);
    }
    get myAnimatedAvatarUrl() {
        return this.accountService.getAnimatedAvatar()?.url;
    }
    get isVmojiPreviewGenerated() {
        return this.vmojiService.isPreviewGenerated;
    }
    get isVmojiCapture() {
        return this.vmojiService.isCapture;
    }
    get vmojiPreviewSrc() {
        return this.vmojiService.vmojiPreviewSrc;
    }
    get loadingStatus() {
        return this.vmojiService.loadingStatus;
    }
    loadCharacterId() {
        this.vmojiService.loadCharacterId();
    }
    startCreateCharacter() {
        this.vmojiService.startCreateCharacter();
        this.layoutService.collapseCall();
    }
    startEditCharacter() {
        this.vmojiService.startEditCharacter();
        this.layoutService.collapseCall();
    }
};
VmojiSettingsModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [AccountService,
        LayoutService,
        VmojiService])
], VmojiSettingsModel);
export { VmojiSettingsModel };
export const { useModel: useVmojiSettingsModel, Provider: VmojiSettingsModelProvider } = createProvider(VmojiSettingsModel);
//# sourceMappingURL=VmojiSettingsModel.js.map