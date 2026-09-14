import { VideoFormat } from '@vkontakte/videoplayer';
import { joinRawId } from '@vkontakte-internal/shared';
import { fromApiVideo } from '../../data/converter/AttachConverter';
const CHECK_LIVE_HEARTBEAT_TIMEOUT = 5000;
const CHECK_UPCOMING_TIMEOUT = 15000;
const CHECK_STARTED_TIMEOUT = 3000;
const CHECK_FINISHED_TIMEOUT = 6000;
export class LiveChecker {
    api;
    updateVideo;
    initialized = false;
    ownerId;
    videoId;
    accessKey;
    startTime;
    callbacks;
    timeoutIdStart;
    timeoutIdFinish;
    timeoutIdLiveHeartBeat;
    isSentLiveStopHeartBeat;
    isSentFinishedVideoUpdate;
    constructVideoData;
    constructor(api, updateVideo) {
        this.api = api;
        this.updateVideo = updateVideo;
    }
    init({ video, callbacks, constructVideoData, }) {
        this.initialized = true;
        this.constructVideoData = constructVideoData;
        this.ownerId = video.ownerId;
        this.videoId = video.id;
        this.accessKey = video.accessKey;
        this.startTime = video.liveStartTime;
        this.callbacks = callbacks;
        if (this.isUpcoming(video.liveStatus) || this.isWaiting(video.liveStatus)) {
            void this.checkStarted();
        }
        else if (this.isStarted(video.liveStatus)) {
            void this.checkFinished();
            void this.startLiveHeartBeat();
        }
    }
    destroy() {
        this.initialized = false;
        window.clearTimeout(this.timeoutIdStart);
        window.clearTimeout(this.timeoutIdFinish);
        void this.stopLiveHeartBeat();
    }
    isUpcoming(status) {
        return status === 'upcoming';
    }
    isWaiting(status) {
        return status === 'waiting';
    }
    isStarted(status) {
        return status === 'started';
    }
    isFinished(status) {
        return status === 'finished';
    }
    isPostLive(status) {
        return status === 'postlive';
    }
    async checkStarted() {
        if (!this.ownerId || !this.videoId) {
            throw new Error('LiveChecker is not initialized');
        }
        try {
            const responseStatus = await this.api.fetch('video.getLiveStatus', {
                video_ids: joinRawId({
                    ownerId: this.ownerId,
                    itemId: this.videoId,
                    externalId: this.accessKey,
                }),
            });
            const liveStatus = responseStatus[0]?.live_status;
            if (this.isStarted(liveStatus)) {
                const responseVideo = await this.api.fetch('video.get', {
                    owner_id: this.ownerId,
                    videos: joinRawId({
                        ownerId: this.ownerId,
                        itemId: this.videoId,
                        externalId: this.accessKey,
                    }),
                    extended: 1,
                });
                const apiVideo = responseVideo.items?.[0];
                if (apiVideo) {
                    const videoAttach = fromApiVideo({ apiVideo });
                    const data = this.constructVideoData?.(videoAttach);
                    if (videoAttach) {
                        this.updateVideo(videoAttach);
                    }
                    if (data?.sources && Object.keys(data.sources).length > 0) {
                        this.callbacks?.onLiveStart?.(data);
                        void this.checkFinished();
                        void this.startLiveHeartBeat();
                        return;
                    }
                }
            }
        }
        catch (err) { }
        const nextCheckTimeout = this.startTime
            ? CHECK_UPCOMING_TIMEOUT
            : CHECK_STARTED_TIMEOUT;
        // Вызываем спустя время функцию саму себя для повторения всей логики выше
        // Чистим таймаут по дестрою, либо выходом из функции выше не запускаем следующую итерацию
        this.timeoutIdStart = window.setTimeout(() => this.checkStarted(), nextCheckTimeout);
    }
    async checkFinished() {
        if (!this.ownerId || !this.videoId) {
            throw new Error('LiveChecker is not initialized');
        }
        try {
            const responseStatus = await this.api.fetch('video.getLiveStatus', {
                video_ids: joinRawId({
                    ownerId: this.ownerId,
                    itemId: this.videoId,
                    externalId: this.accessKey,
                }),
            });
            const liveStatus = responseStatus[0]?.live_status;
            if (this.isFinished(liveStatus) || this.isPostLive(liveStatus)) {
                void this.stopLiveHeartBeat();
                const responseVideo = await this.api.fetch('video.get', {
                    owner_id: this.ownerId,
                    videos: joinRawId({
                        ownerId: this.ownerId,
                        itemId: this.videoId,
                        externalId: this.accessKey,
                    }),
                    extended: 1,
                });
                const apiVideo = responseVideo.items?.[0];
                if (apiVideo) {
                    const videoAttach = fromApiVideo({ apiVideo });
                    // чтобы не флудить, отправляем только postlive
                    if (videoAttach && !this.isSentFinishedVideoUpdate) {
                        this.updateVideo(videoAttach);
                        this.isSentFinishedVideoUpdate = true;
                    }
                    const data = this.constructVideoData?.(videoAttach);
                    if (data?.sources &&
                        Object.keys(data.sources).length > 0 &&
                        (data.sources[VideoFormat.DASH_ONDEMAND] ||
                            data.sources[VideoFormat.HLS_ONDEMAND])) {
                        this.callbacks?.onLiveEnd?.(data);
                        if (videoAttach) {
                            this.updateVideo(videoAttach);
                        }
                        return;
                    }
                }
                this.callbacks?.setLiveWaitingRecord?.();
            }
        }
        catch (err) { }
        // Вызываем спустя время функцию саму себя для повторения всей логики выше
        // Чистим таймаут по дестрою, либо выходом из функции выше не запускаем следующую итерацию
        this.timeoutIdFinish = window.setTimeout(() => this.checkFinished(), CHECK_FINISHED_TIMEOUT);
    }
    async startLiveHeartBeat() {
        if (!this.ownerId || !this.videoId) {
            throw new Error('LiveChecker is not initialized');
        }
        try {
            await this.api.fetch('video.liveHeartbeat', {
                owner_id: this.ownerId,
                video_id: this.videoId,
                extended: 0,
                access_key: this.accessKey,
            });
        }
        catch (err) { }
        this.timeoutIdLiveHeartBeat = window.setTimeout(() => this.startLiveHeartBeat(), CHECK_LIVE_HEARTBEAT_TIMEOUT);
    }
    async stopLiveHeartBeat() {
        if (!this.ownerId || !this.videoId) {
            throw new Error('LiveChecker is not initialized');
        }
        if (this.isSentLiveStopHeartBeat) {
            return;
        }
        window.clearTimeout(this.timeoutIdLiveHeartBeat);
        this.isSentLiveStopHeartBeat = true;
        try {
            await this.api.fetch('video.liveStopHeartbeat', {
                owner_id: this.ownerId,
                video_id: this.videoId,
            });
        }
        catch (err) { }
    }
}
//# sourceMappingURL=LiveChecker.js.map