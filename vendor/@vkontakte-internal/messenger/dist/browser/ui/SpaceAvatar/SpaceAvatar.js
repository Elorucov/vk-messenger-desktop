import '../../ui/SpaceAvatar/SpaceAvatar.css';
import React from 'react';
import { Icon24UsersOutline } from '@vkontakte/icons';
import { ReImage } from '../../ui/ReImage/ReImage';
import cx from 'classnames';
export const SpaceAvatar = ({ image, alt, size }) => {
    const className = cx('SpaceAvatar__image', `SpaceAvatar__image--size-${size}`);
    return (React.createElement("div", { className: "SpaceAvatar", style: { width: `${size}px`, height: `${size}px` } }, image ? (React.createElement(ReImage, { className: className, image: image, alt: alt ?? '', width: size, height: size })) : (
    // <img className="SpaceAvatar__image" src={image.baseUrl} alt={title} />
    // SPC-TODO Заменить на компонент аватарки без фото
    React.createElement("div", { className: className },
        React.createElement(Icon24UsersOutline, null)))));
};
//# sourceMappingURL=SpaceAvatar.js.map