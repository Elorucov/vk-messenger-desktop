import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"TabsItemNative":["@vkontakte/vkui",{"className":1,"style":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { TabsItem as TabsItemNative } from '@vkontakte/vkui';
import { useTabsContext } from '../Tabs/TabsContext';
import styles from './TabsItem.module.css';
export const TabsItem = ({ className, gradient, children, style: styleProp, ...restProps }) => {
    const { noMinWidth } = useTabsContext();
    const style = {
        ...styleProp,
        '--tabsitem-gradient': gradient,
    };
    let content = children;
    if (gradient) {
        content = _jsx("div", { className: styles.gradient, children: content });
    }
    return (_jsx(TabsItemNative, { className: classNames(className, noMinWidth && styles.rootNoMinWidth, gradient && styles.rootGradient), style: style, ...restProps, children: content }));
};
//# sourceMappingURL=TabsItem.js.map