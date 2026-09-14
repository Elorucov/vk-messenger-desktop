import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { WithRadioButton } from '../WithRadioButton/WithRadioButton';
import { useLang } from '../../../hooks/useLang';
const ItemNoBackgroundComponent = (props) => {
    const { getLang } = useLang();
    return (_jsx(WithRadioButton, { ...props, className: cx('VirtualBackgroundSettings__item', 'VirtualBackgroundSettings__item--with-border'), children: getLang('calls_virtual_background_settings_no_background') }));
};
export const ItemNoBackground = memo(ItemNoBackgroundComponent);
//# sourceMappingURL=ItemNoBackground.js.map