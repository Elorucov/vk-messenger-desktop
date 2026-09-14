import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './TextClamp.module.css';
export const TextClamp = ({ Component = 'div', TypographyComponent, getRootRef, lines, preserveWhitespaces, className, style: styleProp, ...restProps }) => {
    className = classNames(styles.root, lines === 1 && styles.rootSingleLine, preserveWhitespaces && styles.rootPreserveWhitespaces, className);
    const style = {
        ...styleProp,
        '--vkui_internal--textclamp-lines': String(lines),
    };
    if (TypographyComponent) {
        const Typography = TypographyComponent;
        return (_jsx(Typography, { Component: Component, getRootRef: getRootRef, className: className, style: style, ...restProps }));
    }
    return _jsx(Component, { ref: getRootRef, className: className, style: style, ...restProps });
};
//# sourceMappingURL=TextClamp.js.map