import { __decorate, __metadata } from "tslib";
import { destroy, init, Props, scope } from '@vkontakte-internal/di';
import { StateBridge } from '../../utils/stateBridge';
import { SoundsManager } from './SoundManager';
import { makeAutoObservable, reaction } from 'mobx';
import { Sounds } from '../../constants';
import { Mode, isGroupCallByPeer } from '@vkontakte-internal/calls-core';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { CallMembersService } from '../../services/callMembers';
let SystemSoundsViewModel = class SystemSoundsViewModel {
    constructor(props, stateBridge, soundManager, callMembersService) {
        this.props = props;
        this.stateBridge = stateBridge;
        this.soundManager = soundManager;
        this.callMembersService = callMembersService;
        this.prevState = null;
        this.soundWatcher = undefined;
        makeAutoObservable(this, {
            prevState: false,
        });
    }
    get state() {
        return {
            mode: this.stateBridge.mode,
            me: this.stateBridge.me,
            participants: this.stateBridge.participants,
            peer: this.stateBridge.peer,
            participantsAddedByMe: this.stateBridge.participantsAddedByMe,
            status: this.stateBridge.localDevice.status,
            devices: this.stateBridge.devices,
        };
    }
    play(type) {
        this.soundManager.play(type, [Sounds.INCOMING, Sounds.OUTGOING, Sounds.CONNECTING].includes(type));
    }
    updateSoundState() {
        const prev = this.prevState || this.state;
        const next = this.state;
        const soundManager = this.soundManager;
        if (prev.mode !== next.mode) {
            if ((prev.mode === Mode.READY || prev.mode === Mode.CREATE_CALL) &&
                (next.mode === Mode.INCOMING || next.mode === Mode.CALL)) {
                this.props.current.onBeforeCallStart?.();
            }
            // Входящий звонок закончился
            if (prev.mode === Mode.INCOMING) {
                soundManager.stop(Sounds.INCOMING);
            }
            // Входящий звонок начался
            if (next.mode === Mode.INCOMING) {
                this.play(Sounds.INCOMING);
            }
            const isEndCall = next.mode === Mode.READY && [Mode.INCOMING, Mode.CALL].includes(prev.mode);
            const isEndFeedbackCall = next.mode === Mode.FEEDBACK && prev.mode === Mode.CALL;
            // Звонок закончился
            if (isEndCall || isEndFeedbackCall) {
                soundManager.stopAll();
                this.play(Sounds.END);
                this.props.current.onAfterCallFinish?.();
            }
        }
        // Я пытаюсь присоединиться к беседе
        if (prev.status !== next.status) {
            if (prev.status && [ParticipantStatus.CONNECTING, ParticipantStatus.RECONNECT].includes(prev.status)) {
                soundManager.stop(Sounds.CONNECTING);
            }
            if (next.status && [ParticipantStatus.CONNECTING, ParticipantStatus.RECONNECT].includes(next.status)) {
                this.play(Sounds.CONNECTING);
            }
            if (prev.status !== ParticipantStatus.WAITING && next.status === ParticipantStatus.CONNECTED) {
                this.play(Sounds.CONNECTED);
            }
        }
        // Звук исходящего
        if (next.mode === Mode.CALL) {
            if (this.isOutgoingSoundPlaying(next.participants, next.me, next.participantsAddedByMe, isGroupCallByPeer(next.peer))) {
                this.play(Sounds.OUTGOING);
            }
            else {
                soundManager.stop(Sounds.OUTGOING);
            }
        }
        this.prevState = this.state;
    }
    /**
     * Проверяет должен ли играть звук исходящего при текущем состоянии звонка
     *
     * @param {Object} participants - участники звонка
     * @param {Number} myId - id текущего пользователя
     * @param {Set<number>} participantsAddedByMe - участники, добавленные вручную в диалоге приглашения
     * @param {Boolean} isGroupCall
     * @return {Boolean}
     */
    isOutgoingSoundPlaying(participants, myId, participantsAddedByMe, isGroupCall) {
        let isWaitingForAddedParticipant = false;
        for (const participant of Object.values(participants)) {
            if (participant.peerId === myId) {
                continue;
            }
            // Если есть подключенные собеседники, звук не играет
            if (this.callMembersService.someDeviceByParticipant(participant, (device) => device.status === ParticipantStatus.CONNECTED)) {
                return false;
            }
            const isFlagged = this.callMembersService.someDeviceByParticipant(participant, (device) => device.status === ParticipantStatus.WAITING) &&
                (!isGroupCall || participantsAddedByMe.has(participant.peerId));
            if (isFlagged) {
                isWaitingForAddedParticipant = true;
            }
        }
        // Звук играет, если есть вызываемые собеседники
        return isWaitingForAddedParticipant;
    }
    [init]() {
        this.soundManager.init(this.props.current.callSounds);
        this.soundManager.unlockAudioContext();
        this.updateSoundState();
        this.soundWatcher = reaction(() => this.state, () => {
            this.updateSoundState();
        });
    }
    [destroy]() {
        this.soundWatcher?.();
        this.soundManager.stopAll();
        this.props.current.onAfterCallFinish?.();
    }
};
SystemSoundsViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        StateBridge,
        SoundsManager,
        CallMembersService])
], SystemSoundsViewModel);
export { SystemSoundsViewModel };
//# sourceMappingURL=SystemSoundsViewModel.js.map