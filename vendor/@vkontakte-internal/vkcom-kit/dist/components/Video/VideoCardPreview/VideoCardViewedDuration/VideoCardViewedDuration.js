import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './VideoCardViewedDuration.module.css';
export const VideoCardViewedDuration = ({ shown, duration, viewedDuration, }) => {
    if (!viewedDuration || !duration) {
        return null;
    }
    const viewedDurationInPercents = (viewedDuration * 100) / duration;
    return (_jsx("div", { className: classNames(styles.duration, !shown && styles.durationHidden), children: _jsx("div", { className: styles.viewedDuration, style: { width: `${viewedDurationInPercents}%` }, "data-testid": "video_card_duration_timeline" }) }));
};
//# sourceMappingURL=VideoCardViewedDuration.js.map