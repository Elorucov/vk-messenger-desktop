import { __decorate, __metadata } from "tslib";
import { OnboardingService } from '../onboarding';
import { VmojiService } from '../vmoji';
import { ClickHouseEventType, FeatureNotification, isSameExternalId, ModalType, OnboardingFeature, participantIsAdmin, } from '@vkontakte-internal/calls-core';
import { StateBridge } from '../../utils/stateBridge';
import { CallsSdkService } from '../sdk';
import { handlePromiseError } from '../../helpers/logger';
import { isParticipantAnonymOrContact } from '../../helpers/participant';
import { CallsConfigService } from '../config';
import { destroy, scope } from '@vkontakte-internal/di';
import { LangUtils } from '../Lang';
import { setFeatureNotification } from '../../features/notifications/featureNotification/featureNotificationSlice';
import { makeAutoObservable } from 'mobx';
import { RoomsService } from '../../features/rooms';
import { ClickHouseService } from '../shared/ClickHouseService';
import { ModalService } from '../modal';
import { createUnsubscribes } from '../../helpers/serviceUnsubscribers';
/**
 * Сервис для управления функциями asr
 * Хранит в себе методы управления и текущее состояние
 */
let AsrService = class AsrService {
    constructor(onboardingService, vmojiService, stateBridge, sdkService, configService, roomsService, langUtils, clickHouseService, modalService) {
        this.onboardingService = onboardingService;
        this.vmojiService = vmojiService;
        this.stateBridge = stateBridge;
        this.sdkService = sdkService;
        this.configService = configService;
        this.roomsService = roomsService;
        this.langUtils = langUtils;
        this.clickHouseService = clickHouseService;
        this.modalService = modalService;
        this._asr = null;
        this.unsubscribers = createUnsubscribes();
        /**
         * Открытие модального окна с настройками старта распознавания речи
         */
        this.toggleAsrPopup = () => {
            const { featureType, closeOnboardingBanner, isOnboardingBannerOpen } = this.onboardingService;
            if (isOnboardingBannerOpen && featureType === OnboardingFeature.ASR) {
                closeOnboardingBanner(this.vmojiService.isCapture);
            }
            this.modalService.openModal(ModalType.ASR);
        };
        this.onStartAction = {
            text: this.langUtils.getLang('calls_start_asr_action'),
            key: 'startAsr',
            onClick: this.toggleAsrPopup,
        };
        this.onStopAction = {
            text: this.langUtils.getLang('calls_stop_asr_action'),
            key: 'stopAsr',
            onClick: this.toggleAsrPopup,
        };
        this.handleAsrStarted = (externalId, movieId, roomId) => {
            if (this.roomsService.roomId === roomId) {
                this.setAsr({
                    externalId,
                    movieId,
                });
                this.stateBridge.dispatch(setFeatureNotification(FeatureNotification.AsrStarted));
            }
        };
        this.handleAsrSet = (data, roomId) => {
            if (this.roomsService.roomId === roomId) {
                this.setAsr(data);
                if (data) {
                    this.stateBridge.dispatch(setFeatureNotification(FeatureNotification.AsrStarted));
                }
            }
        };
        this.handleAsrStopped = (roomId) => {
            if (this.isMeOwner) {
                this.clickHouseService.sendStats(ClickHouseEventType.TRANSCRIPTION_STOPPED);
            }
            if (this.roomsService.roomId === roomId) {
                this.stateBridge.dispatch(setFeatureNotification(this.isMeOwner ? FeatureNotification.AsrEndedForOwner : FeatureNotification.AsrEnded));
                this.setAsr(null);
            }
        };
        makeAutoObservable(this);
        this.unsubscribers.add(this.sdkService.subscribe('onAsrStarted', this.handleAsrStarted), this.sdkService.subscribe('onAsrSet', this.handleAsrSet), this.sdkService.subscribe('onAsrStopped', this.handleAsrStopped));
    }
    [destroy]() {
        this.unsubscribers.clear();
    }
    /**
     * Метод старта распозвонания речи
     * @param name название файла с расшифровкой
     */
    startAsr(name) {
        const { roomId } = this.roomsService;
        const params = {
            fileName: name,
        };
        if (roomId) {
            params.roomId = roomId;
        }
        return this.sdkService.getSdk().startAsr(params).catch(handlePromiseError);
    }
    /**
     * Метод остановки распознования речи
     */
    stopAsr() {
        const { roomId } = this.roomsService;
        const params = {};
        if (roomId) {
            params.roomId = roomId;
        }
        return this.sdkService.getSdk().stopAsr(params).catch(handlePromiseError);
    }
    get isMeOwner() {
        const myExternalId = this.stateBridge.externalId;
        return isSameExternalId(myExternalId, this._asr?.externalId);
    }
    /**
     * Может ли пользователь управлять распознованием речи
     */
    get isMeCanManageAsr() {
        const myDevice = this.stateBridge.localDevice;
        const myExternalId = this.stateBridge.externalId;
        const isMeAnonymOrContact = myExternalId && isParticipantAnonymOrContact(myExternalId);
        const isMeAdmin = participantIsAdmin(myDevice);
        const isSferum = this.configService.getConfig().sferum;
        // Для сферума управление передаем только админам
        if (isSferum) {
            return isMeAdmin;
        }
        // Управление передаем в одном из случаев:
        // Я админ
        // ASR не был запущен
        // ASR был запущен мной
        return !isMeAnonymOrContact && (isMeAdmin || !this._asr || this.isMeOwner);
    }
    /**
     * В зависимости от текущего состояния запускаем
     * или останавливаем распознавание речи
     */
    get asrAction() {
        return this._asr ? this.onStopAction : this.onStartAction;
    }
    /**
     * Возвращает данные пользователя, который запустил распознование речи
     */
    get asrOwner() {
        const { participants } = this.stateBridge;
        if (!this._asr?.externalId) {
            return undefined;
        }
        return participants[this._asr.externalId.id];
    }
    /**
     * Вернет информацию по расшифровке звонка
     */
    get asr() {
        return this._asr;
    }
    setAsr(asr) {
        this._asr = asr;
    }
    /**
     * Вернет externalId пользователя, запустившего расшифровку
     */
    get asrOwnerExternalId() {
        return this._asr?.externalId;
    }
};
AsrService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [OnboardingService,
        VmojiService,
        StateBridge,
        CallsSdkService,
        CallsConfigService,
        RoomsService,
        LangUtils,
        ClickHouseService,
        ModalService])
], AsrService);
export { AsrService };
//# sourceMappingURL=AsrService.js.map