import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}],"figure":["global",{"className":1,"style":1}],"Title":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { useStore } from 'effector-react';
import { Icon24CancelOutline } from '@vkontakte/icons';
import { InnerHTML, Title, Tappable, Overlay, getColorClass, } from '@vkontakte-internal/vkcom-kit';
import { rowVariantModifier } from '../StickersKeyboardRow';
import { $variant } from '../../../model/variant';
import styles from './StickersKeyboardRowCard.module.css';
export function StickersKeyboardRowCard({ title, image, action, onHide, className, ...props }) {
    const variant = useStore($variant);
    return (_jsx("div", { className: rowVariantModifier[variant], ...props, children: _jsxs("div", { className: styles.card, children: [onHide && (_jsx(Overlay, { placement: "top-right", offset: 8, Component: Tappable, className: getColorClass('color_icon_secondary'), hoverMode: "opacity", activeMode: "opacity", onClick: onHide, children: _jsx(Icon24CancelOutline, {}) })), image && (_jsx("figure", { className: styles.image, style: {
                        ...image,
                        backgroundImage: `url(${image.src})`,
                    } })), !!title && (_jsx(Title, { className: styles.title, level: "3", weight: "2", children: _jsx(InnerHTML, { children: title }) })), !!action && _jsx("div", { className: styles.action, children: action })] }) }));
}
//# sourceMappingURL=StickersKeyboardRowCard.js.map