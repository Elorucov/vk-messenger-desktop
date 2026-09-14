import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, reaction } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { StateBridge } from '../../utils/stateBridge';
import { CallsSdkService } from '../sdk';
import { DOMElementsSizeService } from '../shared';
import { Mode, UIMode, externalIdToString, getDefaultExternalId, isSameExternalId, VideoSuspendMode, ECallViewMode, } from '@vkontakte-internal/calls-core';
import { MediaType, } from '@vkontakte/calls-sdk';
import { screenShareNotVisibleStat } from '../../stats/ScreenShareNotVisible';
import { CallsConfigService } from '../config';
import { DevicesService } from '../devices/DevicesService';
import { areDimensionsValid, getGridItemSize, isLayoutTrue, isEqualLayouts, setSingleActiveDeviceLayout, getMediaFlags, getFirstEnabledMediaType, getLayoutId, getLayout, getStopLayout, } from './helpers';
import { CARD_SIZES, Fit } from './constants';
import { CallService } from '../call';
let UpdateDisplayLayoutService = class UpdateDisplayLayoutService {
    constructor(stateBridge, sdkService, domElementSizeService, configService, devicesService, callService) {
        this.stateBridge = stateBridge;
        this.sdkService = sdkService;
        this.domElementSizeService = domElementSizeService;
        this.configService = configService;
        this.devicesService = devicesService;
        this.callService = callService;
        this.unsubscribeUpdate = undefined;
        this.init = () => {
            const getUpdateDisplayLayoutParams = () => {
                return {
                    isShownParticipantsAside: this.stateBridge.isShownParticipantsAside,
                    topology: this.stateBridge.callData.topology,
                    peer: this.stateBridge.peer,
                    me: this.stateBridge.me,
                    videoSuspendMode: this.stateBridge.videoSuspendMode,
                    uiMode: this.stateBridge.uiMode,
                    videoSlotsCount: this.config.videoSlotsCount,
                    localDevice: this.stateBridge.localDevice,
                    myExternalId: this.stateBridge.externalId,
                    dimensions: { ...this.domElementSizeService.dimensions },
                    changedParticipantIds: new Map(this.stateBridge.changedParticipantIds),
                    firstVisible: this.devicesService.firstVisibleDevice,
                    visibleCount: this.devicesService.devicesVisibleCount,
                    visibleParticipant: this.devicesService.visibleParticipant,
                    selectedDevice: this.callService.oratorDevice,
                    peerDevice: this.callService.peerDevice,
                    activeDevices: this.devicesService.activeDevices,
                    isVideoCall: this.devicesService.isCallWithVideo,
                    mode: this.stateBridge.mode,
                };
            };
            this.unsubscribeUpdate = reaction(getUpdateDisplayLayoutParams, ({ mode, ...params }) => {
                const needCalc = (mode === Mode.CALL &&
                    params.topology === "SERVER" /* TransportTopology.SERVER */ &&
                    // при монтировании дебаунс на новые размеры блока придет не сразу
                    // поэтому в режиме грида, если передать нули, будут отправлены ненужные stopStream
                    this.callService.callViewMode !== ECallViewMode.Grid) ||
                    areDimensionsValid(params.dimensions, params.uiMode === UIMode.FULLSCREEN);
                if (needCalc) {
                    const next = this.calcNextLayouts(params);
                    const diff = this.getLayoutsDiff(next);
                    if (diff.length > 0) {
                        this.prev = next;
                        // Внимание! Реальный stopStream отправляется с задержкой 10-11 сек
                        this.sdk.updateDisplayLayout(diff);
                        screenShareNotVisibleStat.checkLayoutDiff(diff);
                    }
                }
                else {
                    this.prev = new Map();
                }
            }, { fireImmediately: true });
        };
        this.clear = () => {
            this.prev = new Map();
            this.domElementSizeService.clear();
            this.unsubscribeUpdate?.();
        };
        this.calcNextLayouts = ({ changedParticipantIds, ...params }) => {
            const nextLayout = this.getNextLayouts(params);
            nextLayout.forEach((layout, layoutId) => {
                const prevValue = this.prev.get(layoutId);
                if (layout.stopStream && (!prevValue || prevValue.stopStream)) {
                    nextLayout.delete(layoutId);
                }
            });
            this.prev.forEach((layout, layoutId) => {
                if (!layout.stopStream) {
                    const externalId = layout.uid;
                    const realUserPeerId = changedParticipantIds?.get(externalId.id);
                    if (realUserPeerId) {
                        // prevent sending stop for deanonimized contact
                        layoutId = getLayoutId(externalIdToString({
                            id: realUserPeerId,
                            deviceIdx: externalId.deviceIdx,
                            type: externalId.type,
                        }), layout.mediaType);
                    }
                    if (!nextLayout.has(layoutId)) {
                        const stopLayout = getStopLayout(externalId, layout.mediaType, layout.streamName);
                        nextLayout.set(layoutId, stopLayout);
                    }
                }
            });
            return nextLayout;
        };
        this.getLayoutsDiff = (next) => {
            const result = [];
            next.forEach((layout, layoutId) => {
                const prevLayout = this.prev.get(layoutId);
                if (!isLayoutTrue(prevLayout) && !isLayoutTrue(layout)) {
                    // do nothing
                }
                else if (!(prevLayout && isEqualLayouts(prevLayout, layout))) {
                    result.push(layout);
                }
            });
            return result;
        };
        this.getNextLayouts = (params) => {
            switch (this.callService.callViewMode) {
                case ECallViewMode.P2P:
                    return this.getP2PLayouts(params);
                case ECallViewMode.Collapsed:
                    return this.getCollapsedLayouts(params);
                case ECallViewMode.Orator:
                    return this.getOratorLayouts(params);
                default:
                    return this.getGridLayouts(params);
            }
        };
        this.getP2PLayouts = ({ uiMode, topology, localDevice, myExternalId, dimensions, peerDevice, }) => {
            const acc = new Map();
            const isFullscreen = uiMode === UIMode.FULLSCREEN;
            const isCollapsed = uiMode === UIMode.COLLAPSED;
            const device = peerDevice;
            const standardWidth = isCollapsed ? CARD_SIZES.collapsed.width : CARD_SIZES.regular.width;
            const standardHeight = isCollapsed ? CARD_SIZES.collapsed.height : CARD_SIZES.collapsed.width;
            const width = isFullscreen ? dimensions.ww : standardWidth;
            const height = isFullscreen ? dimensions.wh : standardHeight;
            const setLayoutForMovie = (device) => {
                const { movieStreamInfo, movieStreamStoppedInfo, externalId } = device;
                const id = externalIdToString(externalId);
                if (movieStreamInfo && topology === "SERVER" /* TransportTopology.SERVER */) {
                    acc.set(getLayoutId(id, movieStreamInfo.source, movieStreamInfo.movieId), getLayout({
                        externalId: device.externalId,
                        mediaType: movieStreamInfo.source,
                        streamName: String(movieStreamInfo.movieId),
                        width,
                        height,
                        fit: Fit.CONTAIN,
                        priority: 3,
                    }));
                }
                if (movieStreamStoppedInfo) {
                    acc.set(getLayoutId(id, movieStreamStoppedInfo.source, movieStreamStoppedInfo.movieId), getStopLayout(externalId, movieStreamStoppedInfo.source, String(movieStreamStoppedInfo.movieId)));
                }
            };
            setLayoutForMovie({ ...localDevice, externalId: myExternalId || getDefaultExternalId() });
            if (!device) {
                return acc;
            }
            const { externalId, mediaSettings } = device;
            if (isSameExternalId(externalId, myExternalId)) {
                return acc;
            }
            const peerId = externalIdToString(externalId);
            const mediaFlags = getMediaFlags(mediaSettings, topology);
            const screen = mediaFlags.get(MediaType.SCREEN);
            const camera = mediaFlags.get(MediaType.CAMERA);
            const animoji = mediaFlags.get(MediaType.ANIMOJI);
            setLayoutForMovie(device);
            /**
             * если включено и скриншара и камера.
             * скриншара будет на главном экране, а камера сбоку
             */
            if (screen && (camera || animoji)) {
                const enabledMediaType = camera ? MediaType.CAMERA : MediaType.ANIMOJI;
                const disabledMediaType = !camera ? MediaType.CAMERA : MediaType.ANIMOJI;
                acc.set(getLayoutId(peerId, MediaType.SCREEN), getLayout({
                    externalId: device.externalId,
                    mediaType: MediaType.SCREEN,
                    width,
                    height,
                    fit: Fit.CONTAIN,
                    priority: 3,
                }));
                acc.set(getLayoutId(peerId, enabledMediaType), getLayout({
                    externalId: device.externalId,
                    mediaType: enabledMediaType,
                    width: CARD_SIZES.sausage.width,
                    height: CARD_SIZES.sausage.height,
                    fit: Fit.COVER,
                    priority: 1,
                }));
                acc.set(getLayoutId(peerId, disabledMediaType), getStopLayout(externalId, disabledMediaType));
            }
            /**
             * если включена либо скриншара, либо камера.
             * то что включено будет на главном экране, второе выключено
             */
            if (screen !== (camera || animoji)) {
                const enabledMediaType = getFirstEnabledMediaType(mediaFlags);
                acc.set(getLayoutId(peerId, enabledMediaType), getLayout({
                    externalId: device.externalId,
                    mediaType: enabledMediaType,
                    width,
                    height,
                    fit: Fit.CONTAIN,
                    priority: 3,
                }));
                mediaFlags.forEach((v, mediaType) => {
                    if (mediaType !== enabledMediaType) {
                        acc.set(getLayoutId(peerId, mediaType), getStopLayout(externalId, mediaType));
                    }
                });
            }
            /** все выключено */
            if (!screen && !camera && !animoji) {
                acc.set(getLayoutId(peerId, MediaType.SCREEN), getStopLayout(externalId, MediaType.SCREEN));
                acc.set(getLayoutId(peerId, MediaType.CAMERA), getStopLayout(externalId, MediaType.CAMERA));
                acc.set(getLayoutId(peerId, MediaType.ANIMOJI), getStopLayout(externalId, MediaType.ANIMOJI));
            }
            return acc;
        };
        this.getCollapsedLayouts = ({ myExternalId, topology, videoSuspendMode, activeDevices, visibleParticipant, }) => {
            return activeDevices.reduce((acc, device) => {
                const setLayoutForMovie = (device) => {
                    const { movieStreamInfo, movieStreamStoppedInfo, externalId } = device;
                    const id = externalIdToString(externalId);
                    if (movieStreamInfo) {
                        acc.set(getLayoutId(id, movieStreamInfo.source, movieStreamInfo.movieId), getLayout({
                            externalId: device.externalId,
                            mediaType: movieStreamInfo.source,
                            width: CARD_SIZES.collapsed.width,
                            height: CARD_SIZES.collapsed.height,
                            priority: 2,
                            fit: Fit.CONTAIN,
                            streamName: String(movieStreamInfo.movieId),
                        }));
                    }
                    if (movieStreamStoppedInfo) {
                        acc.set(getLayoutId(id, movieStreamStoppedInfo.source, movieStreamStoppedInfo.movieId), getStopLayout(externalId, movieStreamStoppedInfo.source, String(movieStreamStoppedInfo.movieId)));
                    }
                };
                const { externalId, mediaSettings } = device;
                if (isSameExternalId(externalId, myExternalId)) {
                    if (isSameExternalId(externalId, visibleParticipant?.externalId)) {
                        setLayoutForMovie(visibleParticipant);
                    }
                    return acc;
                }
                const isVisible = isSameExternalId(externalId, visibleParticipant?.externalId);
                const mediaFlags = getMediaFlags(mediaSettings, topology);
                setLayoutForMovie(visibleParticipant);
                setSingleActiveDeviceLayout(acc, externalId, isVisible, mediaFlags, videoSuspendMode, (enabledMediaType) => getLayout({
                    externalId: visibleParticipant.externalId,
                    mediaType: enabledMediaType,
                    fit: Fit.CONTAIN,
                    width: CARD_SIZES.collapsed.width,
                    height: CARD_SIZES.collapsed.height,
                    priority: 2,
                }));
                return acc;
            }, new Map());
        };
        this.getOratorLayouts = ({ dimensions, topology, myExternalId, videoSuspendMode, uiMode, videoSlotsCount, firstVisible, visibleCount, isShownParticipantsAside, selectedDevice, activeDevices, }) => {
            const selectedId = selectedDevice.externalId;
            const selected = externalIdToString(selectedId);
            let withVideo = 0;
            const layouts = new Map();
            /** Считаем layout оратора */
            if (selected) {
                const oratorMediaFlags = getMediaFlags(selectedDevice?.mediaSettings, topology);
                const oratorScreen = oratorMediaFlags.get(MediaType.SCREEN);
                const oratorCamera = oratorMediaFlags.get(MediaType.CAMERA);
                const oratorAnimoji = oratorMediaFlags.get(MediaType.ANIMOJI);
                const oratorStreamMode = selectedDevice?.streamMode;
                const isFullscreen = uiMode === UIMode.FULLSCREEN;
                const selectedIsNotMe = !isSameExternalId(selectedId, myExternalId);
                const isVideoSuspended = videoSuspendMode === VideoSuspendMode.ALWAYS;
                const oratorLayoutWidth = isFullscreen ? dimensions.ww : CARD_SIZES.regular.width;
                const oratorLayoutHeight = isFullscreen ? dimensions.wh : CARD_SIZES.collapsed.width;
                /** Совместный просмотр */
                const { movieStreamInfo, movieStreamStoppedInfo } = selectedDevice;
                if (movieStreamInfo) {
                    withVideo++;
                    const isMovieInFocus = oratorStreamMode === MediaType.STREAM || oratorStreamMode === MediaType.MOVIE;
                    layouts.set(getLayoutId(selected, movieStreamInfo.source, movieStreamInfo.movieId), getLayout({
                        externalId: selectedDevice.externalId,
                        mediaType: movieStreamInfo.source,
                        streamName: String(movieStreamInfo.movieId),
                        fit: Fit.CONTAIN,
                        width: isMovieInFocus ? oratorLayoutWidth : CARD_SIZES.sausage.width,
                        height: isMovieInFocus ? oratorLayoutHeight : CARD_SIZES.sausage.height,
                        priority: isMovieInFocus ? 3 : 1,
                    }));
                }
                if (movieStreamStoppedInfo) {
                    layouts.set(getLayoutId(selected, movieStreamStoppedInfo.source, movieStreamStoppedInfo.movieId), getStopLayout(selectedId, movieStreamStoppedInfo.source, String(movieStreamStoppedInfo.movieId)));
                }
                if (selectedIsNotMe) {
                    if (oratorScreen) {
                        /** если оратор со скриншарой показываем ее на главной */
                        withVideo++;
                        const focused = selectedDevice.streamMode === MediaType.SCREEN;
                        layouts.set(getLayoutId(selected, MediaType.SCREEN), getLayout({
                            externalId: selectedDevice.externalId,
                            mediaType: MediaType.SCREEN,
                            width: focused ? oratorLayoutWidth : CARD_SIZES.sausage.width,
                            height: focused ? oratorLayoutHeight : CARD_SIZES.sausage.height,
                            priority: focused ? 3 : 1,
                            fit: Fit.CONTAIN,
                        }));
                        if (!isVideoSuspended && (oratorCamera || oratorAnimoji)) {
                            /** если еще видео или вимоджи включено, то его к колбасу */
                            const enabledMediaType = oratorCamera ? MediaType.CAMERA : MediaType.ANIMOJI;
                            const disabledMediaType = !oratorCamera ? MediaType.CAMERA : MediaType.ANIMOJI;
                            const focused = oratorStreamMode === enabledMediaType;
                            withVideo++;
                            layouts.set(getLayoutId(selected, enabledMediaType), getLayout({
                                externalId: selectedDevice.externalId,
                                mediaType: enabledMediaType,
                                width: focused ? oratorLayoutWidth : CARD_SIZES.sausage.width,
                                height: focused ? oratorLayoutHeight : CARD_SIZES.sausage.height,
                                priority: focused ? 3 : 1,
                                fit: focused ? Fit.CONTAIN : Fit.COVER,
                            }));
                            /** шлем стоп в зависимости от отображаемого типа видео */
                            layouts.set(getLayoutId(selected, disabledMediaType), getStopLayout(selectedId, disabledMediaType));
                        }
                        else {
                            /** если же видео или вимоджи не включено - шлем стоп */
                            [MediaType.CAMERA, MediaType.ANIMOJI].forEach((mediaType) => {
                                layouts.set(getLayoutId(selected, mediaType), getStopLayout(selectedId, mediaType));
                            });
                        }
                    }
                    else {
                        if (!isVideoSuspended && (oratorCamera || oratorAnimoji)) {
                            /** если нет шары, то камеру или вимоджи на главный экран */
                            const enabledMediaType = oratorCamera ? MediaType.CAMERA : MediaType.ANIMOJI;
                            const disabledMediaType = !oratorCamera ? MediaType.CAMERA : MediaType.ANIMOJI;
                            const focused = oratorStreamMode === enabledMediaType;
                            withVideo++;
                            layouts.set(getLayoutId(selected, enabledMediaType), getLayout({
                                externalId: selectedDevice.externalId,
                                mediaType: enabledMediaType,
                                width: focused ? oratorLayoutWidth : CARD_SIZES.sausage.width,
                                height: focused ? oratorLayoutHeight : CARD_SIZES.sausage.height,
                                fit: focused ? Fit.CONTAIN : Fit.COVER,
                                priority: focused ? 3 : 1,
                            }));
                            [MediaType.SCREEN, disabledMediaType].forEach((mediaType) => {
                                layouts.set(getLayoutId(selected, mediaType), getStopLayout(selectedId, mediaType));
                            });
                        }
                        else {
                            /** установлен ручной саспенд на видео или у оратора нет видео, шары или виможи - шлем стоп на все */
                            [MediaType.SCREEN, MediaType.CAMERA, MediaType.ANIMOJI].forEach((mediaType) => {
                                layouts.set(getLayoutId(selected, mediaType), getStopLayout(selectedId, mediaType));
                            });
                        }
                    }
                }
            }
            /** теперь считаем остальных уастников */
            if (isShownParticipantsAside) {
                activeDevices.reduce((acc, device, index) => {
                    const { externalId, mediaSettings, movieStreamInfo, movieStreamStoppedInfo } = device;
                    /** если оратор (мы его уже посчитали) - пропускаем */
                    if (isSameExternalId(externalId, selectedId)) {
                        return acc;
                    }
                    const peerId = externalIdToString(externalId);
                    const isDeviceVisible = index >= firstVisible && index < firstVisible + visibleCount;
                    const isVisible = isDeviceVisible && withVideo < videoSlotsCount;
                    if (movieStreamStoppedInfo) {
                        acc.set(getLayoutId(peerId, movieStreamStoppedInfo.source, movieStreamStoppedInfo.movieId), getStopLayout(externalId, movieStreamStoppedInfo.source, String(movieStreamStoppedInfo.movieId)));
                    }
                    /** У СП максимальный приоритет */
                    if (isVisible && movieStreamInfo) {
                        withVideo++;
                        acc.set(getLayoutId(peerId, movieStreamInfo.source, movieStreamInfo.movieId), getLayout({
                            externalId: device.externalId,
                            mediaType: movieStreamInfo.source,
                            streamName: String(movieStreamInfo.movieId),
                            fit: Fit.COVER,
                            width: CARD_SIZES.sausage.width,
                            height: CARD_SIZES.sausage.height,
                            priority: 1,
                        }));
                    }
                    /** если я - то пропускаем (Лайауты камеры и шары по себе запрашивать не нужно, т.к. это локальный стрим) */
                    /** Важно!!! к Совместному просмотру это не отностится, т.к. он является внешним стримом, который мы запрашиваем выше (по себе в том числе) */
                    if (isSameExternalId(externalId, myExternalId)) {
                        return acc;
                    }
                    const mediaFlags = getMediaFlags(mediaSettings, topology, !!movieStreamInfo);
                    const isAnyActiveLayout = setSingleActiveDeviceLayout(acc, externalId, isVisible, mediaFlags, videoSuspendMode, (enabledMediaType) => getLayout({
                        externalId: device.externalId,
                        mediaType: enabledMediaType,
                        fit: enabledMediaType === MediaType.SCREEN ? Fit.CONTAIN : Fit.COVER,
                        width: CARD_SIZES.sausage.width,
                        height: CARD_SIZES.sausage.height,
                        priority: 1,
                    }));
                    if (isAnyActiveLayout) {
                        withVideo++;
                    }
                    return acc;
                }, layouts);
            }
            return layouts;
        };
        this.getGridLayouts = ({ uiMode, myExternalId, topology, dimensions, videoSlotsCount, videoSuspendMode, firstVisible, visibleCount, activeDevices, }) => {
            const isFullscreen = uiMode === UIMode.FULLSCREEN;
            const w = isFullscreen ? dimensions.ww : dimensions.gw;
            const h = isFullscreen ? dimensions.wh : dimensions.gh;
            const cardSize = getGridItemSize(w, h, activeDevices.length);
            // Для больших карточек приоритет 2, для маленьких 1
            const cardPriority = cardSize[1] < 200 ? 1 : 2;
            let withVideo = 0;
            const getGridModeUpdateLayoutMovieStream = (device, acc) => {
                const id = externalIdToString(device.externalId);
                const { movieStreamInfo, movieStreamStoppedInfo } = device;
                if (movieStreamInfo && topology === "SERVER" /* TransportTopology.SERVER */) {
                    withVideo++;
                    acc.set(getLayoutId(id, movieStreamInfo.source, movieStreamInfo.movieId), getLayout({
                        externalId: device.externalId,
                        mediaType: movieStreamInfo.source,
                        priority: cardPriority,
                        width: cardSize[0],
                        height: cardSize[1],
                        fit: Fit.COVER,
                        streamName: String(movieStreamInfo.movieId),
                    }));
                }
                if (movieStreamStoppedInfo) {
                    acc.set(getLayoutId(id, movieStreamStoppedInfo.source, String(movieStreamStoppedInfo.movieId)), getStopLayout(device.externalId, movieStreamStoppedInfo.source, String(movieStreamStoppedInfo.movieId)));
                }
            };
            return activeDevices.reduce((acc, device, index) => {
                if (isSameExternalId(device.externalId, myExternalId)) {
                    /** совместный просмотр */
                    getGridModeUpdateLayoutMovieStream(device, acc);
                    return acc;
                }
                const { externalId, mediaSettings } = device;
                /** совместный просмотр */
                getGridModeUpdateLayoutMovieStream(device, acc);
                const mediaFlags = getMediaFlags(mediaSettings, topology);
                const isDeviceVisible = index >= firstVisible && index < firstVisible + visibleCount;
                const isVisible = isDeviceVisible && withVideo < videoSlotsCount;
                const isAnyActiveLayout = setSingleActiveDeviceLayout(acc, externalId, isVisible, mediaFlags, videoSuspendMode, (enabledMediaType) => getLayout({
                    externalId: device.externalId,
                    mediaType: enabledMediaType,
                    priority: cardPriority,
                    width: cardSize[0],
                    height: cardSize[1],
                    fit: Fit.COVER,
                }));
                if (isAnyActiveLayout) {
                    withVideo++;
                }
                return acc;
            }, new Map());
        };
        makeAutoObservable(this);
        this.prev = new Map();
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
    get config() {
        return this.configService.getConfig();
    }
};
UpdateDisplayLayoutService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [StateBridge,
        CallsSdkService,
        DOMElementsSizeService,
        CallsConfigService,
        DevicesService,
        CallService])
], UpdateDisplayLayoutService);
export { UpdateDisplayLayoutService };
//# sourceMappingURL=UpdateDisplayLayoutService.js.map