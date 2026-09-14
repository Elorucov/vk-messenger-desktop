import { __decorate, __metadata } from "tslib";
import { destroy, scope } from '@vkontakte-internal/di';
import { CallsSdkService } from '../sdk';
import { StateBridge } from '../../utils/stateBridge';
import { makeAutoObservable } from 'mobx';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { StreamRegistry } from '../stream';
import { getIsVideoSuspendAutoModeAvailable, getIsVideoSuspendSupported } from '../../selectors';
import { ClickHouseEventType, EVideoOptionType, VideoSuspendMode } from '@vkontakte-internal/calls-core';
import { E_ACTION } from '../../constants';
import { videoOptionsStorage } from '../../helpers/localStorage';
import { handlePromiseError } from '../../helpers/logger';
import { ClickHouseService } from '../shared/ClickHouseService';
import { createUnsubscribes } from '../../helpers/serviceUnsubscribers';
/**
 * Класс отвечает за работу с videoSuspendMode
 * пока взаимодействие идет с редаксом, т.к. есть
 * использование стейта редакса в мобильных звонках
 */
let VideoSuspendService = class VideoSuspendService {
    constructor(sdkService, stateBridge, streamRegistry, clickHouseService) {
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.streamRegistry = streamRegistry;
        this.clickHouseService = clickHouseService;
        this.isLoading = false;
        this.unsubscribers = createUnsubscribes();
        this.callSdkMethod = (isAuto, fallbackMode) => {
            if (!this.isAutoModeAvailable) {
                return;
            }
            this.sdkService
                .getSdk()
                .enableVideoSuspend(isAuto)
                .catch((error) => {
                handlePromiseError(error);
                this.setMode(fallbackMode);
            })
                .finally(() => {
                this.isLoading = false;
            });
            if (!isAuto) {
                void this.sdkService.getSdk().enableVideoSuspendSuggest(true);
            }
        };
        this.toggleAutoMode = () => {
            if (this.isLoading) {
                return;
            }
            const prevMode = this.mode;
            const nextMode = !this.isAlwaysSuspended
                ? this.isAutoModeEnabled
                    ? VideoSuspendMode.NEVER
                    : VideoSuspendMode.AUTO
                : VideoSuspendMode.ALWAYS;
            this.isLoading = true;
            this.setMode(nextMode);
            this.callSdkMethod(nextMode === VideoSuspendMode.AUTO, prevMode);
        };
        this.enableAutoMode = () => {
            if (this.isLoading || this.isAutoModeEnabled) {
                return;
            }
            this.isLoading = true;
            this.setMode(VideoSuspendMode.AUTO);
            this.callSdkMethod(true, this.mode);
        };
        /** Переключает между режимами NEVER/ALWAYS */
        this.toggle = () => {
            if (this.isLoading) {
                return;
            }
            const nextMode = this.isAlwaysSuspended ? VideoSuspendMode.NEVER : VideoSuspendMode.ALWAYS;
            this.setMode(nextMode);
            if (nextMode === VideoSuspendMode.NEVER && this.isAutoModeEnabled) {
                // switch off backend processing if it was turned on
                this.callSdkMethod(false, nextMode);
            }
        };
        this.handleLocalStatus = (status) => {
            if (status === ParticipantStatus.CONNECTED) {
                this.initVideoSuspend();
            }
        };
        makeAutoObservable(this);
        this.unsubscribers.add(this.sdkService.subscribe('onLocalStatus', this.handleLocalStatus));
    }
    [destroy]() {
        this.unsubscribers.clear();
    }
    /** Поддерживается ли фича (внутри VoiceRooms выключена) */
    get isFeatureSupported() {
        return getIsVideoSuspendSupported(this.stateBridge);
    }
    /** Включен ли авторежим */
    get isAutoModeAvailable() {
        return getIsVideoSuspendAutoModeAvailable(this.stateBridge);
    }
    /** Не показывать камеры/анимоджи других участников */
    get isAlwaysSuspended() {
        return this.mode === VideoSuspendMode.ALWAYS;
    }
    /** Видео потоки могут быть остановлены бэком в плохой сети */
    get isAutoModeEnabled() {
        return this.mode === VideoSuspendMode.AUTO;
    }
    /** Стандартный режим приёма потоков, ничего не останавливать */
    get isNeverModeEnabled() {
        return this.mode === VideoSuspendMode.NEVER;
    }
    get mode() {
        return this.stateBridge.videoSuspendMode;
    }
    setMode(mode) {
        this.stateBridge.dispatch({
            type: E_ACTION.SET_VIDEO_SUSPEND_MODE,
            data: mode,
        });
        videoOptionsStorage.saveOption(EVideoOptionType.VIDEO_SUSPEND_MODE, mode);
    }
    initVideoSuspend() {
        if (!this.isFeatureSupported) {
            return;
        }
        const isNever = this.isNeverModeEnabled;
        const isAuto = this.isAutoModeEnabled;
        // due to product decision we send 2 even if auto mode is n/a in current topology
        this.clickHouseService.sendStats(ClickHouseEventType.VIDEO_SUSPEND_MODE, {
            event_param: isNever ? 0 : isAuto ? 2 : 1,
        });
        if (this.isAutoModeAvailable) {
            // reset states before init, required after reconnect
            this.streamRegistry.unsuspendAll();
            this.sdkService
                .getSdk()
                .enableVideoSuspend(isAuto)
                .catch((error) => {
                handlePromiseError(error);
                // turn off suspending
                isAuto && this.setMode(VideoSuspendMode.NEVER);
            });
            if (!isAuto) {
                void this.sdkService.getSdk().enableVideoSuspendSuggest(true);
            }
        }
    }
};
VideoSuspendService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallsSdkService,
        StateBridge,
        StreamRegistry,
        ClickHouseService])
], VideoSuspendService);
export { VideoSuspendService };
//# sourceMappingURL=VideoSuspendService.js.map