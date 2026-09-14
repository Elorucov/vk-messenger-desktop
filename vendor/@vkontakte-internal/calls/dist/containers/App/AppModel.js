import { __decorate, __metadata } from "tslib";
import { isGroupCall, Mode, UIMode, ECallViewMode, } from '@vkontakte-internal/calls-core';
import { createProvider, Props, destroy, scope, init } from '@vkontakte-internal/di';
import { makeAutoObservable, reaction } from 'mobx';
import { CallsConfigService } from '../../services/config';
import { CallsSdkService } from '../../services/sdk';
import { CallsSdkSubscribeService } from '../../services/sdk/CallsSdkSubscribeService';
import { StreamRegistry } from '../../services/stream';
import { PictureInPictureService } from '../../features/simplePiP/models/PictureInPictureService';
import { RoomsService } from '../../features/rooms';
import { UpdateDisplayLayoutService } from '../../services/updateDisplayLayout/UpdateDisplayLayoutService';
import { StateBridge } from '../../utils/stateBridge';
import { DOMElementsSizeService } from '../../services/shared';
import { OnboardingService } from '../../services/onboarding';
import { CallsAnonymLongpollProcessor } from '../../services/queue';
import { isParticipantAnonym } from '../../helpers/participant';
import { PinnedParticipantService } from '../../services/PinnedParticipantService';
import { WatchTogetherService } from '../../features/watchTogether/services/WatchTogetherService';
let AppModel = class AppModel {
    constructor(_props, sdkService, streamRegistry, configService, anonymLongpollProcessor, pipService, roomsService, updateDisplayLayoutService, stateBridge, domElementSizeService, onboardingService, callsSdkSubscribeService, pinnedParticipantService, watchTogetherService) {
        this._props = _props;
        this.sdkService = sdkService;
        this.streamRegistry = streamRegistry;
        this.configService = configService;
        this.anonymLongpollProcessor = anonymLongpollProcessor;
        this.pipService = pipService;
        this.roomsService = roomsService;
        this.updateDisplayLayoutService = updateDisplayLayoutService;
        this.stateBridge = stateBridge;
        this.domElementSizeService = domElementSizeService;
        this.onboardingService = onboardingService;
        this.callsSdkSubscribeService = callsSdkSubscribeService;
        this.pinnedParticipantService = pinnedParticipantService;
        this.watchTogetherService = watchTogetherService;
        if (this.enableDIAnonymLongpollProcessor) {
            this.anonymLongpollProcessor.init();
        }
        makeAutoObservable(this);
        this._unsubscribeReaction = reaction(() => this.stateBridge.mode, (mode) => {
            if (mode === Mode.READY || mode === Mode.FEEDBACK) {
                this.roomsService.clear();
                this.watchTogetherService.clear();
                this.pinnedParticipantService.clear();
            }
        });
    }
    get enableDIAnonymLongpollProcessor() {
        return isParticipantAnonym(this.stateBridge.me);
    }
    [init]() {
        this.updateDisplayLayoutService.init();
        this.onboardingService.fetchHelpHintByFeature();
        this.callsSdkSubscribeService.init();
    }
    [destroy]() {
        this.updateDisplayLayoutService.clear();
        this.pinnedParticipantService.clear();
        this.streamRegistry.clear();
        this.roomsService.clear();
        this.callsSdkSubscribeService.clear();
        if (this.enableDIAnonymLongpollProcessor) {
            this.anonymLongpollProcessor.destroy();
        }
        this._unsubscribeReaction();
    }
    get props() {
        return this._props.current;
    }
    get bridge() {
        return this.props.getCallsBridge();
    }
    get callsSdk() {
        return this.sdkService.getSdk();
    }
    get callSounds() {
        return this.props.callSounds;
    }
    get config() {
        return this.configService.getConfig();
    }
    get onBeforeCallStart() {
        return this.props.onBeforeCallStart;
    }
    get onAfterCallFinish() {
        return this.props.onAfterCallFinish;
    }
    get streamUrlExtractor() {
        return this.props.streamUrlExtractor;
    }
    get tabIsMaster() {
        return this.props.tabIsMaster;
    }
    get pip() {
        return {
            enabled: this.pipService.isEnabled,
            supportApi: this.pipService.isSupportApi,
            running: this.pipService.isRunning,
        };
    }
    get roomId() {
        return this.roomsService.roomId;
    }
    get participantIdsByMyRoomId() {
        return this.roomsService.participantIdsByMyRoomId;
    }
    get callViewMode() {
        const { me, peer, uiMode, isOratorMode, callData } = this.stateBridge;
        const isGroupCallState = isGroupCall(me, peer, callData.topology);
        if (!isGroupCallState) {
            return ECallViewMode.P2P;
        }
        if (uiMode === UIMode.COLLAPSED) {
            return ECallViewMode.Collapsed;
        }
        if (isOratorMode) {
            return ECallViewMode.Orator;
        }
        return ECallViewMode.Grid;
    }
};
AppModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        CallsSdkService,
        StreamRegistry,
        CallsConfigService,
        CallsAnonymLongpollProcessor,
        PictureInPictureService,
        RoomsService,
        UpdateDisplayLayoutService,
        StateBridge,
        DOMElementsSizeService,
        OnboardingService,
        CallsSdkSubscribeService,
        PinnedParticipantService,
        WatchTogetherService])
], AppModel);
export { AppModel };
export const { Provider: AppModelProvider, useModel: useAppModel } = createProvider(AppModel, {
    isolatedContext: false,
    onlyTransient: true,
});
//# sourceMappingURL=AppModel.js.map