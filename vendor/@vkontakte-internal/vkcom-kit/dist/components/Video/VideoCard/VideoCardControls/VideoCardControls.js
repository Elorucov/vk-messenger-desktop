import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './VideoCardControls.module.css';
export const VideoCardControls = ({ visible, items, noBackground, }) => {
    if (!items) {
        return null;
    }
    return (_jsx("div", { className: classNames(styles.controls, visible && styles.controlsVisible, !noBackground && styles.controlsWithBackground), children: items }));
};
//# sourceMappingURL=VideoCardControls.js.map