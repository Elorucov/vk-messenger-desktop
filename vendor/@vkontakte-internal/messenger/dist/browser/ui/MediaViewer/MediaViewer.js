import '../../ui/MediaViewer/MediaViewer.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import * as Attach from '../../../core/model/Attach';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Icon28CancelOutline, Icon48ChevronLeftOutline, Icon48ChevronRightOutline, } from '@vkontakte/icons';
import { Spinner } from '@vkontakte/vkui';
import { useBrowserEnv, useViewport } from '../../hooks/misc';
import { useModuleKeyBoardHandlers } from '../../hooks/useKeyBoardHandlers';
import { MediaViewerPhoto, } from '../../ui/MediaViewer/MediaViewerPhoto';
import { MediaViewerVideo, } from '../../ui/MediaViewer/MediaViewerVideo';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
function MediaViewerComponent({ mediaItems, index, initialIdx = 0, isLoading = false, hidePrev = false, hideNext = false, toolbar, mediaViewerPhotoRef, onPrev, onNext, onClose, mediaViewerVideoRef, withPhotoContextMenu, }) {
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const [viewportWidth, viewportHeight] = useViewport({
        debounced: true,
    });
    const viewportSize = useMemo(() => ({
        w: viewportWidth,
        h: viewportHeight,
    }), [viewportWidth, viewportHeight]);
    const ref = useRef(null);
    const [loadedPhotos, setLoadedPhotos] = useState(new Set());
    const loadedPhotosRef = useRef(loadedPhotos);
    loadedPhotosRef.current = loadedPhotos;
    const USE_INTERNAL_INDEX = index === undefined;
    const [internalIndex, setInternalIndex] = useState(initialIdx);
    const currentIndex = USE_INTERNAL_INDEX ? internalIndex : index;
    const currentIndexRef = useRef(currentIndex);
    currentIndexRef.current = currentIndex;
    const currentMedia = mediaItems[currentIndex];
    const handlePrev = useCallback(() => {
        onPrev?.(getMediaItemByIndex(mediaItems, getPrevIndex(currentIndexRef.current, mediaItems.length)));
        USE_INTERNAL_INDEX &&
            setInternalIndex((n) => getPrevIndex(n, mediaItems.length));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediaItems, onPrev]);
    const handleNext = useCallback(() => {
        onNext?.(getMediaItemByIndex(mediaItems, getNextIndex(currentIndexRef.current, mediaItems.length)));
        USE_INTERNAL_INDEX &&
            setInternalIndex((n) => getNextIndex(n, mediaItems.length));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediaItems, onNext]);
    const { subscribeKeyDown, focusHandlerElement } = useModuleKeyBoardHandlers({
        moduleName: 'MediaViewer',
        blockGlobalHandlers: true,
        handlerElementRef: ref,
    });
    useEffect(() => {
        focusHandlerElement();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const onKeyDown = useCallback((keyCombo, event) => {
        event.stopPropagation();
        const photoScaler = mediaViewerPhotoRef.current?.photoScaler;
        switch (keyCombo) {
            case 'ArrowRight':
                event.preventDefault();
                return handleNext();
            case 'ArrowLeft':
                event.preventDefault();
                return handlePrev();
            case 'Escape':
                event.preventDefault();
                return onClose();
            case 'Mod+Equal':
            case 'Mod+Shift+Equal':
                event.preventDefault();
                return photoScaler?.zoomIn();
            case 'Mod+Minus':
            case 'Mod+Shift+Minus':
                event.preventDefault();
                return photoScaler?.zoomOut();
            default:
                break;
        }
    }, [handleNext, handlePrev, mediaViewerPhotoRef, onClose]);
    /**
     * Управление с клавиатуры
     */
    useEffect(() => {
        return subscribeKeyDown(onKeyDown);
    }, [onKeyDown, subscribeKeyDown]);
    /**
     * Подгрузка текущего, предыдущего и следующего фото
     */
    useEffect(() => {
        const imagesLoadCallbacks = new Map();
        const prevMedia = mediaItems[getPrevIndex(currentIndex, mediaItems.length)];
        const currMedia = mediaItems[currentIndex];
        const nextMedia = mediaItems[getNextIndex(currentIndex, mediaItems.length)];
        for (const media of [prevMedia, currMedia, nextMedia]) {
            if (!media ||
                media.kind !== 'Photo' ||
                loadedPhotosRef.current.has(media.id)) {
                continue;
            }
            const url = Attach.preview(media, viewportSize.w, viewportSize.h)?.url;
            const id = media.id;
            if (url) {
                const img = new Image();
                const onImgLoad = () => {
                    setLoadedPhotos((loadedPhotos) => new Set(loadedPhotos).add(id));
                };
                img.addEventListener('load', onImgLoad);
                img.src = url;
                imagesLoadCallbacks.set(img, onImgLoad);
            }
        }
        return () => {
            imagesLoadCallbacks.forEach((onImgLoad, img) => {
                img.removeEventListener('load', onImgLoad);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediaItems, currentIndex]);
    const isCurrentMediaPhoto = currentMedia?.kind === 'Photo';
    const showLoading = isLoading || !currentMedia;
    return (React.createElement("div", { className: "MediaViewer", onKeyDown: onElementKeyDownFactory(onKeyDown), ref: ref, tabIndex: -1 },
        showLoading && React.createElement(Spinner, null),
        !showLoading &&
            (isCurrentMediaPhoto ? (React.createElement(MediaViewerPhoto, { ref: mediaViewerPhotoRef, photo: currentMedia, isLoading: !loadedPhotos.has(currentMedia.id), viewportSize: viewportSize, withContextMenu: withPhotoContextMenu })) : (React.createElement(MediaViewerVideo, { ref: mediaViewerVideoRef, video: currentMedia }))),
        mediaItems.length > 1 && (React.createElement("nav", { className: cx('MediaViewer__nav', {
                'MediaViewer__nav--touch': isMobileLayout,
            }) },
            !hidePrev && (React.createElement("button", { className: "MediaViewer__prev", onClick: handlePrev, "aria-label": lang.use('me_photo_prev_title') },
                React.createElement(Icon48ChevronLeftOutline, { className: "MediaViewer__navIcon" }))),
            !hideNext && (React.createElement("button", { className: "MediaViewer__next", onClick: handleNext, "aria-label": lang.use('me_photo_next_title') },
                React.createElement(Icon48ChevronRightOutline, { className: "MediaViewer__navIcon" }))))),
        React.createElement("footer", { className: "MediaViewer__footer" }, toolbar),
        React.createElement("button", { className: "MediaViewer__closer", onClick: onClose, "aria-label": lang.use('me_close') },
            React.createElement(Icon28CancelOutline, null))));
}
export const MediaViewer = React.memo(MediaViewerComponent);
const getMediaItemByIndex = (items, index) => {
    const item = items[index];
    if (!item) {
        throw new Error('Передан некорректный индекс медиа');
    }
    return item;
};
const getPrevIndex = (currentIndex, maxLength) => (maxLength + currentIndex - 1) % maxLength;
const getNextIndex = (currentIndex, maxLength) => (currentIndex + 1) % maxLength;
//# sourceMappingURL=MediaViewer.js.map