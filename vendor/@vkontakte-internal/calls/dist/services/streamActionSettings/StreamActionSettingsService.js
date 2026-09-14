import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { ClickHouseEventType, ModalType, participantIsAdmin, peerIdToVkId, } from '@vkontakte-internal/calls-core';
import { StateBridge } from '../../utils/stateBridge';
import { GroupsGroupAdminLevelEnumNames } from '@vkontakte-internal/api-schema-typescript';
import { isParticipantAnonym, isParticipantContact, isParticipantGroup } from '../../helpers/participant';
import { getIsVoiceRoomVoiceMode, getVoiceRoomGroup, getVoiceRoomOwnerId, } from '../../features/voiceRoom/selectors/';
import { makeAutoObservable } from 'mobx';
import { ClickHouseService } from '../shared/ClickHouseService';
import { LocalDeviceService } from '../localDevice';
import { ModalService } from '../modal';
/**
 * Сервис управляет записью звонка и трансляцией
 */
let StreamActionSettingsService = class StreamActionSettingsService {
    constructor(clickHouseService, localDeviceService, modalService, stateBridge) {
        this.clickHouseService = clickHouseService;
        this.localDeviceService = localDeviceService;
        this.modalService = modalService;
        this.stateBridge = stateBridge;
        this.onToggle = () => {
            if (this.translationIsOn) {
                this.modalService.openModal(ModalType.TRANSLATION_STOP);
            }
            else {
                this.modalService.openModal(ModalType.RECORD);
                this.clickHouseService.sendStats(ClickHouseEventType.CALL_RECORDING_CLICK);
            }
        };
        makeAutoObservable(this);
    }
    get isMeAdmin() {
        const participantMe = this.stateBridge.localDevice;
        return participantIsAdmin(participantMe);
    }
    get isVoiceRoom() {
        return this.stateBridge.isVoiceRoom;
    }
    get voiceRoomOwnerId() {
        return getVoiceRoomOwnerId(this.stateBridge);
    }
    get translationIsOn() {
        return !!this.stateBridge.translation?.isOn;
    }
    get isVoiceRoomMode() {
        return getIsVoiceRoomVoiceMode(this.stateBridge);
    }
    get isGroupAdmin() {
        const group = getVoiceRoomGroup(this.stateBridge);
        const isGroupVoiceRoomOwner = !!(this.voiceRoomOwnerId && isParticipantGroup(this.voiceRoomOwnerId));
        return isGroupVoiceRoomOwner && group?.admin_level === GroupsGroupAdminLevelEnumNames.ADMINISTRATOR;
    }
    isAvailableRecordAction(isForceAvailable) {
        const vkId = peerIdToVkId(this.stateBridge.me);
        const isMeAnonym = isParticipantAnonym(this.stateBridge.me);
        const isMeContact = isParticipantContact(this.stateBridge.me);
        const { onlyAdminCanRecordAndTranslation } = this.stateBridge.callFeatures;
        const isCallWithRecordingRightForNonAdminUsers = !onlyAdminCanRecordAndTranslation && !this.isVoiceRoom;
        const isMeVoiceRoomOwner = vkId === this.voiceRoomOwnerId;
        const isCallOrVoiceRoomWithRecordingRight = !this.isVoiceRoom || isMeVoiceRoomOwner || this.isGroupAdmin;
        return (isForceAvailable ||
            (!isMeAnonym &&
                !isMeContact &&
                (this.isVoiceRoomMode ||
                    ((this.isMeAdmin || isCallWithRecordingRightForNonAdminUsers) &&
                        isCallOrVoiceRoomWithRecordingRight))));
    }
    get isAvailableTranslationAction() {
        const isMeAnonym = isParticipantAnonym(this.stateBridge.me);
        const isMeContact = isParticipantContact(this.stateBridge.me);
        const { onlyAdminCanRecordAndTranslation } = this.stateBridge.callFeatures;
        return !isMeAnonym && !isMeContact && (this.isMeAdmin || !onlyAdminCanRecordAndTranslation);
    }
    get canRecordBeStopped() {
        return (this.localDeviceService.isRecordCreator ||
            (this.isMeAdmin && (!this.isVoiceRoom || this.isGroupAdmin || this.isVoiceRoomMode)));
    }
    get canTranslationBeStopped() {
        const { groupId, translation, me } = this.stateBridge;
        if (this.isMeAdmin) {
            return true;
        }
        const meId = !!groupId ? groupId : me;
        return translation?.host?.id ? +translation?.host?.id === meId : false;
    }
    /** если в настоящее время ведется запись звонка или трансляция */
    get isInProgress() {
        const translationIsRecord = !!this.stateBridge.translation?.isRecord;
        return this.translationIsOn && translationIsRecord;
    }
    get isRecordDisabled() {
        return this.isInProgress ? !this.canRecordBeStopped : this.translationIsOn;
    }
    get isTranslationDisabled() {
        const translationIsRecord = !!this.stateBridge.translation?.isRecord;
        return this.translationIsOn ? !translationIsRecord : false;
    }
    /** Получим настройки управления записью звонка
     * canBeStopped: boolean
     * isDisabled: boolean
     * isInProgress: boolean
     * onToggle: VoidFunction
     */
    getRecordSettings(isForceAvailable = false) {
        if (!this.isAvailableRecordAction(isForceAvailable)) {
            return null;
        }
        return {
            canBeStopped: this.isInProgress && this.canRecordBeStopped,
            isDisabled: this.isRecordDisabled,
            isInProgress: this.isInProgress,
            onToggle: this.onToggle,
        };
    }
    /**
     *  Получим настройки управления трансляцией звонка
     *  canBeStopped: boolean
     *  isDisabled: boolean
     *  isInProgress: boolean
     *  onOpen: VoidFunction
     */
    getTranslationSettings() {
        if (!this.isAvailableTranslationAction) {
            return null;
        }
        return {
            canBeStopped: this.isInProgress && this.canTranslationBeStopped,
            isDisabled: this.isTranslationDisabled,
            isInProgress: this.isInProgress,
            onOpen: () => {
                this.modalService.openModal(ModalType.TRANSLATION);
                this.clickHouseService.sendStats(ClickHouseEventType.CALL_STREAMING_CLICK);
            },
        };
    }
};
StreamActionSettingsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [ClickHouseService,
        LocalDeviceService,
        ModalService,
        StateBridge])
], StreamActionSettingsService);
export { StreamActionSettingsService };
//# sourceMappingURL=StreamActionSettingsService.js.map