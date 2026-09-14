import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { reloadResource } from '@vkontakte-internal/browsers-utils';
import { memo, useCallback, useRef } from 'react';
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-css-module, css-modules/no-unused-class
import commonStyles from '../LoadableMedia.module.css';
import { LoadableMediaContent } from '../LoadableMediaContent/LoadableMediaContent';
import styles from './LoadableImage.module.css';
/** Компонент для отображения онбординг картинки */
export const LoadableImage = memo(function LoadableImage({ src, label, visible = true, ...restProps }) {
    const ref = useRef(null);
    const onReload = useCallback(() => reloadImage(ref.current), []);
    return (_jsx(LoadableMediaContent, { "data-testid": "loadableimage", ...restProps, reloadKey: src, 
        // TODO (VKCOMKIT-1317): Заменить styles.visuallyHidden на Component с VisuallyHidden https://github.com/VKCOM/VKUI/issues/7145
        className: classNames(commonStyles.media, !visible && commonStyles.visuallyHidden), onReload: onReload, children: (onLoadMedia, onError, state) => (
        // eslint-disable-next-line react/forbid-elements
        _jsx("img", { 
            // TODO (VKCOMKIT-1317): Заменить styles.visuallyHidden на Component с VisuallyHidden https://github.com/VKCOM/VKUI/issues/7145
            className: classNames(styles.image, state !== 'loaded' && commonStyles.visuallyHidden), onLoad: onLoadMedia, onError: onError, src: src, alt: label ?? '', ref: ref })) }));
});
async function reloadImage(image) {
    if (!image) {
        throw new Error('The image is required!');
    }
    const src = image.src;
    await reloadResource(src);
    image.src = src;
}
//# sourceMappingURL=LoadableImage.js.map