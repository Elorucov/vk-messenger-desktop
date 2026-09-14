import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2,"style":1}],"img":["global",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { useLottie } from '@vkontakte-internal/rlottie';
import { useMemo, useState, useEffect, } from 'react';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import { FavoriteButton } from './components/FavoriteButton/FavoriteButton';
import { useOverlay } from './hooks/useOverlay';
import { getStickerContext } from '../../context/sticker/getStickerContext';
import { BaseUrlBuilder, Theme } from '../../helpers/baseUrlBuilder';
import styles from './Sticker.module.css';
const STICKER_DEFAULT_SIZE = 92;
const STICKER_FAVORITE_ICON_DEFAULT_SIZE = 16;
const loadedAssets = new Set();
export function Sticker({ 
// Component props
size, theme, plain, configs, dynamic, favorite, disabled, defaultConfigId, onFavoriteClick, sticker, noAnimation, renderAsStaticImage, UNSAFE_imageUrl, UNSAFE_animationUrl, 
// Lottie props
name, group = 'sticker', 
// HTML Element props
loading, className, style, onClick, ...rest }) {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const context = getStickerContext(sticker);
    const overlay = useOverlay(context);
    const { imageUrl, animationUrl } = useMemo(() => {
        if (UNSAFE_imageUrl || UNSAFE_animationUrl) {
            return {
                imageUrl: UNSAFE_imageUrl,
                animationUrl: UNSAFE_animationUrl,
            };
        }
        if (!sticker) {
            return {};
        }
        const animationUrl = BaseUrlBuilder.getAnimation({
            type: theme,
            animations: context.animations,
        })?.url || context.animationUrl;
        const imageUrl = new BaseUrlBuilder({
            size,
            theme,
            configs,
            defaultConfigId,
            imageId: context.id,
            configContext: context.imageConfigContext,
            images: theme === Theme.LIGHT ? context.images : context.imagesWithBackground,
        }).build();
        return {
            imageUrl,
            animationUrl,
        };
    }, [size, theme, sticker, configs, defaultConfigId, UNSAFE_imageUrl, UNSAFE_animationUrl]);
    const [imageLoading, setImageLoading] = useState(!loadedAssets.has(imageUrl));
    const { lottieContainerRef, lottieLoading, lottieError } = useLottie({
        group,
        width: size,
        height: size,
        loop: true,
        autoplay: !noAnimation,
        name: animationUrl || '',
        animationUrl: !overlay ? animationUrl : undefined,
    });
    const handleError = () => {
        setImageLoading(!loadedAssets.has(imageUrl));
    };
    const handleLoaded = () => {
        loadedAssets.add(imageUrl);
        setImageLoading(false);
    };
    const handleFavoriteIconClick = (event) => {
        event.stopPropagation();
        onFavoriteClick?.();
    };
    useEffect(() => {
        if (dynamic) {
            return;
        }
        setImageLoading(!loadedAssets.has(imageUrl));
    }, [imageUrl, dynamic]);
    const isStatic = !animationUrl || lottieError || renderAsStaticImage;
    const isLoading = imageLoading && lottieLoading;
    const isTappable = Boolean(!plain && onClick);
    const isPlaceholder = isLoading || Boolean(overlay);
    const scale = size / STICKER_DEFAULT_SIZE;
    const favoriteIconSize = Math.round(STICKER_FAVORITE_ICON_DEFAULT_SIZE * scale);
    return (_jsx("div", { "data-testid": `sticker${animationUrl ? '-animated' : ''}${context.id ? `-${context.id}` : ''}`, className: classNames(styles.sticker, {
            [styles.disabled]: disabled,
            [styles.placeholder]: isPlaceholder,
            [styles.tappable]: isTappable,
        }, className), style: {
            '--sticker-size': `${size}px`,
            '--sticker-scale': String(scale.toFixed(2)),
            'width': size,
            'height': size,
            ...style,
        }, onClick: (e) => onClick?.(e, imageUrl || undefined), ...rest, children: _jsxs("div", { ref: lottieContainerRef, className: styles.in, children: [onFavoriteClick && hasPointer && !isLoading && (_jsx(FavoriteButton, { className: styles.favorite, active: favorite, width: favoriteIconSize, height: favoriteIconSize, onClick: handleFavoriteIconClick })), isStatic && !overlay && (
                // eslint-disable-next-line react/forbid-elements
                _jsx("img", { className: styles.content, alt: "", crossOrigin: "anonymous", src: imageUrl, loading: loading, onError: handleError, onLoad: handleLoaded })), overlay] }) }));
}
//# sourceMappingURL=Sticker.js.map