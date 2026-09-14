import React from 'react';
import cx from 'classnames';
import { Checkbox as CheckboxComponent } from '@vkontakte/vkui';
import '../../ui/ReforgedCheckbox/ReforgedCheckbox.css';
export const ReforgedCheckbox = ({ className, activeMode = 'none', ...props }) => {
    return (React.createElement(CheckboxComponent, { ...props, activeMode: activeMode, className: cx('ReforgedCheckbox', className) }));
};
//# sourceMappingURL=ReforgedCheckbox.js.map