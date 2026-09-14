import { isCreator, isAdmin, participantIsAdmin, externalIdToString, getDefaultExternalId, objectReduce, isParticipantWithVideo, isIPeerId, peerIdToVkId, isSharedMiniAppShownFromDevice, } from '@vkontakte-internal/calls-core';
import { isAuthedByGroupId } from './call';
import { ExternalIdType, MediaType, ParticipantStateDataValue, removeParticipant, } from '@vkontakte/calls-sdk';
import { Ranges } from '@vkontakte-internal/vk-utils';
import { useTypedSelector } from '../hooks/useTypedSelector';
// Relates tov CONTACT_PATTERN in www/VK/Messages/Domain/Calls/CallParticipant.php
const CONTACT_ID_PATTERN = /^c\d+_\d+$/;
const getVkId = (identity) => {
    return typeof identity === 'object'
        ? peerIdToVkId(identity.id)
        : isIPeerId(identity)
            ? peerIdToVkId(identity)
            : identity;
};
export const isParticipantAnonym = (externalId) => {
    return Ranges.isAnonymousCallPeerId(getVkId(externalId));
};
export const isParticipantContact = (externalId) => {
    // if numeric externalId provided it can not be id of contact
    const id = typeof externalId === 'object' ? externalId.id : isIPeerId(externalId) ? externalId : '';
    return CONTACT_ID_PATTERN.test(id);
};
export const isMessagesContact = (profile) => {
    return (typeof profile.calls_id === 'string' &&
        CONTACT_ID_PATTERN.test(profile.calls_id) &&
        typeof profile.name === 'string');
};
export const isParticipantAnonymOrContact = (externalId) => {
    return isParticipantAnonym(externalId) || isParticipantContact(externalId);
};
export const isParticipantGroup = (id) => {
    return Ranges.isGroupId(getVkId(id));
};
export const isChatOrChannel = (id) => {
    return Ranges.isChatOrChannelPeer(getVkId(id));
};
export const getParticipantExternalId = (participant) => {
    if (!participant?.peerId) {
        return null;
    }
    return {
        id: participant.peerId,
        type: ExternalIdType.USER,
    };
};
export const useActiveParticipantsCountLegacyStateDeps = () => {
    const devices = useTypedSelector((state) => state.devices);
    const maps = useTypedSelector((state) => state.maps);
    const me = useTypedSelector((state) => state.me);
    const participants = useTypedSelector((state) => state.participants);
    return {
        devices,
        maps,
        me,
        participants,
    };
};
/** Получает количество активных участников в текущем звонке */
export function getActiveParticipantsCount(state, isValidDevice) {
    let count = 0;
    const { participants } = state;
    for (const peerId in participants) {
        if (participants.hasOwnProperty(peerId) &&
            isParticipantActive(state, participants[peerId], isValidDevice)) {
            count++;
        }
    }
    return count;
}
/** Проверяет, является ли участник активным */
export function isParticipantActive({ devices, maps, me }, participant, isValidDevice = (device) => !!device.status) {
    if (participant.peerId === me) {
        return true;
    }
    return someDeviceByParticipant(participant, isValidDevice, {
        peerIdToDevices: maps.peerIdToDevices,
        devices,
    });
}
/**
 * Проверяет, может ли участник пинить других участников
 */
export function canPinParticipants(participant) {
    return participantIsAdmin(participant);
}
/*
 * Проверяет, может ли пользователь отключать микрофон и камеру другим участникам
 */
