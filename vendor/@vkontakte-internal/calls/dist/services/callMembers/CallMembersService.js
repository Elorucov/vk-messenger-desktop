import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { MessagesApi } from '@vkontakte-internal/plugins';
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { DebugMessageType, ExternalIdType } from '@vkontakte/calls-sdk';
import { debounce } from '@vkontakte/vkjs';
import { isParticipantAnonym } from '../../helpers/participant';
import { normalizeGroup, normalizeUser } from '../../helpers/user';
import { StateBridge } from '../../utils/stateBridge';
import { baseUserFields } from '../backend';
import { CallsSdkService } from '../sdk';
let CallMembersService = class CallMembersService {
    constructor(messagesApi, sdkService, stateBridge) {
        this.messagesApi = messagesApi;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        /**
         * Нужно для чанков
         * Пока функционал выпилен в CallParticipantListModel
         */
        this.findCallMembersDebounced = debounce(async ({ searchQuery, onSuccess, onError, signal, }) => {
            try {
                const [members, externalIds] = await this.findCallMembers(searchQuery, signal);
                onSuccess(members, externalIds);
            }
            catch (err) {
                if (!signal.aborted) {
                    onError(err);
                }
            }
        }, 1000);
    }
    async getCallMembersByPeerIds(peerIdsToLoad) {
        return this.toMembersList(await this.getCallParticipants({ peerIds: peerIdsToLoad }));
    }
    findCallMembers(searchQuery, signal) {
        return this.getCallParticipants({
            searchQuery,
        }, { signal }).then((response) => {
            return [this.toMembersList(response), this.toSdkExternalIdList(response)];
        });
    }
    isParticipantInCall(peerId) {
        const { me, participants } = this.stateBridge;
        if (peerId === me) {
            return true;
        }
        const participant = participants[peerId];
        if (!participant) {
            return false;
        }
        return this.someDeviceByParticipant(participant, (device) => !!device.status);
    }
    isParticipantUnavailableToCallFromGroup(id) {
        const { callMembers } = this.stateBridge;
        if (!callMembers.unableToCallGroupMembersIds) {
            return false;
        }
        return callMembers.unableToCallGroupMembersIds.includes(id);
    }
    someDeviceByParticipant(participant, isValidDevice) {
        if (!participant) {
            return false;
        }
        const { devices, maps: { peerIdToDevices }, } = this.stateBridge;
        const deviceSet = peerIdToDevices.get(participant.peerId);
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
    async getCallParticipants({ searchQuery, peerIds }, fetchOptions) {
        const { anonymSecret, callData, me: myPeerId } = this.stateBridge;
        const isAnonymous = isParticipantAnonym(myPeerId);
        let params = {
            call_id: callData.callId ?? '',
            fields: baseUserFields,
            participant_ids: peerIds?.join(','),
            search: searchQuery,
        };
        if (isAnonymous) {
            params = { ...params, device_id: 'anyId', secret: anonymSecret, user_id: peerIdToVkId(myPeerId) };
        }
        const response = await this.messagesApi.getCallParticipants(params, fetchOptions);
        // TODO replace with sdkService method after vmoji MR
        this.sdkService.getSdk().debugMessage(DebugMessageType.DEBUG, { type: 'response', data: response });
        return response;
    }
    toMembersList({ profiles = [], anonyms = [], groups = [], }) {
        return [...anonyms.map(normalizeUser), ...profiles.map(normalizeUser), ...groups.map(normalizeGroup)];
    }
    toSdkExternalIdList({ profiles = [], anonyms = [], groups = [], }) {
        return [
            ...anonyms.map(({ id }) => ({ id: String(id), type: ExternalIdType.ANONYM })),
            ...profiles.map(({ id }) => ({ id: String(id), type: ExternalIdType.USER })),
            ...groups.map(({ id }) => ({ id: String(-id), type: ExternalIdType.GROUP })),
        ];
    }
};
CallMembersService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [MessagesApi,
        CallsSdkService,
        StateBridge])
], CallMembersService);
export { CallMembersService };
//# sourceMappingURL=CallMembersService.js.map