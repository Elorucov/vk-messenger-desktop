import React from 'react';
import '../../ui/AvatarCard/AvatarCard.css';
import cx from 'classnames';
/**
 * Компонент группы информации о чате (аватарка, название, описание)
 */
export const AvatarCard = ({ avatar, name, description = null, className, }) => {
    return (React.createElement("div", { className: cx('AvatarCard', className) },
        React.createElement("div", { className: "AvatarCard__avatar" }, avatar),
        React.createElement("div", { className: "AvatarCard__about" },
            React.createElement("div", { className: "AvatarCard__name" }, name),
            description && (React.createElement("div", { className: "AvatarCard__description" }, description)))));
};
//# sourceMappingURL=AvatarCard.js.map