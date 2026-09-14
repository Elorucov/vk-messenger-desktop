import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { getFirstMatchedId } from '@vkontakte-internal/calls-core';
let PinnedParticipantService = class PinnedParticipantService {
    constructor() {
        this._orator = null;
        this._pinnedParticipant = null;
        this._adminPinnedParticipant = null;
        this._watchTogetherPinnedParticipant = null;
        this._mediaSharingOldPinnedParticipant = null;
        this._mediaSharingPinnedParticipant = null;
        this._mediaSharingNeedDisableOratorModeAfterStop = false;
        this.clear = () => {
            this.clearOrator();
            this.clearPinnedParticipant();
            this.clearAdminPinnedParticipant();
            this.clearMediaSharingPinnedParticipant();
            this.clearWatchTogetherPinnedParticipant();
        };
        this.setOrator = (data) => {
            this._orator = data;
        };
        this.setPinnedParticipant = (data) => {
            this._pinnedParticipant = data;
        };
        this.setAdminPinnedParticipant = (data) => {
            this._adminPinnedParticipant = data;
        };
        this.setWatchTogetherPinnedParticipant = (data) => {
            this._watchTogetherPinnedParticipant = data;
        };
        this.setMediaSharingPinnedParticipant = (externalId, shouldDisableAfterStop, prevExternalId) => {
            this._mediaSharingPinnedParticipant = externalId;
            this._mediaSharingNeedDisableOratorModeAfterStop = shouldDisableAfterStop;
            this._mediaSharingOldPinnedParticipant = prevExternalId || null;
        };
        this.clearOrator = () => {
            this.setOrator(null);
        };
        this.clearPinnedParticipant = () => {
            this.setPinnedParticipant(null);
        };
        this.clearAdminPinnedParticipant = () => {
            this.setAdminPinnedParticipant(null);
        };
        this.clearMediaSharingPinnedParticipant = () => {
            this.setMediaSharingPinnedParticipant(null, false, null);
        };
        this.clearWatchTogetherPinnedParticipant = () => {
            this.setWatchTogetherPinnedParticipant(null);
        };
        this.changeIdForContact = (prevPeerId, peerId) => {
            if (this.orator?.id === prevPeerId) {
                this._orator = {
                    ...this.orator,
                    id: peerId,
                };
            }
            if (this.pinnedParticipant?.id === prevPeerId) {
                this._pinnedParticipant = {
                    ...this.pinnedParticipant,
                    id: peerId,
                };
            }
            if (this.adminPinnedParticipant?.id === prevPeerId) {
                this._adminPinnedParticipant = {
                    ...this.adminPinnedParticipant,
                    id: peerId,
                };
            }
            if (this.mediaSharingPinnedParticipant?.id === prevPeerId) {
                this._mediaSharingPinnedParticipant = {
                    ...this.mediaSharingPinnedParticipant,
                    id: peerId,
                };
            }
            if (this.mediaSharingOldPinnedParticipant?.id === prevPeerId) {
                this._mediaSharingOldPinnedParticipant = {
                    ...this.mediaSharingOldPinnedParticipant,
                    id: peerId,
                };
            }
        };
        makeAutoObservable(this);
    }
    get orator() {
        return this._orator;
    }
    get pinnedParticipant() {
        return this._pinnedParticipant;
    }
    get adminPinnedParticipant() {
        return this._adminPinnedParticipant;
    }
    get watchTogetherPinnedParticipant() {
        return this._watchTogetherPinnedParticipant;
    }
    get mediaSharingOldPinnedParticipant() {
        return this._mediaSharingOldPinnedParticipant;
    }
    get mediaSharingPinnedParticipant() {
        return this._mediaSharingPinnedParticipant;
    }
    get mediaSharingNeedDisableOratorModeAfterStop() {
        return this._mediaSharingNeedDisableOratorModeAfterStop;
    }
    get firstMatchedId() {
        return getFirstMatchedId(this.adminPinnedParticipant, this.watchTogetherPinnedParticipant, this.mediaSharingPinnedParticipant, this.pinnedParticipant, this.orator);
    }
};
PinnedParticipantService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], PinnedParticipantService);
export { PinnedParticipantService };
//# sourceMappingURL=PinnedParticipantService.js.map