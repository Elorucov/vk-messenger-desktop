import React, { useCallback, useEffect, useState } from 'react';
import { classNames as cx, isNumber } from '@vkontakte/vkjs';
import { Icon24DownloadOutline } from '@vkontakte/icons';
import './PhotoItem.css';
import { isImageLoaded } from '../../utils/files';
import { Spinner } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import { usePerformanceSettings } from '../../hooks/usePerformanceSettings';
export const PhotoItem = ({ src, thumbhashUrl, alt, width, height, cover, showReload = false, className, widthAndHeightAsAttr, onLoad, onError, withLoader, itemPosition, totalItems, }) => {
    const { lang } = useBrowserEnv();
    const { enableAnimations } = usePerformanceSettings();
    const imgStyles = cover
        ? { width, height }
        : undefined;
    const [key, setKey] = useState(1);
    const [isLoaded, setIsLoaded] = useState(() => !!src && isImageLoaded(src));
    useEffect(() => {
        setIsLoaded(!!src && isImageLoaded(src));
    }, [src]);
    useEffect(() => {
        isLoaded && onLoad?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);
    const [hasError, setHasError] = useState(false);
    const handleClick = useCallback((event) => {
        if (hasError && showReload) {
            event.preventDefault();
            event.stopPropagation();
            setKey((prev) => prev + 1);
        }
    }, [hasError, showReload]);
    const handleReload = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setKey((prev) => prev + 1);
    }, []);
    const getAriaLabel = () => {
        const result = [];
        // Название типа аттача
        result.push(lang.use('me_convo_attach_photo_aria_label'));
        if (alt) {
            // Описание фотографии
            result.push(alt);
        }
        if (isNumber(totalItems) && totalItems > 1 && itemPosition) {
            result.push(lang.use('me_list_item_position', {
                values: {
                    position: itemPosition.toString(),
                    total: totalItems.toString(),
                },
            }));
        }
        return result.join(', ');
    };
    return (React.createElement("div", { className: cx('PhotoItem', className), style: { width, height }, onClick: handleClick, "aria-label": getAriaLabel() },
        React.createElement("div", { className: cx('PhotoItem__blur', {
                PhotoItem__nothumbhash: !thumbhashUrl,
            }), style: {
                '--thumbhashUrl': thumbhashUrl && `url(${thumbhashUrl})`,
            } }),
        React.createElement("img", { key: key, src: src, alt: alt, width: widthAndHeightAsAttr ? width : undefined, height: widthAndHeightAsAttr ? height : undefined, className: cx('PhotoItem__img', {
                // Если нет thumbhash, то незачем скрывать картинку, красивого блюра не будет.
                // Юзкейс: при включении гифки картинка заменяется на гифку, но браузер
                // не сбрасывает предыдущее изображение, а картинка + спиннер лучше смотрится,
                // чем спиннер без картинки
                'PhotoItem__img--loaded': !enableAnimations || isLoaded || (!thumbhashUrl && !hasError),
            }), style: imgStyles, onLoad: () => {
                setIsLoaded(true);
                setHasError(false);
            }, onError: () => {
                setHasError(true);
                onError?.();
            } }),
        withLoader && enableAnimations && !isLoaded && !hasError && (React.createElement("div", { className: "PhotoItem__spinner" },
            React.createElement(Spinner, { className: "PhotoItem__spinnerIcon" }))),
        hasError && (React.createElement("div", { className: "PhotoItem__error" }, showReload && (React.createElement("button", { type: "button", className: "PhotoItem__reload", onClick: handleReload },
            React.createElement(Icon24DownloadOutline, { className: "PhotoItem__reloadIcon" })))))));
};
//# sourceMappingURL=PhotoItem.js.map