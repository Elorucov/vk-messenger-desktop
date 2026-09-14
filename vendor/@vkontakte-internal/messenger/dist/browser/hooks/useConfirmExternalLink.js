import React, { useMemo, useCallback, useRef } from 'react';
import { useBrowserEnv } from './misc';
import { useSubModal } from '../hooks/useModal';
import { AlertInterface, } from '../ui/AlertInterface/AlertInterface';
import { prepareLink } from '../../core/utils/links';
export function useConfirmExternalLink() {
    const { lang, vkDomain } = useBrowserEnv();
    const urlToGo = useRef(null);
    const confirmModal = useSubModal();
    const handleConfirmExternalLink = useCallback((url) => {
        urlToGo.current = url;
        confirmModal.open();
    }, [confirmModal]);
    const handleModalClose = useCallback(() => {
        urlToGo.current = null;
        confirmModal.close();
    }, [confirmModal]);
    const handleModalSubmit = useCallback(() => {
        if (urlToGo.current) {
            window.open(prepareLink(vkDomain, urlToGo.current), '_blank');
        }
        handleModalClose();
    }, [vkDomain, handleModalClose]);
    const actions = useMemo(() => [
        {
            title: lang.use('me_cancel'),
            autoClose: true,
            mode: 'cancel',
        },
        {
            title: lang.use('me_confirm_external_link_submit'),
            mode: 'destructive',
            autoCloseDisabled: true,
            action: handleModalSubmit,
        },
    ], [lang, handleModalSubmit]);
    const renderConfirmExternalLinkModal = useCallback(({ header, text }) => confirmModal.isActive && (React.createElement(AlertInterface, { onClose: handleModalClose, contextClass: "MEConfig", title: header ?? lang.use('me_confirm_external_link_title'), actions: actions, description: text ?? (React.createElement(React.Fragment, null,
            React.createElement("span", { style: { whiteSpace: 'break-spaces' } }, lang.use('me_confirm_external_link_warning')),
            React.createElement("span", { style: {
                    WebkitLineClamp: 10,
                    WebkitBoxOrient: 'vertical',
                    display: '-webkit-box',
                    overflow: 'hidden',
                } }, urlToGo.current))) })), [lang, confirmModal, handleModalClose, actions]);
    return {
        renderConfirmExternalLinkModal,
        handleConfirmExternalLink,
    };
}
//# sourceMappingURL=useConfirmExternalLink.js.map