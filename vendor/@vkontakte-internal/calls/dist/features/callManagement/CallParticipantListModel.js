import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope, destroy } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { RoomsService } from '../rooms';
import { StateBridge } from '../../utils/stateBridge';
import { ClickHouseEventType, externalIdToString, isAdmin, isCreator, isSameExternalId, peerIdToVkId, } from '@vkontakte-internal/calls-core';
import { DevicesService } from '../../services/devices/DevicesService';
import { SpeakersService } from '../../services/speakers';
import { addParticipantsInCacheAndLoadInfo, getParticipantListChunk, } from '../../helpers/participantsListChunk';
import { E_ACTION } from '../../constants';
import { searchCallParticipants } from '../../services/backend';
import { ExternalIdType, MediaOption } from '@vkontakte/calls-sdk';
import { normalizeGroup, normalizeUser } from '../../helpers/user';
import { handlePromiseError } from '../../helpers/logger';
import { isUndefined } from '@vkontakte/vkjs';
import { objectReduce } from '../../helpers/helpers';
import { CallsSdkService } from '../../services/sdk';
import { VkIndexer } from '@vkontakte-internal/vkjs/lib/Indexer';
import { CallsConfigService } from '../../services/config';
import { ReactionsAggregator } from '@vkontakte-internal/mobx-utils';
import { getSortingPriority } from './utils';
import { sendStats } from '../../stats/clickHouse';
import { createSdkParticipantState } from '../../helpers/participant';
import { CallService } from '../../services/call';
import { ParticipantsService } from '../../services/participants';
import { PinnedParticipantService } from '../../services/PinnedParticipantService';
export const CALL_PARTICIPANTS_PAGE_SIZE = 100;
let ParticipantListModel = class ParticipantListModel {
    constructor(props, stateBridge, devicesService, roomsService, speakersService, sdkService, configService, callService, pinnedParticipantService, participantsService) {
        this.props = props;
        this.stateBridge = stateBridge;
        this.devicesService = devicesService;
        this.roomsService = roomsService;
        this.speakersService = speakersService;
        this.sdkService = sdkService;
        this.configService = configService;
        this.callService = callService;
        this.pinnedParticipantService = pinnedParticipantService;
        this.participantsService = participantsService;
        this._isListLoading = false;
        this._loadedDevicesIds = [];
        this._abortController = null;
        this._indexer = undefined;
        this._searchQuery = '';
        this._currentLimit = CALL_PARTICIPANTS_PAGE_SIZE;
        this.reactions = new ReactionsAggregator();
        this.setSearchQuery = (value) => {
            this._searchQuery = value;
        };
        this.getParticipantsFromVK = () => {
            searchCallParticipants(this.stateBridge.callData.callId ?? '', {
                search: this._searchQuery,
            }, { signal: this._abortController?.signal })
                .then(({ profiles = [], anonyms = [], groups = [] }) => {
                const members = [];
                const externalIds = [];
                anonyms.forEach((member) => {
                    members.push(normalizeUser(member));
                    externalIds.push(memberToExternalId(member, ExternalIdType.ANONYM));
                });
                profiles.forEach((member) => {
                    members.push(normalizeUser(member));
                    externalIds.push(memberToExternalId(member, ExternalIdType.USER));
                });
                groups.forEach((member) => {
                    members.push(normalizeGroup(member));
                    externalIds.push(memberToExternalId(member, ExternalIdType.GROUP));
                });
                this.stateBridge.dispatch({ type: E_ACTION.LOAD_PEERS, members });
                return externalIds;
            })
                .then((externalIds) => {
                return this.sdk.getParticipants({
                    externalIds,
                });
            })
                .then((participants) => {
                if (this._abortController?.signal.aborted) {
                    return;
                }
                const deviceIds = participants.map(({ uid }) => externalIdToString(uid));
                this.callService.addParticipantsToStoreThrottled({
                    participants,
                    targetRoomId: null,
                });
                this.setLoadedDevicesIds(deviceIds);
            })
                .catch(handlePromiseError);
            function memberToExternalId(member, type) {
                return {
                    id: String(member.id),
                    type,
                };
            }
        };
        this.idGetter = (device) => externalIdToString(device.externalId);
        this.nameGetter = (device) => {
            let peerId = device.externalId.id;
            let participant = this.stateBridge.participants[peerId];
            if (!participant) {
                const realPeerId = this.stateBridge.changedParticipantIds?.get(peerId);
                participant = realPeerId ? this.stateBridge.participants[realPeerId] : undefined;
            }
            return participant?.name ?? '';
        };
        this.putAllHandsDown = () => {
            this.sdkService.getSdk().putHandsDown().catch(handlePromiseError);
        };
        this.putHandDown = (device) => {
            this.sdkService
                .getSdk()
                .changeParticipantState(createSdkParticipantState(device.statusData, { hand: false }), device.externalId)
                .then(() => sendStats(ClickHouseEventType.USER_HAND_LOWERED))
                .catch(handlePromiseError);
        };
        this.unmuteDevice = (device) => {
            this.sdkService
                .getSdk()
                .muteParticipant({
                externalId: device.externalId,
                muteStates: {},
                requestedMedia: [MediaOption.AUDIO, MediaOption.VIDEO, MediaOption.SCREEN_SHARING],
            })
                .then(() => sendStats(ClickHouseEventType.ASK_USER_TO_UNMUTE))
                .catch(handlePromiseError);
        };
        this.increaseLimit = () => {
            this._currentLimit += CALL_PARTICIPANTS_PAGE_SIZE;
        };
        makeAutoObservable(this);
        this._indexer = new VkIndexer(this.searchableDevices, this.nameGetter);
        this.reactions.reaction(() => ({
            offset: this.offset,
            searchQuery: this._searchQuery,
        }), ({ searchQuery, offset }) => {
            this._abortController?.abort();
            this._abortController = new AbortController();
            this.setIsListLoading(true);
            (searchQuery ? this.getParticipantsFromVKDebounced() : this.getParticipantsFromSDK(offset)).finally(() => {
                this.setIsListLoading(false);
            });
        });
        this.reactions.reaction(() => ({
            searchableDevices: this.searchableDevices,
            searchableDevicesMap: this.searchableDevicesMap,
        }), ({ searchableDevices, searchableDevicesMap }, prev) => {
            const addedItems = searchableDevices.filter((item) => !prev.searchableDevicesMap[this.idGetter(item)]);
            const removedItems = prev.searchableDevices.filter((item) => !searchableDevicesMap[this.idGetter(item)]);
            if (addedItems.length || removedItems.length) {
                addedItems.forEach((item) => {
                    this._indexer?.add(item);
                });
                removedItems.forEach((item) => {
                    this._indexer?.remove(item);
                });
            }
        });
    }
    [destroy]() {
        this.reactions.dispose();
    }
    get searchQuery() {
        return this._searchQuery;
    }
    get currentLimit() {
        return this._currentLimit;
    }
    get offset() {
        return this._currentLimit - CALL_PARTICIPANTS_PAGE_SIZE;
    }
    get searchableDevices() {
        return this.activeDevicesList[1];
    }
    get searchableDevicesMap() {
        return this.searchableDevices.reduce((acc, item) => {
            acc[this.idGetter(item)] = true;
            return acc;
        }, {});
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
    get config() {
        return this.configService.getConfig();
    }
    setIsListLoading(value) {
        this._isListLoading = value;
    }
    setLoadedDevicesIds(value) {
        this._loadedDevicesIds = value;
    }
    get roomId() {
        return this.roomsService?.roomId;
    }
    get participantIdsByMyRoomId() {
        return this.roomsService?.participantIdsByMyRoomId;
    }
    get devicesInRoom() {
        return this.devicesService.devicesInMyRoom;
    }
    get activeDevicesCount() {
        return this.devicesService.activeDevicesCount;
    }
    get addUserClick() {
        return this.props.current.addUserClick;
    }
    get onLinkBlockClick() {
        return this.props.current.onLinkBlockClick;
    }
    get onShowMoreWaitingHall() {
        return this.props.current.onShowMoreWaitingHall;
    }
    get me() {
        return this.stateBridge.me;
    }
    get devices() {
        return this.stateBridge.devices;
    }
    get waitingHall() {
        return this.stateBridge.waitingHall;
    }
    get externalId() {
        return this.stateBridge.externalId;
    }
    get localDevice() {
        return this.stateBridge.localDevice;
    }
    get conversation() {
        return this.stateBridge.callData.conversation;
    }
    get speakers() {
        return this.speakersService.speakers;
    }
    getParticipantsFromVKDebounced() {
        const delay = 1000;
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                resolve(this.getParticipantsFromVK());
            }, delay);
            this._abortController?.signal.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                reject();
            }, { once: true });
        });
    }
    addParticipantsInCacheAndLoadInfo(devices) {
        const { dispatch } = this.stateBridge;
        const loadInfoPromise = this.participantsService.loadParticipantsVKInformation(devices.map(({ externalId }) => externalId));
        dispatch({
            type: E_ACTION.UPDATE_PARTICIPANTS_BATCH,
            data: devices.reduce((data, device) => {
                const deviceId = externalIdToString(device.externalId);
                data[deviceId] = device;
                return data;
            }, {}),
        });
        return loadInfoPromise;
    }
    getParticipantsFromSDK(offset) {
        return getParticipantListChunk(this.sdk, { fromIdx: offset, count: CALL_PARTICIPANTS_PAGE_SIZE }, { signal: this._abortController?.signal }).then((chunk) => {
            const { anonymSecret, callData, me, participants } = this.stateBridge;
            const devices = chunk.participants.map(({ uid, ...device }) => ({
                externalId: uid,
                ...device,
            }));
            const deviceIds = devices.map(({ externalId }) => externalIdToString(externalId));
            const loadParticipantsInformationPromise = this.config.enableParticipantsService
                ? this.addParticipantsInCacheAndLoadInfo(devices)
                : addParticipantsInCacheAndLoadInfo({ anonymSecret, callData, me, participants }, this.stateBridge.dispatch, devices);
            const isLoadedMore = offset >= this._loadedDevicesIds.length;
            this.setLoadedDevicesIds(isLoadedMore ? this._loadedDevicesIds.concat(deviceIds) : deviceIds);
            return loadParticipantsInformationPromise;
        });
    }
    get activeDevicesListRemoteSearch() {
        const devices = this.stateBridge.devices;
        const participants = this.stateBridge.participants;
        const loadedDevices = this._loadedDevicesIds.reduce((loadedDevices, deviceId) => {
            const device = devices[deviceId];
            if (device) {
                const id = device.externalId.id;
                const participant = participants[id];
                if (participant && participant.name) {
                    loadedDevices.push(device);
                }
            }
            return loadedDevices;
        }, this._searchQuery || !this.myDevice ? [] : [this.myDevice]);
        return {
            participants: this.sortDevices(loadedDevices),
            isLoading: this._isListLoading,
        };
    }
    get activeDevicesListClientSearch() {
        const [devices] = this.activeDevicesList;
        const foundDevices = this._searchQuery && this._indexer ? this._indexer.search(this._searchQuery) : devices;
        return {
            participants: this.sortDevices(foundDevices),
            isLoading: false,
        };
    }
    get myDevice() {
        if (this.stateBridge.externalId) {
            return {
                ...this.stateBridge.localDevice,
                externalId: this.stateBridge.externalId,
            };
        }
    }
    /**
     * Получает список участников для вывода и список участников, по которому можно искать
     *
     * Они могут не совпадать в процесе подгрузки данных для подключившихся участников
     */
    get activeDevicesList() {
        const result = [[], []];
        const handleDevice = (acc, device) => {
            const isMe = isSameExternalId(device.externalId, this.stateBridge.externalId);
            if (!isMe && device.roomId !== this.roomsService.roomId) {
                return acc;
            }
            const participant = this.stateBridge.participants[device.externalId.id];
            if (!participant || !device.status) {
                return acc;
            }
            acc[0].push(device);
            if (participant.name) {
                const deviceWithNoUndefinedFields = {};
                Object.keys(device).forEach((key) => {
                    const value = device[key];
                    if (!isUndefined(value)) {
                        deviceWithNoUndefinedFields[key] = value;
                    }
                });
                acc[1].push(deviceWithNoUndefinedFields);
            }
            return acc;
        };
        if (this.myDevice) {
            handleDevice(result, this.myDevice);
        }
        return objectReduce(this.stateBridge.devices, handleDevice, result);
    }
    get searchParticipants() {
        return this.config.enableParticipantListChunk
            ? this.activeDevicesListRemoteSearch
            : this.activeDevicesListClientSearch;
    }
    sortDevices(devices) {
        const { externalId: myExternalId, localDevice, participants, translation } = this.stateBridge;
        const { isOn: translationOn, isRecord: translationIsRecord, ownerId: translationOwnerId } = translation;
        const listParticipants = devices.map((device) => {
            const isMe = isSameExternalId(device.externalId, myExternalId);
            const participant = participants[device.externalId.id];
            const deviceWithRoles = isMe
                ? // чтобы изменение localDevice не триггерили перерисовки других строк
                    localDevice
                : participant;
            return {
                ...device,
                isCreator: isCreator(deviceWithRoles),
                isAdmin: isAdmin(deviceWithRoles),
                hasLiveTranslation: translationOn && !translationIsRecord && translationOwnerId === peerIdToVkId(device.externalId.id),
                isPinned: isSameExternalId(this.pinnedParticipantService.adminPinnedParticipant, device.externalId),
                isScreenShared: !!device.mediaSettings.isScreenSharingEnabled && !!device.screenSharingStream,
            };
        });
        return listParticipants.sort((lpA, lpB) => {
            const priorityA = getSortingPriority(lpA);
            const priorityB = getSortingPriority(lpB);
            return priorityA - priorityB;
        });
    }
};
ParticipantListModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        StateBridge,
        DevicesService,
        RoomsService,
        SpeakersService,
        CallsSdkService,
        CallsConfigService,
        CallService,
        PinnedParticipantService,
        ParticipantsService])
], ParticipantListModel);
export const { Provider: ParticipantListProvider, useModel: useParticipantListModel } = createProvider(ParticipantListModel);
//# sourceMappingURL=CallParticipantListModel.js.map