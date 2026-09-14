import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Wrapper } from '../Wrapper/Wrapper';
import styles from './PopupWrapper.module.css';
export function PopupWrapper({ wrapperProps, isAnimationPlaying, children }) {
    return (_jsx(Wrapper, { ...wrapperProps, contentClassName: classNames(wrapperProps.contentClassName, {
            [styles.iconAnimated]: Boolean(wrapperProps?.onContentClick),
        }), stickerContainerClassName: classNames(wrapperProps.stickerContainerClassName, {
            [styles.stickerAnimationIsPlaying]: isAnimationPlaying,
        }), children: children }));
}
//# sourceMappingURL=PopupWrapper.js.map