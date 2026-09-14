import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
import { Icon20Dropdown } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import styles from './MediaControls.module.css';
export const MediaControls = ({ shown }) => {
    return (_jsx("div", { className: classNames(getColorClass('color_icon_tertiary'), shown && styles.flipped), children: _jsx(Icon20Dropdown, {}) }));
};
//# sourceMappingURL=MediaControls.js.map