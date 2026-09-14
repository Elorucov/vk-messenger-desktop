import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './StreamModeSwitcher.module.css';
export const StreamModeSwitcher = ({ modes, activeMode, onChangeMode, }) => {
    return (_jsx("div", { className: styles.root, children: modes.map(({ title, value, icon }) => {
            const isActive = activeMode === value;
            return (_jsxs("button", { className: classNames(styles.item, isActive && styles.activeItem), onClick: () => {
                    onChangeMode(value);
                }, "aria-label": title, "data-testid": `calls_stream_mode_switcher_${value.toLowerCase()}`, children: [icon, isActive && title] }, title));
        }) }));
};
//# sourceMappingURL=StreamModeSwitcher.js.map