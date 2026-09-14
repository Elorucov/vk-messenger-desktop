import { __decorate, __metadata } from "tslib";
import { createProvider, scope, Props } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { PinnedParticipantService } from '../../../services/PinnedParticipantService';
import { StateBridge } from '../../../utils/stateBridge';
import { MainContentMode } from '../types';
import { WatchTogetherService } from '../../watchTogether/services/WatchTogetherService';
let MainContentModel = class MainContentModel {
    constructor(stateBridge, pinnedParticipantService, watchTogetherService, props) {
        this.stateBridge = stateBridge;
        this.pinnedParticipantService = pinnedParticipantService;
        this.watchTogetherService = watchTogetherService;
        this.props = props;
        makeAutoObservable(this);
    }
    get contentMode() {
        const screenShare = this.stateBridge.voiceRoom.screenShare;
        switch (true) {
            case Boolean(screenShare?.stream && screenShare?.owner): {
                return MainContentMode.SCREEN_SHARE;
            }
            case Boolean(this.watchTogetherService.movieInfo &&
                this.watchTogetherService.movieState &&
                this.watchTogetherService.stream):
                {
                    return MainContentMode.MOVIE_PLAYER;
                }
            case Boolean(this.pinnedParticipantService.pinnedParticipant): {
                return MainContentMode.PIN;
            }
            default: {
                return MainContentMode.GRID;
            }
        }
    }
};
MainContentModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        PinnedParticipantService,
        WatchTogetherService,
        Props])
], MainContentModel);
export { MainContentModel };
export const { Provider, useModel } = createProvider(MainContentModel);
//# sourceMappingURL=MainContentModel.js.map