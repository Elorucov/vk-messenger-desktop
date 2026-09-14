import { jsx as _jsx } from "react/jsx-runtime";
import { Icon16ClockOutline, Icon16DonateOutline, Icon16Linked, Icon16Lock, Icon16Users, } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { TextTooltip } from '../../../Adopted';
import styles from './VideoCardIcon.module.css';
export const ICONS_MAP = {
    processing: Icon16ClockOutline,
    private: Icon16Lock,
    by_link: Icon16Linked,
    to_subscribers: Icon16Users,
    donate: Icon16DonateOutline,
};
export const VideoCardIcon = ({ type, className, tooltipText }) => {
    if (!type || typeof type === 'boolean')
        return null;
    const Component = ICONS_MAP[type];
    return (_jsx(TextTooltip, { placement: "top-start", appearance: "black", text: tooltipText, children: _jsx(Component, { className: classNames(styles.icon, className) }) }));
};
//# sourceMappingURL=VideoCardIcon.js.map