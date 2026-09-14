import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { ScreenShareActionsService } from '../../../../services/screenShare/ScreenShareActionsService';
import { LocalDeviceService } from '../../../../services/localDevice';
import { ClickHouseEventType, getSharingMiniAppParticipantId } from '@vkontakte-internal/calls-core';
import { StateBridge } from '../../../../utils/stateBridge';
import { LangUtils } from '../../../../services/Lang';
import { ClickHouseService } from '../../../../services/shared/ClickHouseService';
import { MiniAppId } from '../../constants';
import { WhiteBoardStatEventReason } from '../constants';
import { CallService } from '../../../../services/call';
import { debugMessage, DebugMessageType, stopUrlSharing } from '@vkontakte/calls-sdk';
import { logFeatureError } from '../../utils';
import { WatchTogetherService } from '../../../watchTogether/services/WatchTogetherService';
import { WatchTogetherActionsService } from '../../../watchTogether/services/WatchTogetherActionsService';
import { CallsConfigService } from '../../../../services/config';
import { PinnedParticipantService } from '../../../../services/PinnedParticipantService';
let WhiteboardModel = class WhiteboardModel {
    constructor(stateBridge, localDeviceService, langUtils, clickHouseService, screenShareActionsService, callService, watchTogetherService, watchTogetherActionsService, configService, pinnedParticipantService) {
        this.stateBridge = stateBridge;
        this.localDeviceService = localDeviceService;
        this.langUtils = langUtils;
        this.clickHouseService = clickHouseService;
        this.screenShareActionsService = screenShareActionsService;
        this.callService = callService;
        this.watchTogetherService = watchTogetherService;
        this.watchTogetherActionsService = watchTogetherActionsService;
        this.configService = configService;
        this.pinnedParticipantService = pinnedParticipantService;
        this.startSharing = () => {
            this.clickHouseService.sendStats(ClickHouseEventType.WHITE_BOARD_STARTED, {
                reason: WhiteBoardStatEventReason.MINIAPP,
            });
            if (this.localDeviceService.device.mediaSettings.isScreenSharingEnabled) {
                this.screenShareActionsService.handleStopScreenShare();
            }
            if (this.localDeviceService.externalId) {
                this.callService.toggleUrlSharingForParticipant(true, this.localDeviceService.externalId);
            }
            this.localDeviceService.showSharedMiniApp(MiniAppId.WHITEBOARD);
        };
        this.handleWhiteBoardToggle = () => {
            if (this.isAppSharedFromMyDevice) {
                this.clickHouseService.sendStats(ClickHouseEventType.WHITE_BOARD_STOPPED, {
                    reason: WhiteBoardStatEventReason.MINIAPP,
                });
                this.localDeviceService.hideSharedMiniApp();
                stopUrlSharing().catch(logFeatureError);
            }
            else if (this.watchTogetherService.movieInfo) {
                // Только админ может шарить доску, соответственно он может отключать СП
                // TODO dialog ???
                this.watchTogetherActionsService
                    .handleRemoveMovie(this.watchTogetherService.movieInfo.movieId)
                    .then(() => {
                    // Нужно вручную убрать пин, потому что событие остановки прилетит позже
                    // и пин для СП сохраняется до его прихода
                    this.pinnedParticipantService.setWatchTogetherPinnedParticipant(null);
                    this.startSharing();
                })
                    .catch((error) => {
                    debugMessage(DebugMessageType.ERROR, error);
                });
            }
            else {
                this.startSharing();
            }
        };
        makeAutoObservable(this);
    }
    get isAppSharedFromMyDevice() {
        return this.localDeviceService.isSharedMiniAppShownFromMe;
    }
    get isAppSharedByAnother() {
        const sharingUrlParticipantId = getSharingMiniAppParticipantId(this.stateBridge);
        return !!sharingUrlParticipantId && sharingUrlParticipantId.id !== this.localDeviceService.externalId?.id;
    }
    get tooltip() {
        return this.isAppSharedByAnother
            ? this.langUtils.getLang('calls_interactive_board_is_shared_by_another')
            : this.isAppSharedFromMyDevice
                ? this.langUtils.getLang('calls_stop_interactive_board')
                : this.langUtils.getLang('calls_interactive_board');
    }
    get config() {
        return this.configService.getConfig();
    }
};
WhiteboardModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        LocalDeviceService,
        LangUtils,
        ClickHouseService,
        ScreenShareActionsService,
        CallService,
        WatchTogetherService,
        WatchTogetherActionsService,
        CallsConfigService,
        PinnedParticipantService])
], WhiteboardModel);
export { WhiteboardModel };
export const { Provider, useModel } = createProvider(WhiteboardModel);
//# sourceMappingURL=WhiteboardModel.js.map