import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames, isNumber } from '@vkontakte/vkjs';
import { getColorClass } from '../../../utils/getColorClass/getColorClass';
import styles from './IconMicrophoneIndicator.module.css';
export function IconMicrophoneIndicator({ activated, activeColor = 'color_icon_positive', className, color = 'color_icon_secondary', getRootRef, Icon, level, style, ...restProps }) {
    const levelStyle = isNumber(level)
        ? { '--icon-microphone-indicator-level': `${Math.min(Math.max(level, 0), 100)}%` }
        : undefined;
    return (_jsxs("div", { ...restProps, className: classNames(styles.wrapper, className), ref: getRootRef, style: { ...levelStyle, ...style }, children: [_jsx(Icon, { className: getColorClass(color) }), activated && (_jsx(Icon, { className: classNames(styles.voiceLevelIconActive, !levelStyle && styles.voiceLevelIconActiveAnimation, getColorClass(activeColor)) }))] }));
}
//# sourceMappingURL=IconMicrophoneIndicator.js.map