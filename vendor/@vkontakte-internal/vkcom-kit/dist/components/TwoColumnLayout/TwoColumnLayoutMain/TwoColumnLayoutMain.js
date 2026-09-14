import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"SplitCol":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { SplitCol } from '../../Adopted';
import styles from './TwoColumnLayoutMain.module.css';
export const TwoColumnLayoutMain = ({ className, ...restProps }) => (_jsx(SplitCol, { ...restProps, className: classNames(styles.root, 'vkuiInternalTwoColumnLayoutColumn', className) }));
//# sourceMappingURL=TwoColumnLayoutMain.js.map