export function canMuteParticipants(participant) {
    if (!participant.roles) {
        return false;
    }
    return isCreator(participant) || isAdmin(participant);
}
export const getIsHandRaised = (device) => Boolean(device?.statusData?.hand?.state);
export const getIsHelpRequested = (device) => Boolean(device?.statusData?.drat?.state);
/** Проверяет количество поднятых рук */
export function getRaisedHands({ devices, localDevice, handState, roomId }) {
    const count = handState
        ? Object.keys(handState).length
        : objectReduce(devices, (acc, device) => {
            if (device.status && getIsHandRaised(device) && device.roomId === roomId) {
                acc++;
            }
            return acc;
        }, 0);
    if (getIsHandRaised(localDevice)) {
        return count + 1;
    }
    return count;
}
export function kickParticipant(participant, ban = false) {
    const externalId = getParticipantExternalId(participant);
    if (externalId) {
        return removeParticipant(externalId, ban);
    }
    return Promise.resolve();
}
export var KickType;
(function (KickType) {
    KickType["KICK"] = "kick";
    KickType["BAN"] = "ban";
})(KickType || (KickType = {}));
export function participantIsChatAdmin(participant, conversation) {
    if (!conversation) {
        return false;
    }
    const vkId = peerIdToVkId(participant.peerId);
    if (!vkId) {
        return false;
    }
    if (vkId === conversation.ownerId) {
        return true;
    }
    if (conversation.adminIds) {
        return conversation.adminIds.includes(vkId);
    }
    return false;
}
export function getMeId(state) {
    if (isAuthedByGroupId(state.groupId)) {
        return state.groupId;
    }
    else {
        return state.me;
    }
}
export function getStream(device, params) {
    const { stream, screenSharingStream, animojiStream, movieStream, streamMode, mediaSettings, movieStreamInfo, } = device;
    const isScreenSharingEnabled = !!screenSharingStream && mediaSettings.isScreenSharingEnabled;
    const isAnimojiEnabled = !!animojiStream && mediaSettings.isAnimojiEnabled;
    const isCameraEnabled = !!stream &&
        (mediaSettings.isVideoEnabled || (mediaSettings.isAnimojiEnabled && !!params?.animojiBackendRender));
    const isMovieEnabled = !!movieStream && movieStreamInfo;
    if (params?.useCameraOrAnimoji) {
        if (!isCameraEnabled && !isAnimojiEnabled) {
            return;
        }
        return {
            data: isCameraEnabled ? stream : animojiStream,
            type: MediaType.CAMERA,
        };
    }
    switch (streamMode) {
        case MediaType.CAMERA: {
            return isCameraEnabled || isAnimojiEnabled
                ? { data: isCameraEnabled ? stream : animojiStream, type: streamMode }
                : undefined;
        }
        case MediaType.SCREEN: {
            return isScreenSharingEnabled ? { data: screenSharingStream, type: streamMode } : undefined;
        }
        case MediaType.STREAM:
        case MediaType.MOVIE: {
            return isMovieEnabled ? { data: movieStream, type: streamMode } : undefined;
        }
        default: {
            if (isCameraEnabled || isAnimojiEnabled) {
                return {
                    data: isCameraEnabled ? stream : animojiStream,
                    type: MediaType.CAMERA,
                };
            }
        }
    }
}
export function getSausageStream(participant, { isOrator, animojiBackendRender }) {
    const { stream, screenSharingStream, animojiStream, movieStream, streamMode, mediaSettings, movieStreamInfo, } = participant;
    const isScreenSharingEnabled = !!(screenSharingStream && mediaSettings.isScreenSharingEnabled);
    const isAnimojiEnabled = !!(animojiStream && mediaSettings.isAnimojiEnabled);
    const isCameraEnabled = !!(stream &&
        (mediaSettings.isVideoEnabled || (mediaSettings.isAnimojiEnabled && !!animojiBackendRender)));
    const isMovieEnabled = !!(movieStream && movieStreamInfo);
    if (isOrator) {
        return getStream(participant, {
            useCameraOrAnimoji: isCameraEnabled || isAnimojiEnabled,
            animojiBackendRender,
        });
    }
    if (!streamMode) {
        return;
    }
    if (isMovieEnabled) {
        return { data: movieStream, type: streamMode };
    }
    if (isScreenSharingEnabled) {
        return { data: screenSharingStream, type: streamMode };
    }
    if (isCameraEnabled || isAnimojiEnabled) {
        return { data: isCameraEnabled ? stream : animojiStream, type: streamMode };
    }
}
export function isParticipantWithMovie(device) {
    return !!device.movieStream && !!device.movieStreamInfo;
}
export function isWaitingHallAllowed(participant) {
    return participantIsAdmin(participant);
}
export const getPeerIdDeviceInfo = (peerId, devices) => {
    return Object.values(devices).find((device) => device.externalId.id === peerId);
};
export function getFirstMatchedId(...externalIds) {
    for (const id of externalIds) {
        if (id !== null && id !== undefined) {
            return id;
        }
    }
    return null;
}
/**
 * @deprecated use CallMembersService
 * @do_not_call_in_reducer
 */
