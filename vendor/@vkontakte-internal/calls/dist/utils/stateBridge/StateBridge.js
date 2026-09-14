import { __decorate, __metadata } from "tslib";
import { destroy, scope } from '@vkontakte-internal/di';
import { makeAutoObservable, observable, runInAction } from 'mobx';
import { EVideoOptionType, Mode, NoiseCancellationTypes, UIMode, VideoSuspendMode, EMPTY_PEER_ID, EMPTY_USER_ID, } from '@vkontakte-internal/calls-core';
import { GlobalStore } from '../../reducers/globalStore';
import { getInitialLocalDeviceState, initialCallFeatures } from '../../reducers/initialState';
import { getInitialCallMembersState } from '../../reducers/callMembers';
import { initialState as initialVoiceRoomState } from '../../features/voiceRoom/model/reducer';
import { initialFeatureNotificationState } from '../../features/notifications/featureNotification/featureNotificationSlice';
/**
 * Осуществляет связь между redux стейтом и mobx
 */
let StateBridge = class StateBridge {
    constructor() {
        this.anonymSecret = undefined;
        this.callData = {
            type: null,
            ts: null,
            localTimeStamp: null,
            conversation: undefined,
        };
        this.callFeatures = initialCallFeatures;
        this.featureNotification = initialFeatureNotificationState;
        this.startOptions = undefined;
        this.meGroup = undefined;
        this.callMembers = getInitialCallMembersState();
        this.conversationOptions = [];
        this.changedParticipantIds = new Map();
        this.devices = {};
        this.effectVoiceChange = null;
        this.entryPoint = undefined;
        this.externalId = undefined;
        this.error = undefined;
        this.groupId = EMPTY_USER_ID;
        this.handState = undefined;
        this.isDev = false;
        this.isShownParticipantsAside = false;
        this.ipSettingEnabled = false;
        this.isOratorMode = true;
        this.inCallChatOpened = false;
        this.isVoiceRoom = false;
        this.localDevice = getInitialLocalDeviceState();
        this.maps = {
            peerIdToDevices: new Map(),
        };
        this.me = EMPTY_PEER_ID;
        this.mediaSharers = {};
        this.modal = undefined;
        this.mode = Mode.READY;
        this.noiseCancellation = NoiseCancellationTypes.NEURAL;
        this.notification = null;
        this.onlyAdminCanShareMovie = false;
        this.participants = {};
        this.lastCallData = undefined;
        this.participantsAddedByMe = new Set();
        this.participantsChunk = undefined;
        this.peer = EMPTY_PEER_ID;
        this.permissions = {};
        this.hangupType = undefined;
        this.privacySettings = {
            callsIp: 'friends',
        };
        this.reactions = undefined;
        this.restrictedConversation = undefined;
        this.translation = { isOn: false };
        this.uiMode = UIMode.DEFAULT;
        this.videoSuspendMode = VideoSuspendMode.NEVER;
        this.virtualBackgroundSettings = {
            photos: [],
            videoOptions: {
                [EVideoOptionType.IS_VIDEO_MIRRORED]: false,
                [EVideoOptionType.SIMPLE_PIP_ENABLED_BY_USER]: true,
                [EVideoOptionType.VIDEO_SUSPEND_BANNER_TIMES]: 0,
            },
        };
        this.voiceRoom = initialVoiceRoomState;
        this.waitingHall = undefined;
        this.dispatch = this.store.dispatch;
        this.handleReduxStateUpdate = () => {
            const state = this.store.getState();
            runInAction(() => {
                this.anonymSecret = state.anonymSecret;
                this.callData = state.callData;
                this.notification = state.notification;
                this.callFeatures = state.callFeatures;
                this.featureNotification = state.featureNotification;
                this.startOptions = state.startOptions;
                this.meGroup = state.meGroup;
                this.callMembers = state.callMembers;
                this.conversationOptions = state.conversationOptions;
                this.changedParticipantIds = state.changedParticipantIds;
                this.devices = state.devices;
                this.effectVoiceChange = state.effectVoiceChange;
                this.entryPoint = state.entryPoint;
                this.externalId = state.externalId;
                this.error = state.error;
                this.entryPoint = state.entryPoint;
                this.groupId = state.groupId;
                this.handState = state.handState;
                this.isDev = state.isDev;
                this.isShownParticipantsAside = state.isShownParticipantsAside;
                this.isVoiceRoom = state.isVoiceRoom;
                this.ipSettingEnabled = state.ipSettingEnabled;
                this.isOratorMode = state.isOratorMode;
                this.inCallChatOpened = state.inCallChatOpened;
                this.isVoiceRoom = state.isVoiceRoom;
                this.localDevice = state.localDevice;
                this.maps = state.maps;
                this.me = state.me;
                this.mediaSharers = state.mediaSharers;
                this.modal = state.modal;
                this.mode = state.mode;
                this.noiseCancellation = state.noiseCancellation;
                this.notification = state.notification;
                this.onlyAdminCanShareMovie = state.onlyAdminCanShareMovie;
                this.participants = state.participants;
                this.lastCallData = state.lastCallData;
                this.participantsAddedByMe = state.participantsAddedByMe;
                this.participantsChunk = state.participantsChunk;
                this.peer = state.peer;
                this.permissions = state.permissions;
                this.privacySettings = state.privacySettings;
                this.reactions = state.reactions;
                this.restrictedConversation = state.restrictedConversation;
                this.translation = state.translation;
                this.uiMode = state.uiMode;
                this.videoSuspendMode = state.videoSuspendMode;
                this.virtualBackgroundSettings = state.virtualBackgroundSettings;
                this.voiceRoom = state.voiceRoom;
                this.waitingHall = state.waitingHall;
                this.hangupType = state.hangupType;
                this.modal = state.modal;
                this.isVoiceRoom = state.isVoiceRoom;
                this.entryPoint = state.entryPoint;
                this.changedParticipantIds = state.changedParticipantIds;
            });
        };
        this.unsubscribe = GlobalStore.addStoreUpdateListener(this.handleReduxStateUpdate);
        // set initial values from redux state
        this.handleReduxStateUpdate();
        makeAutoObservable(this, {
            callData: observable.ref,
            callFeatures: observable.ref,
            featureNotification: observable.ref,
            startOptions: observable.ref,
            meGroup: observable.ref,
            callMembers: observable.ref,
            conversationOptions: observable.ref,
            changedParticipantIds: observable.ref,
            devices: observable.ref,
            externalId: observable.ref,
            error: observable.ref,
            entryPoint: observable.ref,
            handState: observable.ref,
            localDevice: observable.ref,
            maps: observable.ref,
            mediaSharers: observable.ref,
            modal: observable.ref,
            notification: observable.ref,
            participants: observable.ref,
            lastCallData: observable.ref,
            participantsAddedByMe: observable.ref,
            participantsChunk: observable.ref,
            permissions: observable.ref,
            privacySettings: observable.ref,
            reactions: observable.ref,
            translation: observable.ref,
            virtualBackgroundSettings: observable.ref,
            voiceRoom: observable.ref,
            waitingHall: observable.ref,
        });
    }
    get store() {
        // store instance changes in tests, so we can not set it once
        return GlobalStore.getCallsStore();
    }
    get isCallCollapsed() {
        const { uiMode } = this;
        return Boolean(uiMode === UIMode.COLLAPSED);
    }
    get isCallFullscreen() {
        return this.uiMode === UIMode.FULLSCREEN;
    }
    [destroy]() {
        this.unsubscribe();
    }
};
StateBridge = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], StateBridge);
export { StateBridge };
//# sourceMappingURL=StateBridge.js.map