import React, { Suspense } from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { Loader } from '../../ui/Loader/Loader';
import { AgeRestrictionModal as ExternalAgeRestrictionModal, ChatRestrictionModal as ExternalChatRestrictionModal, } from '@vkontakte-internal/stickers-kit';
import { useBrowserEnv } from '../../hooks/misc';
import './RestrictionModals.css';
export const SuspenseModalWrapper = ({ children, onClose, }) => {
    return (React.createElement(ModalView, { onEscape: onClose },
        React.createElement(ModalBackdrop, { onClick: onClose },
            React.createElement(Suspense, { fallback: React.createElement(Loader, { progress: 100 }) },
                React.createElement(ModalPanel, { className: "RestrictionModal" }, children)))));
};
export const AgeRestrictionModal = ({ onClose }) => {
    const { vkDomain } = useBrowserEnv();
    return (React.createElement(SuspenseModalWrapper, { onClose: onClose },
        React.createElement(ExternalAgeRestrictionModal, { domain: vkDomain, onClose: onClose })));
};
export const ChatRestrictionModal = ({ onClose }) => {
    const { vkDomain } = useBrowserEnv();
    return (React.createElement(SuspenseModalWrapper, { onClose: onClose },
        React.createElement(ExternalChatRestrictionModal, { domain: vkDomain, onClose: onClose })));
};
//# sourceMappingURL=RestrictionModals.js.map