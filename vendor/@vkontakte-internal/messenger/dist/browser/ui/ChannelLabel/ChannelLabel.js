import { Caption } from '@vkontakte/vkui';
import '../../ui/ChannelLabel/ChannelLabel.css';
import React from 'react';
import cx from 'classnames';
export const ChannelLabel = ({ withBackdrop = false, text, labelIcon, className, onClick }) => {
    const Component = typeof onClick === 'function' ? 'button' : 'div';
    return (React.createElement(Component, { className: cx('ChannelLabel', {
            'ChannelLabel--withBackdrop': withBackdrop,
        }, className), onClick: onClick },
        labelIcon,
        React.createElement(Caption, { className: "ChannelLabel__caption", level: "1" }, text)));
};
//# sourceMappingURL=ChannelLabel.js.map