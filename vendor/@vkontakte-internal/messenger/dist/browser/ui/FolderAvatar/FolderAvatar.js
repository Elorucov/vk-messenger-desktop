import React from 'react';
import { Icon20FolderOutline } from '@vkontakte/icons';
import cx from 'classnames';
import './FolderAvatar.css';
import { Emoji } from '../../ui/Emoji/Emoji';
import { getFirstEmojiFromString } from '../../../core/utils/emoji';
export const FolderAvatar = ({ name, size = 40, variant = 'light', counter, defaultIcon = React.createElement(Icon20FolderOutline, null), style, }) => {
    return (React.createElement("span", { className: cx('FolderAvatar', `FolderAvatar--size-${size}`, `FolderAvatar--variant-${variant}`), style: style },
        counter && React.createElement("span", { className: "FolderAvatar__counter" }, counter),
        React.createElement("span", { className: "FolderAvatar__icon" }, getFolderIcon(name) ?? defaultIcon)));
};
export function getFolderIcon(name) {
    const emoji = getFirstEmojiFromString(name);
    return emoji ? React.createElement(Emoji, { emoji: emoji }) : null;
}
//# sourceMappingURL=FolderAvatar.js.map