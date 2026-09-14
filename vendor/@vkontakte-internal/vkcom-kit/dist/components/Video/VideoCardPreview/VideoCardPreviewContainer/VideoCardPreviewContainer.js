import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './VideoCardPreviewContainer.module.css';
export const VideoCardPreviewContainer = ({ activate, deactivate, focusDisabled, hasOverlay, videoCardPreviewLabel, children, }) => {
    if (focusDisabled) {
        return (_jsx("div", { className: classNames(styles.preview, hasOverlay && styles.previewOverlayed), "aria-label": videoCardPreviewLabel, tabIndex: -1, children: children }));
    }
    return (
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    _jsx("div", { className: classNames(styles.preview, hasOverlay && styles.previewOverlayed), onMouseOver: activate, onFocus: activate, onMouseLeave: deactivate, onBlur: deactivate, role: "button", "aria-label": videoCardPreviewLabel, tabIndex: 0, children: children }));
};
//# sourceMappingURL=VideoCardPreviewContainer.js.map