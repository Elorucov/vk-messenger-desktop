import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './TabbarItem.module.css';
export var TabbarItemIndicator;
(function (TabbarItemIndicator) {
    TabbarItemIndicator["NONE"] = "none";
    TabbarItemIndicator["PRIMARY"] = "primary";
    TabbarItemIndicator["SECONDARY"] = "secondary";
    TabbarItemIndicator["DESTRUCTIVE"] = "destructive";
})(TabbarItemIndicator || (TabbarItemIndicator = {}));
const indicatorModifier = {
    [TabbarItemIndicator.NONE]: styles.indicatorNone,
    [TabbarItemIndicator.PRIMARY]: styles.indicatorPrimary,
    [TabbarItemIndicator.SECONDARY]: styles.indicatorSecondary,
    [TabbarItemIndicator.DESTRUCTIVE]: styles.indicatorDestructive,
};
export function TabbarItem({ active, indicator = TabbarItemIndicator.NONE, className, children, ...props }) {
    return (_jsx("div", { className: classNames(className, styles.item, styles.indicator, indicatorModifier[indicator], {
            [styles.itemActive]: active,
        }), ...props, children: children }));
}
//# sourceMappingURL=TabbarItem.js.map