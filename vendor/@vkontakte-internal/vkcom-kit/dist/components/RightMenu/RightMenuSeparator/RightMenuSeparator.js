import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Separator":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { memo } from 'react';
import { Separator } from '../../Adopted';
import styles from './RightMenuSeparator.module.css';
export const RightMenuSeparator = memo(({ className, ...props }) => (_jsx(Separator, { ...props, className: classNames(styles.separator, className) })));
RightMenuSeparator.displayName = 'RightMenuSeparator';
//# sourceMappingURL=RightMenuSeparator.js.map