import React from 'react';
import '../../ui/ConvoListCard/ConvoListCard.css';
import cx from 'classnames';
export const ConvoListCard = ({ image, children, actions, className, }) => {
    return (React.createElement("div", { className: cx('ConvoListCard', className) },
        image && React.createElement("div", { className: "ConvoListCard__image" }, image),
        React.createElement("div", { className: "ConvoListCard__content" }, children),
        actions && React.createElement("div", { className: "ConvoListCard__actions" }, actions)));
};
//# sourceMappingURL=ConvoListCard.js.map