import React from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { Icon20Cancel } from '@vkontakte/icons';
import './UnifiedServiceModal.css';
import { useBrowserEnv } from '../../hooks/misc';
export const UnifiedServiceModal = ({ title, subtitle, image, footer, handleModalClose, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalView, { onEscape: handleModalClose, contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, { onClick: handleModalClose },
            React.createElement("div", { className: "UnifiedServiceModal__panel" },
                React.createElement("button", { className: "UnifiedServiceModal__closer", "aria-label": lang.use('me_close'), onClick: handleModalClose },
                    React.createElement("span", { className: "UnifiedServiceModal__closerContent" },
                        React.createElement(Icon20Cancel, { color: "#fff" }))),
                React.createElement("div", { className: "UnifiedServiceModal__body" },
                    image && React.createElement("div", { className: "UnifiedServiceModal__image" }, image),
                    React.createElement("div", { className: "UnifiedServiceModal__title" }, title),
                    React.createElement("div", { className: "UnifiedServiceModal__subtitle" }, subtitle)),
                footer && (React.createElement("div", { className: "UnifiedServiceModal__footer" }, footer))))));
};
//# sourceMappingURL=UnifiedServiceModal.js.map