export function someDeviceByParticipant(participant, isValidDevice, { peerIdToDevices, devices, }) {
    if (!participant) {
        return false;
    }
    const deviceSet = peerIdToDevices?.get(participant.peerId);
    if (!deviceSet) {
        return false;
    }
    for (const id of deviceSet) {
        const device = devices[id];
        if (!device) {
            continue;
        }
        if (isValidDevice?.(device)) {
            return true;
        }
    }
    return false;
}
/**
 * @deprecated use CallMembersService
 * @param state
 * @param peerId
 */
export const isParticipantInCall = (state, peerId) => {
    if (peerId === state.me) {
        return true;
    }
    const participant = state.participants[peerId];
    if (!participant) {
        return false;
    }
    return someDeviceByParticipant(participant, (device) => !!device.status, {
        devices: state.devices,
        peerIdToDevices: state.maps.peerIdToDevices,
    });
};
export function getAllPeerDeviceIds(state, peerId) {
    if (peerId === state.me) {
        return new Set([externalIdToString(state.externalId ?? getDefaultExternalId(peerId))]);
    }
    const { maps: { peerIdToDevices }, } = state;
    return peerIdToDevices.get(peerId) ?? new Set();
}
/**
 * функция используется для конвертирования ответа от `onRemoteParticipantState`, `onRemoteParticipantsState`
 * https://st.mycdn.me/static/callssdk/2-1-7/doc/globals.html
 * с сервера приходит список состояний в виде ключ-значение.
 * Максимальная длина ключей и значений - 5 символов.
 */
export function convertParticipantStateFromSdk(statusData) {
    const parsedStatusData = {};
    const validKeys = ['hand', 'drat'];
    validKeys.forEach((key) => {
        if (statusData[key]) {
            parsedStatusData[key] = {
                state: statusData[key].state === ParticipantStateDataValue.ON,
                ts: statusData[key].ts,
            };
        }
        else {
            // Если ключ отсутствует в состоянии пришедшем с сервера, это означает - false
            parsedStatusData[key] = {
                state: false,
                ts: Date.now(),
            };
        }
    });
    return parsedStatusData;
}
/**
 * Использовать только для отправки данных на бэк
 */
