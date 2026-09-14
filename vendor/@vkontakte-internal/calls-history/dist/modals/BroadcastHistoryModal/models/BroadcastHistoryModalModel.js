import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, runInAction } from 'mobx';
import { createProvider, destroy, init, Props, scope } from '@vkontakte-internal/di';
import { Langs, VideoApi } from '@vkontakte-internal/plugins';
import { handlePromiseError } from '../../../helpers/logger';
import { HistoryConfigService } from '../../../services/HistoryConfig';
import { ModalControlService } from '../../../services/ModalControlService';
import { processVideoArray, padVideoArray } from '../helpers';
import { CallEventType } from '@vkontakte-internal/vk-analytics-events';
import { CallHistoryAnalytics } from '../../../analytics';
const BROADCAST_HISTORY_LIMIT = 3;
let BroadcastHistoryModalModel = class BroadcastHistoryModalModel {
    constructor(langs, historyConfig, modalService, videoApi, props, analyticsService) {
        this.langs = langs;
        this.historyConfig = historyConfig;
        this.modalService = modalService;
        this.videoApi = videoApi;
        this.props = props;
        this.analyticsService = analyticsService;
        this._page = 1;
        this._loading = true;
        this._hasError = false;
        this._videoPreviews = [];
        this._broadcastsVideoPreview = {};
        this.onPageChange = (page) => {
            this.setPage(page);
            this.cleanUp();
            this.fetchBroadcasts(page);
        };
        this.closeModal = () => {
            this.modalService.closeModal();
        };
        this.onVideoOpen = (video) => {
            this.analyticsService.send(CallEventType.RECORD_HISTORY_VIDEO_OPENED, {
                group_id: this.ownerId,
                vid: video.id,
            });
        };
        this.cleanUp = () => {
            this.abortController?.abort();
        };
        makeAutoObservable(this);
    }
    get page() {
        return this._page;
    }
    get loading() {
        return this._loading;
    }
    get hasError() {
        return this._hasError;
    }
    get videoPreviews() {
        return this._videoPreviews;
    }
    get callTitle() {
        return this.props.current.callTitle;
    }
    get broadcasts() {
        return this.props.current.broadcasts;
    }
    get callId() {
        return this.props.current.callId;
    }
    get ownerId() {
        return this.props.current.ownerId;
    }
    get totalPages() {
        return Math.ceil(this.broadcasts.length / BROADCAST_HISTORY_LIMIT);
    }
    get broadcastsIds() {
        const startIndex = (this.page - 1) * BROADCAST_HISTORY_LIMIT;
        return this.broadcasts.slice(startIndex, startIndex + BROADCAST_HISTORY_LIMIT);
    }
    setPage(value) {
        this._page = value;
    }
    setLoading(value) {
        this._loading = value;
    }
    setHasError(value) {
        this._hasError = value;
    }
    setVideoPreviews(value) {
        this._videoPreviews = value;
    }
    [destroy]() {
        this.cleanUp();
    }
    async [init]() {
        await this.fetchBroadcasts(this.page);
    }
    async fetchBroadcasts(page) {
        this.setHasError(false);
        const storedBroadcasts = this._broadcastsVideoPreview[this.callId]?.[page];
        if (storedBroadcasts) {
            this.setVideoPreviews(storedBroadcasts);
            return;
        }
        this.setLoading(true);
        this.abortController = new AbortController();
        try {
            const { count, items } = await this.videoApi.get({
                owner_id: this.ownerId,
                videos: this.broadcastsIds.join(','),
                need_privacy: 0,
            }, {
                signal: this.abortController.signal,
            });
            const { processedItems, leftBroadcastIds } = processVideoArray(items, this.historyConfig.config.sferum, this.broadcastsIds);
            const previews = this.broadcastsIds.length > count
                ? padVideoArray(processedItems, this.langs.getLang, leftBroadcastIds)
                : processedItems;
            runInAction(() => {
                this._broadcastsVideoPreview = {
                    ...this._broadcastsVideoPreview,
                    [this.callId]: {
                        ...this._broadcastsVideoPreview[this.callId],
                        [page]: previews,
                    },
                };
            });
            this.setVideoPreviews(previews);
            this.setLoading(false);
        }
        catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                handlePromiseError(error);
                this.setLoading(false);
                this.setHasError(true);
            }
        }
    }
};
BroadcastHistoryModalModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Langs,
        HistoryConfigService,
        ModalControlService,
        VideoApi,
        Props,
        CallHistoryAnalytics])
], BroadcastHistoryModalModel);
export const { Provider: BroadcastHistoryModalProvider, useModel: useBroadcastHistoryModal } = createProvider(BroadcastHistoryModalModel);
//# sourceMappingURL=BroadcastHistoryModalModel.js.map