import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { StateBridge } from '../../utils/stateBridge';
import { WatchTogetherActionsService } from './services/WatchTogetherActionsService';
import { ModalService } from '../../services/modal';
import { isSharedMiniAppShownFromDevice, NotificationType } from '@vkontakte-internal/calls-core';
import { LocalDeviceService } from '../../services/localDevice';
import { WatchTogetherService } from './services/WatchTogetherService';
import { handlePromiseError } from '../../helpers/logger';
import { DebugMessageType } from '@vkontakte/calls-sdk';
import { hideSharedMiniApp } from '../miniApps';
import { CallsSdkService } from '../../services/sdk';
import { E_ACTION } from '../../constants';
let MovieChooseModel = class MovieChooseModel {
    constructor(stateBridge, watchTogetherService, watchTogetherActionsService, modalService, localDeviceService, sdkService) {
        this.stateBridge = stateBridge;
        this.watchTogetherService = watchTogetherService;
        this.watchTogetherActionsService = watchTogetherActionsService;
        this.modalService = modalService;
        this.localDeviceService = localDeviceService;
        this.sdkService = sdkService;
        this._selectedMovie = null;
        this._isShowRemoveModal = false;
        this.handleAddMovie = (movie, locale) => {
            return this.watchTogetherActionsService.handleAddMovie(movie, locale, this.modalService.forceCloseModal);
        };
        this.handleRemoveMovie = (movieId) => {
            return this.watchTogetherActionsService.handleRemoveMovie(movieId);
        };
        this.handleMovieRewind = (movieId, offset) => {
            return this.watchTogetherActionsService.handleMovieRewind(movieId, offset, this.modalService.forceCloseModal);
        };
        this.setSelectedMovie = (data) => {
            this._selectedMovie = data;
        };
        this.setIsShowRemoveModal = (data) => {
            this._isShowRemoveModal = data;
        };
        this.handleStopAndPlayNewMovie = (locale) => {
            if (this.movieInfo) {
                if (this.selectedMovie?.ov_id && this.movieInfo.movieId === parseInt(this.selectedMovie.ov_id)) {
                    return this.handleMovieRewind(this.movieInfo.movieId, 0)
                        .catch(handlePromiseError)
                        .finally(() => {
                        this.setSelectedMovie(null);
                    });
                }
                this.handleRemoveMovie(this.movieInfo.movieId)
                    .then(() => {
                    if (this.selectedMovie) {
                        // Админ может заменять видео для СП,
                        // так что здесь мы тоже должны проверить не шарит ли он миниапп и остановить.
                        this.stopMiniAppSharingIfNeeded();
                        this.handleAddMovie(this.selectedMovie, locale);
                    }
                })
                    .catch((error) => {
                    this.sdk.debugMessage(DebugMessageType.ERROR, error);
                })
                    .finally(() => {
                    this.setIsShowRemoveModal(false);
                    this.setSelectedMovie(null);
                });
            }
        };
        this.stopMiniAppSharingIfNeeded = () => {
            if (isSharedMiniAppShownFromDevice(this.localDeviceService.device)) {
                this.stateBridge.dispatch(hideSharedMiniApp(this.localDeviceService.device));
                this.sdkService
                    .getSdk()
                    .stopUrlSharing()
                    .catch((err) => {
                    this.sdk.debugMessage(DebugMessageType.ERROR, err);
                });
            }
        };
        this.handleMovieClick = (movie, locale) => {
            /**
             *  Если после открытия модалки с выбором мувиков прилетел пермамьют на запуск СП, показываем нотификацию
             *  */
            if (!this.localDeviceService.isWatchTogetherAllowed) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: NotificationType.ADMIN_MUTE_PERMANENT_WATCH_TOGETHER,
                    },
                });
                this.modalService.forceCloseModal();
                return;
            }
            /**
             *  Если после открытия модалки с выбором мувиков кто-то успел запустить СП,
             *  показываем модалку от том, что мы не можем инициировать запуск нового мувика
             *  */
            if (this.movieInfo && !this.localDeviceService.isMeAdmin && !this.localDeviceService.isMovieOwner) {
                this.stateBridge.dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: {
                        type: NotificationType.MOVIE_ALREADY_STARTED,
                        data: this.movieOwnerInfo?.name,
                    },
                });
                this.modalService.forceCloseModal();
                return;
            }
            /** Если есть права и нет запущенного мувика, инициируем СП*/
            if (!this.movieInfo) {
                this.stopMiniAppSharingIfNeeded();
                this.handleAddMovie(movie, locale);
                return;
            }
            this.setSelectedMovie(movie);
            /** Если участник является инициатором предыдущеко СП стопаем мувик и запускаем новый,
             * иначе показываем модалку подтверждения остановки и запуска нового мувика
             * */
            if (this.localDeviceService.isMovieOwner) {
                this.handleStopAndPlayNewMovie(locale);
            }
            else {
                this.setIsShowRemoveModal(true);
            }
        };
        makeAutoObservable(this);
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
    get movieOwnerInfo() {
        const { owner } = this.watchTogetherService;
        if (!owner) {
            return null;
        }
        return this.stateBridge.participants[owner.id] || null;
    }
    get selectedMovie() {
        return this._selectedMovie;
    }
    get movieInfo() {
        return this.watchTogetherService.movieInfo;
    }
    get isShowRemoveModal() {
        return this._isShowRemoveModal;
    }
    get isRemoveAvailable() {
        return this.localDeviceService.isMovieOwner || this.localDeviceService.isMeAdmin;
    }
};
MovieChooseModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        WatchTogetherService,
        WatchTogetherActionsService,
        ModalService,
        LocalDeviceService,
        CallsSdkService])
], MovieChooseModel);
export { MovieChooseModel };
export const { Provider, useModel } = createProvider(MovieChooseModel);
//# sourceMappingURL=MovieChooseModel.js.map