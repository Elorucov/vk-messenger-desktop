import { Button } from '@vkontakte/vkui';
import { usePeers, useDispatch, useBrowserEnv } from '../../hooks/misc';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalView } from '../../ui/ModalView/ModalView';
import '../../ui/MRRejectConfirmationModal/MRRejectConfirmationModal.css';
import { ReforgedCheckbox } from '../../ui/ReforgedCheckbox/ReforgedCheckbox';
import React, { useCallback, useId, useState } from 'react';
import * as Peer from '../../../core/model/Peer';
export const MRRejectConfirmationModal = ({ peerId, onClose, onReject }) => {
    const peers = usePeers();
    const dispatch = useDispatch();
    const modalTitleId = useId();
    const { lang } = useBrowserEnv();
    const peer = Peer.safeGet(peers, peerId);
    const [isMrSpam, setMrSpam] = useState(false);
    const handleRejectMessageRequest = useCallback(() => {
        dispatch({
            type: 'UserRejectedMessageRequest',
            isSpam: isMrSpam,
            peerId,
        });
        onClose();
        onReject();
    }, [dispatch, isMrSpam, peerId, onClose, onReject]);
    return (React.createElement(ModalView, { onEscape: onClose },
        React.createElement(ModalBackdrop, { onClick: onClose },
            React.createElement(ModalPanel, { ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: onClose, title: lang.use(peer.kind === 'User'
                        ? 'me_mr_reject'
                        : 'me_reject_chat_mr_confirmation_title'), titleId: modalTitleId }),
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "MRRejectConfirmationModal__body" }, peer.kind === 'User'
                        ? lang.use('me_mr_reject_confirmation', {
                            values: {
                                name: peer.firstNameGen,
                            },
                        })
                        : lang.use('me_reject_chat_mr_confirmation'))),
                React.createElement(ModalFooter, { buttons: React.createElement(Button, { onClick: handleRejectMessageRequest },
                        React.createElement("span", { className: "MRRejectConfirmationModal__buttonText" }, lang.use('me_reject'))) },
                    React.createElement(ReforgedCheckbox, { onChange: () => setMrSpam(!isMrSpam), checked: isMrSpam },
                        React.createElement("span", { className: "MRRejectConfirmationModal__checkboxDescription" }, lang.use('me_report_as_spam'))))))));
};
//# sourceMappingURL=MRRejectConfirmationModal.js.map