import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Flex.Item":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { Div, Flex, getColorClass } from '@vkontakte-internal/vkcom-kit';
import { CallsRichCell } from '../../CallsRichCell';
import styles from './Item.module.css';
export const Item = ({ avatar, hint, href, title, onClick, actions, dataTestId }) => {
    return (_jsx(Div, { paddingTop: 0, paddingBottom: 0, children: _jsxs(Flex, { align: "center", direction: "row", gap: "m", justify: "space-between", noWrap: true, children: [_jsx(Flex.Item, { flexBasis: "100%", className: styles.item, "data-testid": dataTestId, children: _jsx(CallsRichCell, { before: avatar, caption: hint, href: href, onClick: onClick, title: title ?? '', hasActive: !!href, hasHover: !!href }) }), _jsx(Flex.Item, { children: _jsx(Flex, { gap: "m", align: "center", className: getColorClass('color_icon_secondary'), noWrap: true, children: actions }) })] }) }));
};
//# sourceMappingURL=Item.js.map