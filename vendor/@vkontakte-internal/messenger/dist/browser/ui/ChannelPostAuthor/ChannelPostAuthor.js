import { Icon12User } from '@vkontakte/icons';
import { Caption } from '@vkontakte/vkui';
import '../../ui/ChannelPostAuthor/ChannelPostAuthor.css';
import React from 'react';
import cx from 'classnames';
export const ChannelPostAuthor = ({ name, className, }) => {
    return (React.createElement("div", { className: cx('ChannelPostAuthor', className) },
        React.createElement(Icon12User, null),
        React.createElement(Caption, { className: "ChannelPostAuthor__name", level: "2" }, name)));
};
//# sourceMappingURL=ChannelPostAuthor.js.map