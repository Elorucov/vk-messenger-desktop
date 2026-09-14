import { ModalBody } from '@vkontakte-internal/vkcom-kit';
import React from 'react';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalCloseButton } from '../../ui/ModalCloseButton/ModalCloseButton';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalView } from '../../ui/ModalView/ModalView';
import { useBrowserEnv } from '../../hooks/misc';
export const ClipCoOwnersModal = ({ activeClipId, close }) => {
    const { lang, vkcom_me: { clipCoOwnersBoxRenderer } = {} } = useBrowserEnv();
    if (!clipCoOwnersBoxRenderer || !activeClipId) {
        close();
        return null;
    }
    return (React.createElement(ModalView, { onEscape: close, contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, { onClick: close },
            React.createElement(ModalPanel, { className: "ClipCoOwnersModal__modalPanel", topRight: React.createElement(ModalCloseButton, { closeLabel: lang.use('me_close'), onClose: close, mode: "modalHeader" }) },
                React.createElement(ModalBody, { insetLevel: 0 }, clipCoOwnersBoxRenderer({
                    activeClipId,
                    onClose: close,
                }))))));
};
//# sourceMappingURL=ClipCoOwnersModal.js.map