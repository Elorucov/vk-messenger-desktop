import '../../ui/MediaViewer/MediaViewerPhoto.css';
import React, { useCallback, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { Spinner } from '@vkontakte/vkui';
import cx from 'classnames';
import * as Attach from '../../../core/model/Attach';
import { usePhotoRotator } from '../../ui/MediaViewer/hooks/usePhotoRotator';
import { usePhotoScaler } from '../../ui/MediaViewer/hooks/usePhotoScaler';
import { getSizeSwapped, getValidSize } from '../../ui/MediaViewer/utils';
import { MediaViewerVideoRestriction } from '../../ui/MediaViewerVideoRestriction/MediaViewerVideoRestriction';
export const MediaViewerPhoto = React.memo(React.forwardRef(({ photo, isLoading = false, viewportSize, withContextMenu }, ref) => {
    const $imageContainer = useRef(null);
    /* Отступы, которые необходимо выдержать от краев экрана */
    const modalOuterIndent = useMemo(() => {
        const x = viewportSize.w >= 640 ? 90 : 0;
        const y = 90;
        return { x, y };
    }, [viewportSize.w]);
    const maxViewportSize = useMemo(() => ({
        w: viewportSize.w - modalOuterIndent.x * 2,
        h: viewportSize.h - modalOuterIndent.y * 2,
    }), [viewportSize, modalOuterIndent]);
    const [modalSize, setModalSize] = useState(getInitialMediaViewerPhotoSize(photo, maxViewportSize));
    const preview = useMemo(() => Attach.preview(photo, maxViewportSize.w, maxViewportSize.h), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photo]);
    const photoRotator = usePhotoRotator();
    /* Если фото вследствие поворота легло на бок, свапаем высоту и ширину модалки */
    const isSidesSwapped = photoRotator.degrees === 90 || photoRotator.degrees === 270;
    const photoScaler = usePhotoScaler({
        imageContainer: $imageContainer.current,
        isSidesSwapped,
        maxViewportSize,
        modalSize,
        setModalSize,
    });
    const { isMoving, scale, pos, canZoomIn, canZoomOut, zoomIn, zoomOut, reset, ...photoScalerHandlers } = photoScaler;
    const rotateLeft = useCallback(() => {
        photoRotator.rotateLeft();
        if (!preview) {
            return;
        }
        const newSize = getMediaViewerPhotoSize(maxViewportSize, preview.width, preview.height);
        setModalSize(newSize);
        reset(newSize);
    }, [photoRotator, preview, maxViewportSize, reset]);
    /* Подбор высоты и ширины для каждого слайда */
    useLayoutEffect(() => {
        const initSlide = (withRotator = true) => {
            if (!preview?.width || !preview?.height) {
                return;
            }
            const newSize = getMediaViewerPhotoSize(maxViewportSize, preview.width, preview.height);
            setModalSize(newSize);
            reset(newSize);
            withRotator && photoRotator.reset();
        };
        initSlide();
        const resizeHandler = initSlide.bind(null, false);
        window.addEventListener('resize', resizeHandler);
        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [preview?.url]);
    const { w: width, h: height } = getValidSize({
        size: getSizeSwapped({
            size: modalSize,
            isSidesSwapped,
        }),
        maxViewportSize,
        isSidesSwapped,
    });
    useImperativeHandle(ref, () => ({
        photoScaler,
        rotateLeft,
    }), [photoScaler, rotateLeft]);
    const [ignoreRestriction, setIgnoreRestriction] = useState(false);
    if (photo.restriction && !ignoreRestriction) {
        return (React.createElement("div", { className: "MediaViewerPhoto" },
            React.createElement("div", { style: { width, height } },
                React.createElement(MediaViewerVideoRestriction, { restriction: photo.restriction, preview: preview?.url, forcePreview: true, onButtonClick: () => setIgnoreRestriction(true) }))));
    }
    return (React.createElement("div", { className: "MediaViewerPhoto", ...photoScalerHandlers },
        React.createElement("div", { className: "MediaViewerPhoto__in" },
            React.createElement("figure", { className: "MediaViewerPhoto__viewport" },
                React.createElement("div", { ref: $imageContainer, className: cx('MediaViewerPhoto__img', {
                        'MediaViewerPhoto___img--withContextMenu': withContextMenu,
                    }), style: {
                        cursor: isMoving ? 'grab' : 'default',
                        width,
                        height,
                        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale}) rotate(-${photoRotator.degrees}deg)`,
                    } },
                    React.createElement("img", { key: preview?.url, src: preview?.url, width: preview?.width, height: preview?.height, alt: "", className: "MediaViewerPhoto__imgView" })),
                isLoading && React.createElement(Spinner, { className: "PhotoViewer__spinner" })))));
}));
const getMediaViewerPhotoSize = (maxViewportSize, imageWidth, imageHeight) => {
    const ratio = imageWidth / imageHeight;
    const isLandscape = (ratio / maxViewportSize.w) * maxViewportSize.h >= 1;
    let preferredWidth;
    let preferredHeight;
    if (isLandscape) {
        preferredWidth = Math.min(maxViewportSize.w, imageWidth);
        preferredHeight = preferredWidth / ratio;
    }
    else {
        preferredHeight = Math.min(maxViewportSize.h, imageHeight);
        preferredWidth = preferredHeight * ratio;
    }
    return {
        w: preferredWidth,
        h: preferredHeight,
    };
};
const getInitialMediaViewerPhotoSize = (photo, maxViewportSize) => {
    const { width, height } = Attach.preview(photo, maxViewportSize.w, maxViewportSize.h) || {};
    if (!width || !height) {
        throw new Error('Не удалось получить размеры фотографии');
    }
    return getMediaViewerPhotoSize(maxViewportSize, width, height);
};
//# sourceMappingURL=MediaViewerPhoto.js.map