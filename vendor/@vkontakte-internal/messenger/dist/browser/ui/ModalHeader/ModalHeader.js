import '../../ui/ModalHeader/ModalHeader.css';
import React from 'react';
import { Icon28ChevronLeftOutline } from '@vkontakte/icons';
import { ModalCloseButton } from '../../ui/ModalCloseButton/ModalCloseButton';
import cx from 'classnames';
export const ModalHeader = ({ onClose, closeLabel, backLabel, onBack, title, children, className, titleId, }) => {
    return (React.createElement("header", { className: cx('RE_ModalHeader', className) },
        React.createElement("div", { className: "RE_ModalHeader__content" },
            backLabel && onBack && (React.createElement("button", { className: "RE_ModalHeader__back", onClick: onBack },
                React.createElement("span", { className: "RE_ModalHeader__backIcon" },
                    React.createElement(Icon28ChevronLeftOutline, null)),
                backLabel)),
            title && (React.createElement("h2", { className: "RE_ModalHeader__title", id: titleId }, title)),
            children && (React.createElement("div", { className: "RE_ModalHeader__container" }, children))),
        React.createElement(ModalCloseButton, { closeLabel: closeLabel, onClose: onClose, mode: "modalHeader" })));
};
//# sourceMappingURL=ModalHeader.js.map