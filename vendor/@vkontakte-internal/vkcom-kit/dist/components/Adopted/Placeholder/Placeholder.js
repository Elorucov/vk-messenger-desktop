import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIPlaceholder":["@vkontakte/vkui",{"className":1,"style":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Placeholder as VKUIPlaceholder, } from '@vkontakte/vkui';
import styles from './Placeholder.module.css';
const modeModifiersMap = {
    overlay: styles.containerOverlay,
    default: undefined,
};
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-invalid-component-props-name
const PlaceholderComponent = ({ className, mode = 'default', stretched, maxWidth, children, header, title, ...restProps }) => {
    return (_jsx(VKUIPlaceholder, { title: header, className: classNames(styles.container, stretched && styles.containerStretched, modeModifiersMap[mode], className), stretched: stretched, style: { maxWidth }, "aria-label": title, ...restProps, children: !!children && (_jsx("div", { className: styles.text, "data-testid": "placeholder_description", children: children })) }));
};
export const Placeholder = Object.assign(PlaceholderComponent, {
    ...VKUIPlaceholder,
    Actions: VKUIPlaceholder.Actions,
    Container: VKUIPlaceholder.Container,
    Header: VKUIPlaceholder.Title,
    Icon: VKUIPlaceholder.Icon,
    Text: VKUIPlaceholder.Description,
});
//# sourceMappingURL=Placeholder.js.map