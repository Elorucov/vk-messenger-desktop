import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isInteractive } from '../../../utils/isInteractive';
import { Tappable } from '../../Adopted';
import styles from './VideoCardThumb.module.css';
export const VideoCardThumb = ({ children, href, onClick, controls, hasHover, className, focusDisabled, label, getRootRef, }) => {
    const isInteractiveItem = isInteractive({ href, onClick });
    return (_jsxs("div", { className: className, ref: getRootRef, children: [_jsx(Tappable, { onClick: onClick, href: href, hasHover: Boolean(hasHover), hasActive: isInteractiveItem, className: styles.thumb, "data-testid": "video_card_thumb", "data-video-thumb": true, tabIndex: focusDisabled ? -1 : 0, "aria-label": label, children: children }), controls] }));
};
//# sourceMappingURL=VideoCardThumb.js.map