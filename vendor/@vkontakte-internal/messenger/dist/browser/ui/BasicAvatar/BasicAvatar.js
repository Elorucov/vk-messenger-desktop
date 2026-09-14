import React, { useMemo } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import './BasicAvatar.css';
import { ReImage } from '../../ui/ReImage/ReImage';
export const BasicAvatar = ({ picture, alt, content, size, color, className, style, }) => {
    const colorClassName = color === 'contact'
        ? 'BasicAvatar__noImg--color-contact'
        : `BasicAvatar__noImg--color-${Math.abs((color ?? 0) % 6)}`;
    const classNames = cx('BasicAvatar', `BasicAvatar--size-${size}`, className);
    const formattedContent = useMemo(() => {
        if (typeof content === 'string') {
            // На случай если в строке эмоджи конвертим в массив
            // в таком случае они разбиваются правильно
            return [...content].slice(0, 2).join('');
        }
        else {
            return content;
        }
    }, [content]);
    const renderAvatarContent = () => {
        if (picture) {
            return (React.createElement(ReImage, { image: picture, alt: alt ?? '', width: size, height: size, style: style }));
        }
        return (React.createElement("div", { className: cx('BasicAvatar__noImg', {
                [colorClassName]: color !== undefined,
            }), "aria-hidden": true }, formattedContent));
    };
    return React.createElement("div", { className: classNames }, renderAvatarContent());
};
//# sourceMappingURL=BasicAvatar.js.map