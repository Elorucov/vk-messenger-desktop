import { jsx as _jsx } from "react/jsx-runtime";
import { Icon20Spinner } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { memo } from 'react';
import styles from './RightMenuItemSpinner.module.css';
export const RightMenuItemSpinner = memo(({ className, ...props }) => (_jsx("div", { ...props, className: classNames(styles.spinner, className), children: _jsx(Icon20Spinner, {}) })));
RightMenuItemSpinner.displayName = 'RightMenuItemSpinner';
//# sourceMappingURL=RightMenuItemSpinner.js.map