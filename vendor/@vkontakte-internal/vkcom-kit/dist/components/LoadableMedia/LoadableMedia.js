import { jsx as _jsx } from "react/jsx-runtime";
import { classNames, noop } from '@vkontakte/vkjs';
import { useStableCallback } from '@vkontakte-internal/react-utils';
import { useMemo } from 'react';
import { AspectRatio as AspectRatioComponent, } from '../Adopted';
import { LoadableImage } from './LoadableImage/LoadableImage';
import { LoadableMediaContextProvider } from './LoadableMediaContext';
import { LoadableVideo } from './LoadableVideo/LoadableVideo';
// eslint-disable-next-line css-modules/no-unused-class
import styles from './LoadableMedia.module.css';
const modeModifiersMap = {
    default: styles.rootDefault,
    transparent: styles.rootTransparent,
};
export const LoadableMedia = ({ type, src, mode = 'default', label, aspectRatio, visible, loadingErrorMessage, loadingErrorActionLabel, onLoadingStateChange, ...restProps }) => {
    const MediaComponent = type === 'image' ? LoadableImage : LoadableVideo;
    const loadingStateChangeHandler = useStableCallback(onLoadingStateChange ?? noop);
    const context = useMemo(() => ({ loadingErrorMessage, loadingErrorActionLabel, loadingStateChangeHandler }), [loadingErrorMessage, loadingErrorActionLabel, loadingStateChangeHandler]);
    return (_jsx(LoadableMediaContextProvider, { value: context, children: _jsx(AspectRatio, { ratio: aspectRatio, 
            // TODO (VKCOMKIT-1317): Заменить styles.visuallyHidden на Component с VisuallyHidden https://github.com/VKCOM/VKUI/issues/7145
            className: classNames(styles.root, modeModifiersMap[mode], !visible && styles.visuallyHidden), children: _jsx(MediaComponent, { ...restProps, src: src, label: label, visible: visible }) }) }));
};
function isAspectRatioComponentProps(props) {
    return props.ratio !== undefined;
}
function AspectRatio(props) {
    if (isAspectRatioComponentProps(props)) {
        return _jsx(AspectRatioComponent, { ...props });
    }
    return _jsx("div", { ...props });
}
//# sourceMappingURL=LoadableMedia.js.map