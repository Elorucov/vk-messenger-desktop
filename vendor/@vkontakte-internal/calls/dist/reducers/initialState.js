import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { EMPTY_PEER_ID, Mode, NetworkState, NoiseCancellationTypes, UIMode, VideoResolutionTypes, VideoSuspendMode, getUnmutedPermissions, } from '@vkontakte-internal/calls-core';
// фикс циклических импортов для тестов
import { initialState as initialVoiceRoomState } from '../features/voiceRoom/model/reducer';
import { getInitialCallMembersState } from './callMembers';
import { initialFeatureNotificationState } from '../features/notifications/featureNotification/featureNotificationSlice';
import { localStorage } from '@vkontakte/vkjs';
import { VIDEO_RESOLUTION_STORAGE_KEY } from '../constants';
export const getInitialLocalDeviceState = () => ({
    markers: null,
    mediaSettings: {
        isAudioEnabled: true,
        isVideoEnabled: false,
        isScreenSharingEnabled: false,
        isAnimojiEnabled: false,
    },
    networkState: NetworkState.GOOD,
    networkStatus: 1,
    permissions: getUnmutedPermissions(),
    roles: [],
    status: ParticipantStatus.WAITING,
    statusData: {
        hand: {
            state: false,
            ts: Date.now(),
        },
        drat: {
            state: false,
            ts: Date.now(),
        },
    },
    streamMode: null,
});
export const getInitialVideoResolution = (enableHDVideo = false) => {
    const videoResolution = enableHDVideo ? VideoResolutionTypes.HD : VideoResolutionTypes.SD;
    return (localStorage.getItem(VIDEO_RESOLUTION_STORAGE_KEY) ?? videoResolution);
};
export const initialCallFeatures = {
    onlyAdminCanRecordAndTranslation: false,
};
export const getInitialState = ({ currentUser, callConversation, options, }) => {
    const { isDev = false, anonymSecret, config, localVideoResolution = options.config?.enableHDVideo ? VideoResolutionTypes.HD : VideoResolutionTypes.SD, friends = [], friendsCache, privacySettings, ipSettingEnabled, friendsCount, noiseCancellation = NoiseCancellationTypes.NEURAL, videoSuspendMode = VideoSuspendMode.NEVER, } = options;
    const me = currentUser.peerId;
    return {
        anonymSecret,
        me,
        groupId: 0,
        mode: Mode.READY,
        peer: EMPTY_PEER_ID,
        participants: {
            [me]: {
                ...currentUser,
            },
        },
        devices: {},
        localDevice: getInitialLocalDeviceState(),
        callData: {
            type: null,
            ts: null,
            localTimeStamp: null,
            conversation: callConversation,
        },
        isDev,
        uiMode: UIMode.DEFAULT,
        orator: null,
        adminPinnedParticipant: null,
        mediaSharers: {},
        mediaSharingPinnedParticipant: null,
        pinnedParticipant: null,
        isShownParticipantsAside: true,
        isOratorMode: true,
        preselectedIds: null,
        chatUnreadCount: 0,
        chatUpToMsgId: null,
        tooltips: {
            chat: false,
            hand: false,
            screenShare: false,
            layout: false,
            collapse: false,
            fullscreen: false,
        },
        participantsAddedByMe: new Set(),
        notification: null,
        errorShown: false,
        cautionShown: false,
        isLoaderVisible: false,
        translation: {
            deferredId: null,
            isOn: false,
        },
        noiseCancellation,
        config,
        localVideoResolution,
        conversationOptions: [],
        privacySettings: {
            callsIp: privacySettings?.callsIp || 'friends',
        },
        ipSettingEnabled: ipSettingEnabled || false,
        isIncoming: false,
        shouldShowDesktopAppNotification: false,
        shouldShowWarningDesktopAppNotification: true,
        virtualBackgroundSettings: {
            photos: [],
            videoOptions: {},
        },
        permissions: {},
        maps: {
            peerIdToDevices: new Map(),
        },
        onlyAdminCanShareMovie: false,
        featureNotification: initialFeatureNotificationState,
        callFeatures: initialCallFeatures,
        // @ts-expect-error TS2322: Type 'IState' is not assignable to type 'DeepPartial<IState>'.
        voiceRoom: initialVoiceRoomState,
        restrictedConversation: false,
        videoSuspendMode,
        isVoiceRoom: false,
        inCallChatOpened: false,
        callMembers: getInitialCallMembersState(friends, friendsCache, friendsCount),
        hasInCallChat: false,
        wasNetworkIndicatorShown: false,
        effectVoiceChange: null,
    };
};
//# sourceMappingURL=initialState.js.map