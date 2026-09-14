import React from 'react';
import './CardInline.css';
import cx from 'classnames';
export const CardInline = ({ image, content, actions, className, }) => {
    return (React.createElement("div", { className: cx('CardInline', className) },
        image && React.createElement("div", { className: "CardInline__image" }, image),
        React.createElement("div", { className: "CardInline__content" }, content),
        actions && React.createElement("div", { className: "CardInline__actions" }, actions)));
};
//# sourceMappingURL=CardInline.js.map