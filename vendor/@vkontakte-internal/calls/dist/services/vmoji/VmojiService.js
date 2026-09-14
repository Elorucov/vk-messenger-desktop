import { __decorate, __metadata } from "tslib";
import { externalIdToString, isParticipantContact, isSameExternalId, peerIdToVkId, ModalType, } from '@vkontakte-internal/calls-core';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { AnimojiPreviewGenerator, ErrorSource, ErrorType } from '@vkontakte/calls-vmoji';
import { destroy, scope } from '@vkontakte-internal/di';
import { makeAutoObservable, reaction } from 'mobx';
import { VMOJI_CAPTURE_STORAGE_KEY, VMOJI_INVALID_URL_PATTERN, VmojiErrorReason } from '../../constants';
import { ClickHouseEventType } from '../../stats/clickHouse';
import { StateBridge } from '../../utils/stateBridge';
import { AccountService } from '../account';
import { CallsSdkService } from '../sdk';
import { isParticipantAnonymOrContact } from '../../helpers/participant';
import { getIsMeCommunity } from '../../selectors';
import { createVmojiPreview } from './utils';
import { handlePromiseError } from '../../helpers/logger';
import { ClickHouseService } from '../shared/ClickHouseService';
import { ModalService } from '../modal';
import { createUnsubscribes } from '../../helpers/serviceUnsubscribers';
export var VmojiCharacterIdLoadingStatus;
(function (VmojiCharacterIdLoadingStatus) {
    VmojiCharacterIdLoadingStatus["LOADING"] = "loading";
    VmojiCharacterIdLoadingStatus["SUCCESS"] = "success";
    VmojiCharacterIdLoadingStatus["FAILED"] = "failed";
})(VmojiCharacterIdLoadingStatus || (VmojiCharacterIdLoadingStatus = {}));
/**
 * Сервис управления состоянием Vmoji в звонке
 */
