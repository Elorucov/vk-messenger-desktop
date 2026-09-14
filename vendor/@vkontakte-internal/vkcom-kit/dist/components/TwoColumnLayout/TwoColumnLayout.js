import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"SplitLayout":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { SplitLayout } from '../Adopted';
import { TwoColumnLayoutMain, } from './TwoColumnLayoutMain/TwoColumnLayoutMain';
import { TwoColumnLayoutNarrow, } from './TwoColumnLayoutNarrow/TwoColumnLayoutNarrow';
import styles from './TwoColumnLayout.module.css';
const TwoColumnLayoutComponent = ({ separator, className, ...restProps }) => (_jsx(SplitLayout, { ...restProps, className: classNames(styles.root, separator && styles.rootWithSeparator, 'vkuiInternalTwoColumnLayout', className) }));
export const TwoColumnLayout = Object.assign(TwoColumnLayoutComponent, {
    Main: TwoColumnLayoutMain,
    Narrow: TwoColumnLayoutNarrow,
});
//# sourceMappingURL=TwoColumnLayout.js.map