export function createSdkParticipantState(statusData, updates) {
    const sdkData = {};
    const validKeys = ['hand', 'drat'];
    validKeys.forEach((key) => {
        const value = updates[key] ?? statusData?.[key]?.state;
        if (value) {
            // мы можем не добавлять ключ, если он "выключен",
            // для сервера "0" и отсутствие означают одно и то же
            sdkData[key] = ParticipantStateDataValue.ON;
        }
    });
    return sdkData;
}
export function getNewStreamModeByDevice(newMode, device, isStream) {
    if (!device) {
        return newMode;
    }
    const { streamMode } = device;
    switch (newMode) {
        case MediaType.STREAM:
        case MediaType.SHARED_URL:
        case MediaType.MOVIE: {
            return getNewStreamMode(newMode, device, isStream);
        }
        case MediaType.SCREEN: {
            if (streamMode === MediaType.MOVIE ||
                streamMode === MediaType.STREAM ||
                streamMode === MediaType.SHARED_URL) {
                return streamMode;
            }
            return getNewStreamMode(newMode, device, isStream);
        }
        case MediaType.CAMERA: {
            if (streamMode === MediaType.MOVIE ||
                streamMode === MediaType.STREAM ||
                streamMode === MediaType.SCREEN ||
                streamMode === MediaType.SHARED_URL) {
                return streamMode;
            }
            return getNewStreamMode(newMode, device, isStream);
        }
        default: {
            return null;
        }
    }
}
export function getAvailableStreamModes(device) {
    const modes = [];
    if (isSharedMiniAppShownFromDevice(device)) {
        modes.push(MediaType.SHARED_URL);
    }
    if (device.movieStreamInfo && device.movieStream) {
        modes.push(device.movieStreamInfo.source);
    }
    if (device.mediaSettings.isScreenSharingEnabled && device.screenSharingStream) {
        modes.push(MediaType.SCREEN);
    }
    if ((device.mediaSettings.isVideoEnabled && device.stream) ||
        (device.mediaSettings.isAnimojiEnabled && (device.animojiStream || device.stream))) {
        modes.push(MediaType.CAMERA);
    }
    return modes;
}
export function getPreviousAvailableStreamMode(device, deletedMode) {
    const availableModes = getAvailableStreamModes(device).filter((mode) => mode !== deletedMode);
    return availableModes[0] || null;
}
function getNewStreamMode(newMode, device, isStream) {
    if (isStream) {
        return newMode;
    }
    else {
        return getPreviousAvailableStreamMode(device, newMode);
    }
}
export function isStreamModeAvailable(mode, device, mediaSettings = device.mediaSettings) {
    switch (mode) {
        case MediaType.STREAM:
        case MediaType.MOVIE: {
            return !!(device.movieStream && device.movieStreamInfo);
        }
        case MediaType.SCREEN: {
            return !!(device.screenSharingStream && mediaSettings.isScreenSharingEnabled);
        }
        case MediaType.CAMERA: {
            return !!((device.stream && mediaSettings.isVideoEnabled) ||
                ((device.animojiStream || device.stream) && mediaSettings.isAnimojiEnabled));
        }
        default: {
            return false;
        }
    }
}
export function getMediaSettingsWithStreamMode(mediaSettings, device) {
    const deviceData = { mediaSettings };
    if (!device) {
        return deviceData;
    }
    if (!mediaSettings.isVideoEnabled &&
        !mediaSettings.isAnimojiEnabled &&
        device.streamMode === MediaType.CAMERA) {
        deviceData.streamMode = getNewStreamModeByDevice(MediaType.CAMERA, device, false);
    }
    if (!mediaSettings.isScreenSharingEnabled && device.streamMode === MediaType.SCREEN) {
        deviceData.streamMode = getNewStreamModeByDevice(MediaType.SCREEN, device, false);
    }
    // кейс на включение, с сохраненным стримом
    if (!device.streamMode) {
        if (mediaSettings.isScreenSharingEnabled && device.screenSharingStream) {
            deviceData.streamMode = getNewStreamModeByDevice(MediaType.SCREEN, device, true);
        }
        else if ((mediaSettings.isVideoEnabled && device.stream) ||
            (mediaSettings.isAnimojiEnabled && (device.stream || device.animojiStream))) {
            deviceData.streamMode = getNewStreamModeByDevice(MediaType.CAMERA, device, true);
        }
    }
    return deviceData;
}
export const getDeviceHasVideo = (device) => {
    return !!device && (isParticipantWithVideo(device) || isParticipantWithMovie(device));
};
export const getSingleLetter = (name) => {
    return name.length ? name[0] : '';
};
//# sourceMappingURL=participant.js.map