let VmojiService = class VmojiService {
    constructor(accountService, sdkService, stateBridge, clickHouseService, modalService) {
        this.accountService = accountService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.clickHouseService = clickHouseService;
        this.modalService = modalService;
        this.unsubscribers = createUnsubscribes();
        /** Включен ли захват и отправка вимоджи */
        this._isCapture = false;
        /** Было ли успешно сгенерировано превью vmoji */
        this._isPreviewGenerated = false;
        this._loadingStatus = VmojiCharacterIdLoadingStatus.LOADING;
        /**
         * Полученные при попытке загрузки файла vmoji участника http статусов,
         * отличные от 200 OK
         */
        this.participantHttpStatuses = new Map();
        /** Data URL изображения превью Vmoji пользователя в формате png */
        this._vmojiPreviewSrc = undefined;
        this.isVmojiPreviewLoading = false;
        this.savedSvgs = new Map();
        /**
         * Для ручных контролов
         * Сохраняется выбор в localStorage, отправляется стата
         */
        this.toggleMyVmoji = () => {
            const nextIsCapture = !this.isCapture;
            if (nextIsCapture) {
                localStorage.setItem(VMOJI_CAPTURE_STORAGE_KEY, 'true');
            }
            else {
                localStorage.removeItem(VMOJI_CAPTURE_STORAGE_KEY);
            }
            if (nextIsCapture) {
                this.startMyVmoji();
            }
            else {
                this.stopMyVmoji();
            }
            this.clickHouseService.sendStats(nextIsCapture ? ClickHouseEventType.CALL_VMOJI_STARTED : ClickHouseEventType.CALL_VMOJI_STOPPED);
        };
        /** Открытие модального окна Vmoji */
        this.toggleVmoji = () => {
            this.modalService.openModal(ModalType.VMOJI);
            this.clickHouseService.sendStats(ClickHouseEventType.CALL_VMOJI_CLICK);
        };
        /** Запуск создания Vmoji */
        this.startCreateCharacter = () => {
            window.Emoji?.createVmojiAvatar?.();
        };
        /** Запуск редактирования Vmoji */
        this.startEditCharacter = () => {
            if (this.characterId) {
                window.Emoji?.showVmojiAvatar?.(this.accountService.getUserId(), this.characterId);
            }
        };
        /**
         * Реакция включает vmoji при установке соединения, если использование vmoji включено в local storage
         */
        this.handleSdkLocalStatus = (status) => {
            if (status === ParticipantStatus.CONNECTED && this.getVmojiShouldBeStarted()) {
                this.startMyVmoji();
                // Отправка статы перенесена из колбэка sdk
                this.clickHouseService.sendStats(ClickHouseEventType.CALL_VMOJI_STARTED);
            }
        };
        this.handleSdkPromoted = (demoted) => {
            if (demoted && this.stateBridge.isVoiceRoom) {
                this.stopMyVmoji();
            }
        };
        this.handleSdkParticipantVmojiUpdate = (externalId) => {
            this.savedSvgs.delete(externalIdToString(externalId));
            this.loadSvg(externalId);
        };
        this.handleSdkVmojiError = (error) => {
            const { participants } = this.stateBridge;
            const { externalId: { id: peerId }, errorType, errorCode, errorMessage, errorSource, } = error;
            const eventData = {
                owner_id: peerIdToVkId(peerId),
            };
            // Игнорируем ошибки при генерации превью
            if (errorSource === ErrorSource.PREVIEW) {
                return;
            }
            switch (errorType) {
                case ErrorType.NO_SVG: {
                    const participant = participants[peerId];
                    // Если не было получено поле animated_avatar
                    if (!participant || !participant.animated_avatar) {
                        eventData.reason = VmojiErrorReason.NO_ANIMATED_AVATAR;
                        break;
                    }
                    // Если animated_avatar не содержит url или пустая строка
                    if (!participant.animated_avatar.url) {
                        eventData.reason = VmojiErrorReason.NO_URL;
                        break;
                    }
                    // Если url пришел в сломанном формате
                    if (participant.animated_avatar.url.includes(VMOJI_INVALID_URL_PATTERN)) {
                        eventData.reason = VmojiErrorReason.INVALID_URL;
                        break;
                    }
                    // Если при попытке скачать vmoji участника пришел невалидный http ответ
                    if (this.participantHttpStatuses.has(peerId)) {
                        eventData.error = this.participantHttpStatuses.get(peerId);
                        eventData.reason = VmojiErrorReason.BAD_HTTP_STATUS;
                        break;
                    }
                    // Не отправляем событие, если причина ошибки не была установлена
                    return;
                }
                // Невалидный SVG vmoji
                case ErrorType.INVALID_SVG: {
                    eventData.custom_feedback = errorMessage;
                    eventData.error = errorCode;
                    eventData.reason = VmojiErrorReason.INVALID_SVG;
                    break;
                }
                // Произошла ошибка при расшифровке vmoji
                case ErrorType.DECRYPTION: {
                    eventData.reason = VmojiErrorReason.FAILED_TO_DECRYPT;
                    break;
                }
            }
            this.clickHouseService.sendStats(ClickHouseEventType.CALL_VMOJI_START_FAILED, eventData);
        };
        this.handleSdkHangup = () => {
            this.clear();
        };
        /**
         * Реакция включает vmoji при раскрытии контакта, если использование vmoji включено в local storage
         * Само раскрытие под выключенной ручкой. Мессенджер так и не доделали.
         * Сейчас сервис не уничтожается, поэтому нет такого места, где нужно вызвать dispose
         */
        this.disposeMyPeerIdChangeReaction = reaction(() => this.stateBridge.me, (peerId, prevPeerId) => {
            if (!isParticipantContact(peerId) &&
                isParticipantContact(prevPeerId) &&
                this.getVmojiShouldBeStarted()) {
                this.startMyVmoji();
            }
        });
        /**
         * Отправляем стату с бенчмарком вимоджи по вызову коллбека из AnimojiPreviewGenerator
         * Сейчас сервис не уничтожается, поэтому нет такого места, где нужно вызвать dispose
         */
        this.disposeCallIdReaction = reaction(() => this.stateBridge.callData.callId, (callId) => {
            if (!callId) {
                return;
            }
            AnimojiPreviewGenerator.timeToRender.then((ttr) => {
                const timeToRender = Math.round(ttr) || 1;
                this.sdkService.log({
                    message: 'Sending vmoji benchmarking result stat',
                    timeToRender,
                });
                this.clickHouseService.sendStats(ClickHouseEventType.CALL_VMOJI_BENCHMARK, {
                    event_param: timeToRender,
                    session_id: callId,
                });
            });
        });
        this.setIsCapture(Boolean(this.accountService.getAnimatedAvatar()?.url &&
            localStorage.getItem(VMOJI_CAPTURE_STORAGE_KEY) !== null));
        this.unsubscribers.add(this.sdkService.subscribe('onLocalStatus', this.handleSdkLocalStatus), this.sdkService.subscribe('onPromoted', this.handleSdkPromoted), this.sdkService.subscribe('onParticipantVmojiUpdate', this.handleSdkParticipantVmojiUpdate), this.sdkService.subscribe('onVmojiError', this.handleSdkVmojiError), this.sdkService.subscribe('onHangup', this.handleSdkHangup));
        makeAutoObservable(this);
        this.loadCharacterId();
    }
    [destroy]() {
        this.unsubscribers.clear();
    }
    /** Включен ли захват и отправка вимоджи */
    get isCapture() {
        return this._isCapture;
    }
    setIsCapture(value) {
        this._isCapture = value;
    }
    /** Было ли успешно сгенерировано превью vmoji */
    get isPreviewGenerated() {
        return this._isPreviewGenerated;
    }
    setIsPreviewGenerated(value) {
        this._isPreviewGenerated = value;
    }
    /** Статус загрузки Vmoji */
    get loadingStatus() {
        return this._loadingStatus;
    }
    addParticipantHttpStatus(peerId, status) {
        this.participantHttpStatuses.set(peerId, status);
    }
    /** Вернёт url Vmoji */
    get myAnimatedAvatarUrl() {
        const { me, participants } = this.stateBridge;
        return participants[me]?.animated_avatar?.url;
    }
    /** Data URL изображения превью Vmoji пользователя в формате png */
    get vmojiPreviewSrc() {
        return this._vmojiPreviewSrc;
    }
    /**
     * Включает показ vmoji
     * Для автоматических переключений
     * Стата не отправляется
     */
    startMyVmoji() {
        this.sdkService.getSdk().captureVmoji(true);
        this.setIsCapture(true);
    }
    /**
     * Останавливает показ vmoji
     * Для автоматических переключений
     * Стата не отправляется
     */
    stopMyVmoji() {
        this.sdkService.getSdk().captureVmoji(false);
        this.setIsCapture(false);
    }
    /** Загрузка id анимированного аватара */
    loadCharacterId() {
        this.setLoadingStatus(VmojiCharacterIdLoadingStatus.LOADING);
        window.Emoji?.getVmojiAvatar?.()
            .then((avatar) => {
            this.setCharacterId(avatar ? avatar.character_id : undefined);
            this.setLoadingStatus(VmojiCharacterIdLoadingStatus.SUCCESS);
        })
            .catch(() => {
            this.setLoadingStatus(VmojiCharacterIdLoadingStatus.FAILED);
        });
    }
    /** Метод для загрузки Vmoji нескольких пользователей */
    loadMultipleSvg(externalIds) {
        return Promise.all(externalIds.map((externalId) => this.loadSvg(externalId)));
    }
    async loadSvg(externalId) {
        if (isParticipantAnonymOrContact(externalId)) {
            return;
        }
        const { externalId: myExternalId, participants } = this.stateBridge;
        const peerId = externalId.id;
        const participant = participants[peerId];
        const animatedAvatarUrl = participant?.animated_avatar?.url;
        const deviceId = externalIdToString(externalId);
        const savedUrl = this.savedSvgs.get(deviceId);
        /** Загружаем и передаем в SDK, если еще не загружали или сохраненная ссылка отличается от текущей */
        if (animatedAvatarUrl && (!savedUrl || animatedAvatarUrl !== savedUrl)) {
            const isMe = isSameExternalId(externalId, myExternalId);
            this.savedSvgs.set(deviceId, animatedAvatarUrl);
            try {
                const response = await fetch(animatedAvatarUrl);
                if (!response.ok) {
                    this.addParticipantHttpStatus(peerId, response.status);
                    throw new Error('Fetch failed');
                }
                const svg = await response.arrayBuffer();
                await this.sdkService.getSdk().setVmojiSvg(svg, !isMe ? externalId : null);
                if (isMe) {
                    await this.generateMyVmojiPreview();
                    if (this.isCapture) {
                        // флаг может быть установлен ранее из local storage
                        this.startMyVmoji();
                        this.clickHouseService.sendStats(ClickHouseEventType.CALL_VMOJI_STARTED);
                    }
                }
            }
            catch (err) {
                this.savedSvgs.delete(deviceId);
            }
        }
    }
    async generateMyVmojiPreview() {
        const myAnimatedAvatarUrl = this.accountService.getAnimatedAvatar()?.url;
        if (myAnimatedAvatarUrl && !this.isVmojiPreviewLoading && AnimojiPreviewGenerator.svgData) {
            // Не пытаемся сгенерировать превью, если еще не был получен svg аватар (устанавливается в setVmojiSvg)
            this.setIsVmojiPreviewLoading(true);
            try {
                const src = createVmojiPreview(await AnimojiPreviewGenerator.getPreview());
                if (src) {
                    this.setVmojiPreviewSrc(src);
                    this.setIsPreviewGenerated(true);
                }
            }
            catch (err) {
                handlePromiseError(err);
            }
            finally {
                this.setIsVmojiPreviewLoading(false);
            }
        }
    }
    setCharacterId(id) {
        this.characterId = id;
    }
    setVmojiPreviewSrc(src) {
        this._vmojiPreviewSrc = src;
    }
    setIsVmojiPreviewLoading(value) {
        this.isVmojiPreviewLoading = value;
    }
    /** Запускать ли Vmoji при старте звонка */
    getVmojiShouldBeStarted() {
        const { me, groupId, restrictedConversation } = this.stateBridge;
        return (this.isCapture &&
            this.isPreviewGenerated &&
            !isParticipantAnonymOrContact(me) &&
            !getIsMeCommunity({ groupId }) &&
            !restrictedConversation);
    }
    setLoadingStatus(value) {
        this._loadingStatus = value;
    }
    clear() {
        /**
         * Очистка savedSvgs требуется для того чтобы корректно произошёл старт в следующем звонке
         * Раньше это обеспечивалось оничтожением React ref-a в хуке
         * Чтобы устранить требуется более глубокий рефакторинг компонентов и состояния
         */
        this.savedSvgs.clear();
        this.setVmojiPreviewSrc(undefined);
        this.participantHttpStatuses.clear();
    }
};
VmojiService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [AccountService,
        CallsSdkService,
        StateBridge,
        ClickHouseService,
        ModalService])
], VmojiService);
export { VmojiService };
//# sourceMappingURL=VmojiService.js.map