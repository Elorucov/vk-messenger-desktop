import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIHeader":["@vkontakte/vkui",{"className":1}],"Tappable":["@vkontakte/vkui",{"className":1}]} */
import { classNames, hasReactNode } from '@vkontakte/vkjs';
import { Tappable, Header as VKUIHeader, } from '@vkontakte/vkui';
import { allowLinkOnclickWebAttrs } from '@vkontakte-internal/browsers-utils';
import { getColorClass } from '../../../utils/getColorClass/getColorClass';
import { EllipsisText } from '../EllipsisText/EllipsisText';
import { Flex } from '../Flex/Flex';
import { Separator } from '../Separator/Separator';
import { Subhead } from '../Typography/Typography';
import styles from './Header.module.css';
const legacySizeModifiersMap = {
    small: styles.headerSmall,
    medium: styles.headerMedium,
    large: styles.headerLarge,
};
const legacyModeModifiersMap = {
    primary: styles.headerPrimary,
    secondary: styles.headerSecondary,
    tertiary: styles.headerTertiary,
};
const migrateModeAndSizePropsToNewMajorVersion = (legacyMode, legacySize) => {
    switch (legacyMode) {
        case 'primary':
            switch (legacySize) {
                case 'small':
                    return 'm';
                case 'medium':
                    return 'l';
                case 'large':
                default:
                    return 'xl';
            }
        case 'secondary':
            return legacySize === 'medium' ? 'l' : 's';
        case 'tertiary':
        default:
            return 'm';
    }
};
const HeaderBase = ({ aside, mode = 'primary', 'size': sizeProp = 'small', after, Component = 'div', separator, 
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-bool-props-defaults
stretched = true, before, // WARNING! нативную реализацию использовать не стоит, т.к. не учитывает передачу <IconButton> (см. Header.module.css)
multiline, subtitle, children, className, 'aria-level': ariaLevel = 2, ...restProps }) => {
    const isHeadingComponent = typeof Component === 'string' && Component.startsWith('h') && Component.length === 2;
    const TitleComponent = multiline ? 'div' : EllipsisText;
    return (_jsxs(_Fragment, { children: [_jsxs(VKUIHeader, { after: aside || after, ...restProps, size: migrateModeAndSizePropsToNewMajorVersion(mode, sizeProp), multiline: multiline, className: classNames(styles.header, !stretched && styles.headerNoStretched, hasReactNode(subtitle) && styles.withSubtitle, legacySizeModifiersMap[sizeProp], legacyModeModifiersMap[mode], className), 
                // В VKUI есть стиль, который добавляет отступ снизу, если нет subtitle
                // т.к. в случае subtitle + !multiline мы передаем subtitle в заголовке, этот стиль начинает работать
                // TODO [@vkontakte/vkui@>=8.0.0]: https://github.com/VKCOM/VKUI/issues/6104
                //  см. https://gitlab.mvk.com/vkcom/vkcom/-/merge_requests/272695
                subtitle: multiline ? subtitle : subtitle && _jsx("span", {}), 
                // В монолите есть глобальные стили на h2 которые перекрывают VKUI
                Component: Component, role: !isHeadingComponent ? 'heading' : undefined, "aria-level": !isHeadingComponent ? ariaLevel : undefined, children: [!!before && _jsx("span", { className: styles.before, children: before }), _jsxs(Flex, { direction: "column", className: styles.content, children: [_jsx(TitleComponent, { className: classNames(mode === 'secondary' && subtitle && getColorClass('color_text_primary')), children: children }), !!subtitle && !multiline && (_jsx(EllipsisText, { Component: Subhead, className: styles.subtitle, children: subtitle }))] })] }), separator && _jsx(Separator, { className: styles.separator })] }));
};
export const Header = ({ children, href, target, onClick, disabled, className, 'data-testid': testId, ...restProps }) => {
    if (href || onClick) {
        return (_jsx(Tappable, { className: classNames(styles.tappable, className), onClick: onClick, href: href, target: target, disabled: disabled, hasActive: true, hasHover: false, 
            /* Хак для отключения эффекта клика */
            activeMode: "none", "data-testid": testId, ...allowLinkOnclickWebAttrs, children: _jsx(HeaderBase, { ...restProps, children: children }) }));
    }
    return (_jsx(HeaderBase, { ...restProps, className: className, "data-testid": testId, children: children }));
};
//# sourceMappingURL=Header.js.map