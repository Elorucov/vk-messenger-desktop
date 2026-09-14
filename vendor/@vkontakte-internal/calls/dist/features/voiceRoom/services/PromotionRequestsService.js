import { __decorate, __metadata } from "tslib";
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { scope } from '@vkontakte-internal/di';
import { getAudienceModeHands } from '@vkontakte/calls-sdk';
import { isNumber } from '@vkontakte/vkjs';
import { batch } from 'react-redux';
import { setVoiceRoomPromotionRequests, setVoiceRoomPromotionRequestsProfiles, setVoiceRoomPromotionRequestsTotalCount, updateVoiceRoomPromotionRequests, updateVoiceRoomPromotionRequestsProfiles, } from '../model';
import { handlePromiseError } from '../../../helpers/logger';
import { mapExternalIdsToPeerIds, normalizeGroup, normalizeUser } from '../../../helpers/user';
import { StateBridge } from '../../../utils/stateBridge';
import { getIsPromotionRequestsSausageView, getVoiceRoomPromotionRequestsProfiles, getVoiceRoomPromotionRequestsRequests, getVoiceRoomPromotionRequestsTotalCount, } from '../selectors';
import { vou } from '../../../helpers/helpers';
import { isParticipantAnonym } from '../../../helpers/participant';
import { getCallParticipants } from '../../../services/backend';
let PromotionRequestsService = class PromotionRequestsService {
    constructor(stateBridge) {
        this.stateBridge = stateBridge;
    }
    async fullUpdate() {
        try {
            const { participants, totalCount, timestamps } = await getAudienceModeHands();
            const { dispatch, voiceRoom } = this.stateBridge;
            const requests = participants.map((externalId, index) => {
                const timestamp = timestamps[index] || Date.now();
                return {
                    externalId,
                    timestamp,
                };
            });
            batch(() => {
                dispatch(setVoiceRoomPromotionRequests(requests));
                dispatch(setVoiceRoomPromotionRequestsTotalCount(totalCount));
            });
            const isPromotionRequestsView = getIsPromotionRequestsSausageView({ voiceRoom });
            if (isPromotionRequestsView) {
                const peerIds = mapExternalIdsToPeerIds(participants);
                const data = await this.loadParticipants(peerIds);
                dispatch(setVoiceRoomPromotionRequestsProfiles(data));
            }
        }
        catch (e) {
            handlePromiseError(e);
        }
    }
    async partialUpdate({ added, removed, totalCount }) {
        try {
            const { dispatch } = this.stateBridge;
            if (added?.length) {
                const { voiceRoom } = this.stateBridge;
                if (isNumber(totalCount)) {
                    dispatch(setVoiceRoomPromotionRequestsTotalCount(totalCount));
                }
                dispatch(updateVoiceRoomPromotionRequests({ added: mapExternalIdsWithDefaultTimestamp(added) }));
                const isPromotionRequestsView = getIsPromotionRequestsSausageView({ voiceRoom });
                if (isPromotionRequestsView) {
                    const profiles = getVoiceRoomPromotionRequestsProfiles({ voiceRoom });
                    const peerIds = added.reduce((acc, externalId) => {
                        if (!profiles[externalId.id]) {
                            acc.push(externalId.id);
                        }
                        return acc;
                    }, []);
                    const addedProfiles = await this.loadParticipants(peerIds);
                    dispatch(updateVoiceRoomPromotionRequestsProfiles({ added: addedProfiles }));
                }
            }
            if (removed?.length) {
                const { voiceRoom } = this.stateBridge;
                const promotionRequests = getVoiceRoomPromotionRequestsRequests({ voiceRoom });
                const prevCount = getVoiceRoomPromotionRequestsTotalCount({ voiceRoom });
                const filteredRemoved = removed.filter((request) => !!promotionRequests[request.id]);
                // Для кейса когда слушатель поднял руку и вышел из комнаты, мы не получим необходимый эвент HAND_UP с бека.
                // В этом случае мы среагируем внутри эвента ATTENDE
                // totalCount необходимо посчитать руками
                const nextCount = totalCount || prevCount - filteredRemoved.length;
                batch(() => {
                    dispatch(setVoiceRoomPromotionRequestsTotalCount(nextCount));
                    dispatch(updateVoiceRoomPromotionRequests({ removed: filteredRemoved }));
                });
            }
        }
        catch (e) {
            handlePromiseError(e);
        }
    }
    async loadParticipants(ids) {
        const { anonymSecret, callData, me } = this.stateBridge;
        const meId = peerIdToVkId(me);
        const anonymId = vou(meId < 0, meId);
        const isMeAnonym = isParticipantAnonym(meId);
        const { profiles = [], anonyms = [], groups = [], } = await getCallParticipants(callData.callId ?? '', ids, anonymId, isMeAnonym, anonymSecret ?? '');
        return [...profiles.map(normalizeUser), ...groups.map(normalizeGroup), ...anonyms.map(normalizeUser)];
    }
};
PromotionRequestsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [StateBridge])
], PromotionRequestsService);
export { PromotionRequestsService };
function mapExternalIdsWithDefaultTimestamp(externalIds) {
    return externalIds.map((externalId) => ({
        externalId,
        timestamp: Date.now(),
    }));
}
//# sourceMappingURL=PromotionRequestsService.js.map