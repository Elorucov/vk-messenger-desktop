import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useState } from 'react';
import styles from './VideoCardPreviewImage.module.css';
const blurClassNameMap = {
    's': styles.imgBlurredSizeS,
    'm': styles.imgBlurredSizeM,
    'l': styles.imgBlurredSizeL,
    'xl': styles.imgBlurredSizeXl,
    '2xl': styles.imgBlurredSize2Xl,
};
export const VideoCardPreviewImage = ({ alt, children, hasImageHidden, src, blurred, blurSize = 's', vertical, onLoadError, width, height, offsetX, offsetY, }) => {
    const [status, setStatus] = useState('loading');
    const [isVertical, setIsVertical] = useState(vertical);
    const handleImageLoaded = (e) => {
        setStatus('loaded');
        setIsVertical(Boolean(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth));
    };
    const handleImageError = () => {
        setStatus('error');
        onLoadError?.();
    };
    // решение пока нет гидрации на ssr, не ждем обработчика загрузки изображения
    const forceShowImage = typeof window === 'undefined';
    return (_jsxs("div", { className: classNames(styles.container, styles.fullSize, (status === 'loaded' || !src || forceShowImage) && styles.containerVisible), children: [status !== 'error' && src && (
            // eslint-disable-next-line react/forbid-elements
            _jsx("img", { className: classNames(styles.img, styles.fullSize, children && hasImageHidden && styles.imgHidden, blurred && styles.imgBlurred, blurred && blurClassNameMap[blurSize], isVertical && styles.imgContain), src: src, alt: alt, onLoad: handleImageLoaded, onError: handleImageError, loading: "lazy", style: offsetX === undefined || offsetY === undefined
                    ? {}
                    : {
                        objectPosition: `${offsetX}px ${offsetY}px`,
                        width,
                        height,
                    } })), children] }));
};
//# sourceMappingURL=VideoCardPreviewImage.js.map