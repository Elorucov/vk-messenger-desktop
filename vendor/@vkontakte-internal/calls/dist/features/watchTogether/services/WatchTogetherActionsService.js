import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { CallsSdkService } from '../../../services/sdk';
import { debugMessage, DebugMessageType, } from '@vkontakte/calls-sdk';
import { ClickHouseEventType } from '@vkontakte-internal/calls-core';
import { ClickHouseService } from '../../../services/shared/ClickHouseService';
let WatchTogetherActionsService = class WatchTogetherActionsService {
    constructor(sdkService, clickHouseService) {
        this.sdkService = sdkService;
        this.clickHouseService = clickHouseService;
        this.handleMoviePause = (movieId, successCb) => {
            return this.sdk
                .updateMovie({
                movieId,
                pause: true,
            })
                .then(() => {
                successCb?.();
            })
                .catch((error) => {
                debugMessage(DebugMessageType.ERROR, error);
            });
        };
        this.handleAddMovie = (movie, locale, successCb) => {
            if (movie.ov_id) {
                const data = {
                    movieId: Number(movie.ov_id),
                    metadata: {
                        title: movie.title,
                        thumbnails: movie.image,
                    },
                    gain: 0.5,
                    lang: locale,
                };
                return this.sdk
                    .addMovie(data)
                    .then(() => {
                    successCb?.();
                    this.clickHouseService.sendStats(ClickHouseEventType.CALL_WATCH_TOGETHER_STARTED, {
                        vid: movie.id,
                    });
                })
                    .catch((error) => {
                    debugMessage(DebugMessageType.ERROR, error);
                });
            }
        };
        this.handleMoviePlay = (movieId, successCb) => {
            return this.sdk
                .updateMovie({
                movieId,
                pause: false,
            })
                .then(() => {
                successCb?.();
            })
                .catch((error) => {
                debugMessage(DebugMessageType.ERROR, error);
            });
        };
        this.handleMovieRewind = (movieId, offset, successCb) => {
            return this.sdk
                .updateMovie({
                movieId,
                offset,
            })
                .then(() => {
                successCb?.();
            })
                .catch((error) => {
                debugMessage(DebugMessageType.ERROR, error);
            });
        };
        this.handleMovieSoundChange = (movieId, gain, isUnMute = false, successCb) => {
            const data = {
                movieId,
                gain,
            };
            if (isUnMute) {
                data.mute = false;
            }
            return this.sdk
                .updateMovie(data)
                .then(() => {
                successCb?.();
            })
                .catch((error) => {
                debugMessage(DebugMessageType.ERROR, error);
            });
        };
        this.handleMovieMute = (movieId, gain, successCb) => {
            return this.sdk
                .updateMovie({
                movieId,
                gain,
                mute: true,
            })
                .then(() => {
                successCb?.();
            })
                .catch((error) => {
                debugMessage(DebugMessageType.ERROR, error);
            });
        };
        this.handleMovieUnMute = (movieId, gain, successCb) => {
            const data = {
                movieId,
                mute: false,
            };
            if (gain) {
                data.gain = gain;
            }
            return this.sdk
                .updateMovie(data)
                .then(() => {
                successCb?.();
            })
                .catch((error) => {
                debugMessage(DebugMessageType.ERROR, error);
            });
        };
        this.handleRemoveMovie = (movieId, successCb) => {
            return this.sdk
                .removeMovie(movieId)
                .then(() => {
                successCb?.();
                this.clickHouseService.sendStats(ClickHouseEventType.CALL_WATCH_TOGETHER_STOPPED, { vid: movieId });
            })
                .catch((error) => {
                debugMessage(DebugMessageType.ERROR, error);
            });
        };
        makeAutoObservable(this);
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
};
WatchTogetherActionsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallsSdkService,
        ClickHouseService])
], WatchTogetherActionsService);
export { WatchTogetherActionsService };
//# sourceMappingURL=WatchTogetherActionsService.js.map