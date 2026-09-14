import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { WithRadioButton } from '../WithRadioButton/WithRadioButton';
const ItemBlurComponent = (props) => {
    return (_jsx(WithRadioButton, { ...props, className: cx('VirtualBackgroundSettings__item', 'VirtualBackgroundSettings__item--blur') }));
};
export const ItemBlur = memo(ItemBlurComponent);
//# sourceMappingURL=ItemBlur.js.map