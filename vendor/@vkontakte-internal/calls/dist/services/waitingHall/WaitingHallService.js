import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { CallMembersService } from '../callMembers';
import { CallsSdkService } from '../sdk';
import { groupIdsOnToLoadAndExisted } from './utils';
import { getExternalIdByUserId } from '../../helpers/user';
let WaitingHallService = class WaitingHallService {
    constructor(callMembersService, sdkService) {
        this.callMembersService = callMembersService;
        this.sdkService = sdkService;
    }
    async loadWaitingHall({ firstParticipants, totalCount, waitingHall, }) {
        const externalIds = await this.getExternalIdsForWaitingHall(totalCount, firstParticipants);
        const { members: prevMembers, hasNew: prevHasNew } = waitingHall || {
            members: new Map(),
            hasNew: false,
        };
        const [peerIdsToLoad, peerIdsExisted] = groupIdsOnToLoadAndExisted(externalIds, prevMembers);
        const hasIdsToLoad = peerIdsToLoad.length > 0;
        const nextMembers = peerIdsExisted.reduce((nextMembers, intId) => {
            const prevMember = prevMembers.get(intId);
            if (prevMember) {
                nextMembers.set(intId, prevMember);
            }
            return nextMembers;
        }, new Map());
        const nextWaitingHall = {
            totalCount,
            members: nextMembers,
            hasNew: hasIdsToLoad ? true : prevHasNew,
        };
        if (!hasIdsToLoad) {
            return nextWaitingHall;
        }
        try {
            const members = await this.callMembersService.getCallMembersByPeerIds(peerIdsToLoad);
            members.forEach((user) => {
                if (user && user.peerId) {
                    nextWaitingHall.members.set(user.peerId, user);
                }
            });
            return nextWaitingHall;
        }
        catch (err) {
            return nextWaitingHall;
        }
    }
    loadWaitingHallFromScratch({ waitingHall }) {
        return this.getWaitingHall(null, undefined).then((response) => {
            return this.loadWaitingHall({
                waitingHall,
                totalCount: response.totalCount,
                firstParticipants: response.participants,
            });
        });
    }
    loadAdditionalWaitingHall({ waitingHall, }) {
        if (!waitingHall) {
            return Promise.resolve();
        }
        const totalCount = waitingHall.totalCount;
        const needLoadMore = totalCount > waitingHall.members.size;
        if (!needLoadMore) {
            return Promise.resolve();
        }
        return this.getWaitingHall(null, totalCount).then((response) => {
            return this.loadWaitingHall({
                totalCount: response.totalCount,
                firstParticipants: response.participants,
            });
        });
    }
    getWaitingHall(pageMarker, count, backward) {
        return this.sdkService.getSdk().getWaitingHall(pageMarker, count, backward);
    }
    getExternalIdsForWaitingHall(totalCount, firstParticipants) {
        if (firstParticipants.length === 0) {
            return Promise.resolve([]);
        }
        if (totalCount > firstParticipants.length) {
            return this.getWaitingHall(null, totalCount).then((response) => response.participants);
        }
        return Promise.resolve(firstParticipants);
    }
    promoteParticipant(peerId) {
        const externalId = getExternalIdByUserId(peerId);
        return this.sdkService.getSdk().promoteParticipant(externalId);
    }
};
WaitingHallService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallMembersService,
        CallsSdkService])
], WaitingHallService);
export { WaitingHallService };
//# sourceMappingURL=WaitingHallService.js.map