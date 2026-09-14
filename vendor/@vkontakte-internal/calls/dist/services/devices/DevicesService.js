import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, reaction } from 'mobx';
import { getActiveDevicesCount, getDevicesInMyRoom, getVoiceRoomActiveDevicesCount, getCallVisibleParticipant, isAnyoneWithVideo, getRenderedParticipantListBoundaryIndexes, isSameExternalId, externalIdToString, participantIsAdmin, objectReduce, roomIdToString, ROOM_MAIN_ID, isParticipantAnonym, isSharedMiniAppShownFromDevice, isParticipantScreenSharingEnabled, objectMap, mapParticipantPermissions, } from '@vkontakte-internal/calls-core';
import { scope } from '@vkontakte-internal/di';
import { RoomsService } from '../../features/rooms/services/RoomsService';
import { StateBridge } from '../../utils/stateBridge/StateBridge';
import { MediaType, ParticipantStatus } from '@vkontakte/calls-sdk';
import { E_ACTION, ROOM_UNDEFINED_ID } from '../../constants';
import { PinnedParticipantService } from '../PinnedParticipantService';
import { screenShareNotVisibleStat } from '../../stats/ScreenShareNotVisible';
import { CallsSdkService } from '../sdk';
const DEFAULT_THROTTLE_TIMEOUT = 100;
export const ORATOR_SCROLL_NUMBER_OF_VISIBLE = 5;
export const GRID_SCROLL_NUMBER_OF_VISIBLE = 30;
let DevicesService = class DevicesService {
    constructor(roomsService, stateBridge, pinnedParticipantsService, sdkService) {
        this.roomsService = roomsService;
        this.stateBridge = stateBridge;
        this.pinnedParticipantsService = pinnedParticipantsService;
        this.sdkService = sdkService;
        this._activeDevicesCache = [];
        this._throttleAccumulateDevicesState = {};
        this._throttleAccumulateDevicesStateTimer = 0;
        this._firstVisibleDevice = 0;
        this._devicesVisibleCount = ORATOR_SCROLL_NUMBER_OF_VISIBLE;
        this._stopWatchMode = null;
        this._getMuteStatesAbortController = null;
        this.clear = () => {
            this._stopWatchMode?.();
        };
        this.getParticipantsMuteStates = () => {
            this.abortGetParticipants();
            const controller = new AbortController();
            this._getMuteStatesAbortController = controller;
            const externalIds = objectMap(this.devices, (device) => device.externalId);
            if (!externalIds.length) {
                return;
            }
            this.sdkService
                .getSdk()
                .getParticipants({ externalIds })
                .then((participants) => {
                if (controller.signal.aborted) {
                    // do nothing
                    return;
                }
                for (const participant of participants) {
                    if (!participant.muteStates) {
                        continue;
                    }
                    this.throttleAccumulateDispatchParticipant(participant.uid, {
                        permissions: mapParticipantPermissions(participant.muteStates),
                    });
                }
            });
        };
        this.getCountParticipantsByRooms = (roomId) => {
            function getCounterForInactiveRooms(rooms, devices, participants) {
                let devicesCount = Object.values(devices).filter((device) => {
                    // убираем админов из расчета
                    const participant = participants[device.externalId.id];
                    return !participantIsAdmin(participant);
                }).length;
                const counter = objectReduce(rooms, (acc, room) => {
                    const stringRoomId = roomIdToString(room.id);
                    const inRoomActiveCount = room.participantIds.filter(
                    // Если участник привязан к залу, но не в звонке, то он все равно будет в room.participantIds, поэтому игнорируем его
                    (externalId) => devices.hasOwnProperty(externalIdToString(externalId))).length;
                    acc[stringRoomId] = inRoomActiveCount;
                    devicesCount -= inRoomActiveCount;
                    return acc;
                }, {});
                counter[roomIdToString(ROOM_MAIN_ID)] = devicesCount;
                return counter;
            }
            function getCounterForActiveRooms(devices, participants) {
                return objectReduce(devices, (acc, device) => {
                    const roomId = device?.roomId !== undefined ? device.roomId : ROOM_MAIN_ID;
                    const participant = participants[device.externalId.id];
                    const isAdmin = participantIsAdmin(participant);
                    if (isAdmin && roomId === ROOM_MAIN_ID) {
                        return acc;
                    }
                    const stringRoomId = roomIdToString(roomId);
                    acc[stringRoomId] = (acc[stringRoomId] ?? 0) + 1;
                    return acc;
                }, {});
            }
            const counter = this.roomsService.isRoomsActivated
                ? getCounterForActiveRooms(this.stateBridge.devices, this.stateBridge.participants)
                : getCounterForInactiveRooms(this.roomsService.rooms, this.stateBridge.devices, this.stateBridge.participants);
            const stringRoomId = typeof roomId === 'string' ? roomId : roomIdToString(roomId);
            return counter[stringRoomId] ?? 0;
        };
        this.setFirstVisibleDevice = (value) => {
            this._firstVisibleDevice = value;
        };
        this.setDevicesVisibleCount = (value) => {
            this._devicesVisibleCount = value;
        };
        this.getDeviceByExternalId = (externalId) => {
            const isMe = isSameExternalId(this.stateBridge.externalId, externalId);
            return isMe ? this.stateBridge.localDevice : this.stateBridge.devices[externalIdToString(externalId)];
        };
        this.getDeviceStreamData = ({ device, isMe, isOrator, isSausageStream, topology, }) => {
            if (!device) {
                return undefined;
            }
            if (isMe) {
                return this.getStream(device);
            }
            const isServerTopology = topology === "SERVER" /* TransportTopology.SERVER */;
            return isSausageStream
                ? this.getSausageStream(device, {
                    isOrator,
                    animojiBackendRender: isServerTopology,
                })
                : this.getStream(device, { animojiBackendRender: isServerTopology });
        };
        this.updateParticipantsBatch = (data) => {
            this.stateBridge.dispatch({
                type: E_ACTION.UPDATE_PARTICIPANTS_BATCH,
                data,
            });
        };
        this.throttleAccumulateDispatchParticipant = (externalId, deviceState) => {
            const id = externalIdToString(externalId);
            const data = {
                ...deviceState,
                externalId,
            };
            /**
             * onRoomParticipantsUpdated срабатывает два раза: добавляет куда-то и удаляет откуда-то юзера.
             * Сначала мы сюда придем со значением roomId куда нас добавили, но потом с roomId удаления, который перетрет нужное нам значение.
             * Поэтому необходима такая проверка.
             * Ситуация, когда разлетится по разным батчам
             */
            if (data.roomId === ROOM_UNDEFINED_ID && this._throttleAccumulateDevicesState[id]?.roomId !== undefined) {
                delete data.roomId;
            }
            this._throttleAccumulateDevicesState[id] =
                this._throttleAccumulateDevicesState[id] && typeof this._throttleAccumulateDevicesState[id] === 'object'
                    ? { ...this._throttleAccumulateDevicesState[id], ...data }
                    : data;
            if (this._throttleAccumulateDevicesStateTimer) {
                clearTimeout(this._throttleAccumulateDevicesStateTimer);
            }
            this._throttleAccumulateDevicesStateTimer = setTimeout(() => {
                this.updateParticipantsBatch(this._throttleAccumulateDevicesState);
                this._throttleAccumulateDevicesState = {};
                this._throttleAccumulateDevicesStateTimer = 0;
            }, DEFAULT_THROTTLE_TIMEOUT);
        };
        makeAutoObservable(this);
        this._stopWatchMode = reaction(() => {
            return {
                isOratorMode: this.stateBridge.isOratorMode,
                roomId: this.roomsService.roomId,
            };
        }, (current, prev) => {
            if (current.isOratorMode !== prev.isOratorMode || current.roomId !== prev.roomId) {
                this.setFirstVisibleDevice(0);
                this.setDevicesVisibleCount(current.isOratorMode ? ORATOR_SCROLL_NUMBER_OF_VISIBLE : GRID_SCROLL_NUMBER_OF_VISIBLE);
            }
        });
    }
    abortGetParticipants() {
        if (this._getMuteStatesAbortController) {
            this._getMuteStatesAbortController.abort();
            this._getMuteStatesAbortController = null;
        }
    }
    queryThrottledAccumulatedState(externalId) {
        const id = externalIdToString(externalId);
        const throttledDeviceState = this._throttleAccumulateDevicesState[id];
        if (throttledDeviceState) {
            return throttledDeviceState;
        }
    }
    get isCallWithVideo() {
        return isAnyoneWithVideo({
            localDevice: this.stateBridge.localDevice,
            devices: this.stateBridge.devices,
        });
    }
    get visibleParticipant() {
        return getCallVisibleParticipant({
            adminPinnedParticipant: this.pinnedParticipantsService.adminPinnedParticipant,
            watchTogetherPinnedParticipant: this.pinnedParticipantsService.watchTogetherPinnedParticipant,
            mediaSharingPinnedParticipant: this.pinnedParticipantsService.mediaSharingPinnedParticipant,
            pinnedParticipant: this.pinnedParticipantsService.pinnedParticipant,
            orator: this.pinnedParticipantsService.orator,
            peer: this.stateBridge.peer,
            me: this.stateBridge.me,
            devices: this.stateBridge.devices,
            roomId: this.roomsService.roomId,
            participantIdsByMyRoomId: this.roomsService.participantIdsByMyRoomId,
            localDevice: this.stateBridge.localDevice,
            myExternalId: this.stateBridge.externalId,
            isVideoCall: this.isCallWithVideo,
        });
    }
    get activeDevicesCount() {
        return getActiveDevicesCount({
            devices: this.stateBridge.devices,
            participantsChunk: this.stateBridge.participantsChunk,
            participantIdsByMyRoomId: this.roomsService.participantIdsByMyRoomId,
        });
    }
    // todo Вынести в отдельный сервис VoiceRoomsDevicesService
    get voiceRoomActiveDevicesCount() {
        return getVoiceRoomActiveDevicesCount({
            devices: this.stateBridge.devices,
            participantsChunk: this.stateBridge.participantsChunk,
            isMeListener: this.stateBridge.restrictedConversation,
            participantIdsByMyRoomId: this.roomsService.participantIdsByMyRoomId,
        });
    }
    get devicesInMyRoom() {
        return getDevicesInMyRoom({
            roomId: this.roomsService?.roomId,
            devices: this.stateBridge.devices,
            localDevice: this.stateBridge.localDevice,
        });
    }
    /**
     * Получает количество не анонимных и не с моим peerId участников которые уже подключены к звонку.
     */
    getNonAnonymousConnectedParticipantsCount() {
        const { devices, me: myPeerId, participants } = this.stateBridge;
        return objectReduce(devices, (acc, device) => {
            if (device.externalId.id === myPeerId) {
                return acc; // если мой девайс
            }
            if (device.status !== ParticipantStatus.CONNECTED) {
                return acc; // если не соединен
            }
            if (isParticipantAnonym(device.externalId)) {
                return acc; // если аноним
            }
            const participant = participants[device.externalId.id];
            if (participantIsAdmin(participant)) {
                acc.admins++;
            }
            acc.users++;
            return acc;
        }, 
        // не включаем себя
        { users: 0, admins: 0 });
    }
    get activeDevices() {
        const devices = this.stateBridge.devices;
        const localDevice = this.stateBridge.localDevice;
        const externalId = this.stateBridge.externalId;
        const adminPinnedParticipant = this.pinnedParticipantsService.adminPinnedParticipant;
        const participantIdsByMyRoomId = this.roomsService.participantIdsByMyRoomId;
        const hands = [];
        const adminPin = [];
        const isMe = [];
        const watchTogether = [];
        const urlSharing = [];
        const screenSharing = [];
        const video = [];
        const animoji = [];
        const others = [];
        const handleDevice = (device) => {
            if (!device.status) {
                // do nothing
            }
            else if (device.statusData?.hand?.state) {
                hands.push(device);
            }
            else if (isSameExternalId(device.externalId, adminPinnedParticipant)) {
                adminPin.push(device);
            }
            else if (isSameExternalId(device.externalId, externalId)) {
                isMe.push(device);
            }
            else if (device.movieStreamInfo && device.movieStream) {
                watchTogether.push(device);
            }
            else if (isSharedMiniAppShownFromDevice(device)) {
                urlSharing.push(device);
            }
            else if (isParticipantScreenSharingEnabled(device)) {
                screenSharing.push(device);
            }
            else if (device.mediaSettings?.isVideoEnabled) {
                video.push(device);
            }
            else if (device.mediaSettings?.isAnimojiEnabled) {
                animoji.push(device);
            }
            else {
                others.push(device);
            }
            if (device.screenSharingStream) {
                screenShareNotVisibleStat.measure(device.externalId);
            }
        };
        for (const participantId of participantIdsByMyRoomId) {
            if (devices[participantId.idString]) {
                handleDevice(devices[participantId.idString]);
            }
        }
        if (externalId) {
            handleDevice({
                ...localDevice,
                externalId,
            });
        }
        return [
            ...hands.sort((a, b) => (a.statusData?.hand?.ts ?? 0) - (b?.statusData?.hand?.ts ?? 0)),
            ...adminPin,
            ...isMe,
            ...watchTogether,
            ...urlSharing,
            ...screenSharing,
            ...video,
            ...animoji,
            ...others,
        ];
    }
    get activeParticipantsListAll() {
        return this.activeDevices;
    }
    get renderedBoundaryIndexes() {
        return getRenderedParticipantListBoundaryIndexes({
            participantsChunk: this.stateBridge.participantsChunk,
            isOratorMode: this.stateBridge.isOratorMode,
            firstVisible: this.firstVisibleDevice,
            visibleCount: this.devicesVisibleCount,
        });
    }
    get activeParticipantsList() {
        const { start, end } = this.renderedBoundaryIndexes;
        return this.activeDevices.slice(start, end);
    }
    get firstVisibleDevice() {
        return this._firstVisibleDevice;
    }
    get devicesVisibleCount() {
        return this._devicesVisibleCount;
    }
    getStream(device, params) {
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
    getSausageStream(participant, { isOrator, animojiBackendRender, }) {
        const { stream, screenSharingStream, animojiStream, movieStream, streamMode, mediaSettings, movieStreamInfo, } = participant;
        const isScreenSharingEnabled = !!(screenSharingStream && mediaSettings.isScreenSharingEnabled);
        const isAnimojiEnabled = !!(animojiStream && mediaSettings.isAnimojiEnabled);
        const isCameraEnabled = !!(stream &&
            (mediaSettings.isVideoEnabled || (mediaSettings.isAnimojiEnabled && !!animojiBackendRender)));
        const isMovieEnabled = !!(movieStream && movieStreamInfo);
        if (isOrator) {
            return this.getStream(participant, {
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
    get visibleParticipantStreamData() {
        return this.getDeviceStreamData({
            isMe: false,
            isOrator: false,
            isSausageStream: false,
            device: this.visibleParticipant,
            topology: this.stateBridge.callData?.topology,
        });
    }
    get devices() {
        return this.stateBridge.devices;
    }
    updateRooms(rooms) {
        const data = {};
        for (const room of rooms) {
            const existingRoom = this.roomsService.rooms[room.id];
            let participantIds = existingRoom?.participantIds ?? [];
            const currentRoomIdsSet = participantIds.reduce((acc, externalId) => {
                acc.add(externalIdToString(externalId));
                return acc;
            }, new Set());
            if (room?.participants?.participants) {
                // Обновляем roomId в девайсах для тех участников, кто в зале
                room.participants.participants.forEach((participant) => {
                    this.throttleAccumulateDispatchParticipant(participant.uid, { roomId: room.id });
                });
            }
            if (room?.participantIds?.length) {
                participantIds = room.participantIds;
            }
            if (room?.addParticipantIds?.length) {
                const filteredIds = room.addParticipantIds.filter((externalId) => !currentRoomIdsSet.has(externalIdToString(externalId)));
                participantIds = participantIds.concat(filteredIds);
            }
            if (room?.removeParticipantIds?.length) {
                const removedParticipantIds = room.removeParticipantIds;
                participantIds = participantIds.filter((participantId) => {
                    for (const removedParticipantId of removedParticipantIds) {
                        if (isSameExternalId(participantId, removedParticipantId)) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            data[room.id] = {
                id: room.id,
                active: room.active ?? existingRoom?.active ?? false,
                name: room.name || existingRoom?.name || '',
                participantIds,
                muteStates: room.muteStates || (existingRoom?.muteStates ?? {}),
                timeoutMs: room.timeoutMs,
                countdownSec: room.countdownSec,
            };
        }
        this.roomsService.updateRooms(data);
    }
};
DevicesService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [RoomsService,
        StateBridge,
        PinnedParticipantService,
        CallsSdkService])
], DevicesService);
export { DevicesService };
//# sourceMappingURL=DevicesService.js.map