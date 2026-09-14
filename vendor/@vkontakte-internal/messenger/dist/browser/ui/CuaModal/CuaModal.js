import React, { useState } from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { Cua } from '@vk-ecosystem/components';
import { LayerProvider } from '../../ui/Layer/Layer';
import '../../ui/CuaModal/CuaModal.css';
export const CuaModal = (props) => {
    const { modalRoot, session, onSuccess, onClose, onApiRequest } = props;
    const [popup, setPopup] = useState(null);
    const cancel = () => {
        onSuccess(null);
        onClose();
    };
    return (React.createElement(LayerProvider, { layer: modalRoot },
        React.createElement(ModalView, { onEscape: cancel, contextClass: "MEConfig" },
            React.createElement(ModalBackdrop, { onClick: cancel },
                React.createElement(ModalPanel, { className: "CuaModal__panel" },
                    React.createElement(Cua, { session: session, showPopout: setPopup, hidePopout: () => {
                            setPopup(null);
                        }, onSuccess: ({ session }) => {
                            onSuccess({
                                session,
                            });
                        }, libverifyEnabled: false, onApiRequest: onApiRequest }),
                    popup)))));
};
//# sourceMappingURL=CuaModal.js.map