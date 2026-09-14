import '../../ui/MessageViewersModal/MessageViewersModal.css';
import React, { useEffect, useId, useMemo } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { useMessageViewers } from '../../hooks/useMessageViewers';
import { FailedRequest } from '../../ui/FailedRequest/FailedRequest';
import { PeerList, PeerListItemLink, PeerListItemStub, } from '../../ui/PeerListItem/PeerListItem';
export const MessageViewersModal = ({ message, handleModalClose, }) => {
    const { lang } = useBrowserEnv();
    const { stage, viewers, hasMore, totalCount, fetchViewers } = useMessageViewers({ message });
    const modalTitleId = useId();
    useEffect(() => {
        fetchViewers();
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);
    const title = useMemo(() => {
        switch (stage) {
            case 'initializing':
                return '';
            case 'ready':
                return lang.use('me_message_viewers_count', {
                    num: totalCount,
                    formatted: 'short',
                });
            case 'failed':
            default:
                return lang.use('me_message_viewers_modal_failed_title');
        }
    }, [stage, totalCount, lang]);
    return (React.createElement(ModalView, { onEscape: handleModalClose, contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, { onClick: handleModalClose },
            React.createElement(ModalPanel, { className: "MessageViewersModal", ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: handleModalClose, title: stage === 'initializing' ? (React.createElement("span", { className: "MessageViewersModal__header--stubbed" })) : (title), titleId: modalTitleId }),
                React.createElement(ModalBody, { withScrollHandling: stage !== 'failed', withCustomLayout: true },
                    React.createElement("div", { className: "MessageViewersModal__content" },
                        stage === 'initializing' && (React.createElement(PeerList, null, [...Array(16).keys()].map((i) => (React.createElement(PeerListItemStub, { key: i }))))),
                        stage === 'ready' && (React.createElement(PeerList, null,
                            viewers.map((viewer) => (React.createElement(PeerListItemLink, { peer: viewer, onNavigate: handleModalClose }))),
                            hasMore && (React.createElement("div", { className: "MessageViewersModal__spinnerWrapper" },
                                React.createElement(OptimizedSpinner, { size: "m", onIntersection: fetchViewers }))))),
                        stage === 'failed' && (React.createElement(FailedRequest, { text: lang.use('me_message_viewers_modal_error_message'), onReloadClick: fetchViewers }))))))));
};
//# sourceMappingURL=MessageViewersModal.js.map