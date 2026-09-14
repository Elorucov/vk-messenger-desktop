import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { CallsSdkService } from '../sdk';
import { hideSharedMiniApp } from '../../features/miniApps/actions';
import { DebugMessageType } from '@vkontakte/calls-sdk';
import { StateBridge } from '../../utils/stateBridge';
import { LocalDeviceService } from '../localDevice/LocalDeviceService';
import { E_ACTION } from '../../constants';
import { Langs } from '@vkontakte-internal/plugins';
let ScreenShareActionsService = class ScreenShareActionsService {
    constructor(stateBridge, localDeviceService, sdkService, langs) {
        this.stateBridge = stateBridge;
        this.localDeviceService = localDeviceService;
        this.sdkService = sdkService;
        this.langs = langs;
        this.handleErrorScreenShare = () => {
            this.stateBridge.dispatch({
                type: E_ACTION.ERROR,
                text: this.sdk.browser.os() === 'MacOS' && this.sdk.browser.browserName()
                    ? this.langs.getLang('calls_error_disabled_screen_sharing_macos_chrome')
                    : this.langs.getLang('calls_error_disabled_screen_sharing'),
            });
        };
        this.handleStopScreenShare = () => {
            return this.sdk
                .captureScreen({
                captureScreen: false,
                captureAudio: false,
                fastScreenSharing: false,
            })
                .catch(this.handleErrorScreenShare);
        };
        this.toggleScreenShare = (isFastScreenShare = false) => {
            if (this.localDeviceService.isSharedMiniAppShownFromMe) {
                this.stateBridge.dispatch(hideSharedMiniApp(this.localDeviceService.device));
                this.sdk.stopUrlSharing().catch((err) => {
                    this.sdk.debugMessage(DebugMessageType.ERROR, err);
                });
            }
            return this.sdk
                .captureScreen({
                captureScreen: true,
                captureAudio: true,
                fastScreenSharing: isFastScreenShare,
            })
                .catch(this.handleErrorScreenShare);
        };
        this.handleStartFastScreenShare = () => {
            this.toggleScreenShare(true);
        };
        this.handleStartScreenShare = () => {
            this.toggleScreenShare();
        };
        makeAutoObservable(this);
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
};
ScreenShareActionsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [StateBridge,
        LocalDeviceService,
        CallsSdkService,
        Langs])
], ScreenShareActionsService);
export { ScreenShareActionsService };
//# sourceMappingURL=ScreenShareActionsService.js.map