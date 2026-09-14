import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { DevicesService } from '../../services/devices/DevicesService';
let VideoZoomModel = class VideoZoomModel {
    constructor(props, devicesService) {
        this.props = props;
        this.devicesService = devicesService;
        makeAutoObservable(this);
    }
    get visibleParticipant() {
        return this.devicesService.visibleParticipant;
    }
};
VideoZoomModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        DevicesService])
], VideoZoomModel);
export const { Provider: VideoZoomProvider, useModel: useVideoZoomModel } = createProvider(VideoZoomModel);
//# sourceMappingURL=model.js.map