import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { VideoSuspendService } from '../../../../services/videoSuspend';
import { createProvider, scope } from '@vkontakte-internal/di';
let VideoSuspendSuggestNotificationModel = class VideoSuspendSuggestNotificationModel {
    constructor(videoSuspendService) {
        this.videoSuspendService = videoSuspendService;
        this.enableAutoMode = () => {
            this.videoSuspendService.enableAutoMode();
        };
        makeAutoObservable(this);
    }
};
VideoSuspendSuggestNotificationModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [VideoSuspendService])
], VideoSuspendSuggestNotificationModel);
export { VideoSuspendSuggestNotificationModel };
export const { useModel: useVideoSuspendSuggestNotificationModel, Provider: VideoSuspendSuggestNotificationProvider, } = createProvider(VideoSuspendSuggestNotificationModel);
//# sourceMappingURL=VideoSuspendSuggestNotificationModel.js.map