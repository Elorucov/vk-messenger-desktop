import React, { useCallback, useId, useState } from 'react';
import { Button } from '@vkontakte/vkui';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ConvoPicker, } from '../../ui/ConvoPicker/ConvoPicker';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { useBrowserEnv, useOwner } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import { sendWidgetToChats, getSnackbarProps, createSendToChatError, } from '../../ui/MiniAppPicker/helpers';
import '../../ui/MiniAppPickerSendToChatsModal/MiniAppPickerSendToChatsModal.css';
import { useRouter } from '../../ui/Router/Router';
import { useApiFetch, useApiFetchMany } from '../../hooks/useApiFetch';
import { PeerPickerList } from '../../ui/PeerPickerList/PeerPickerList';
export const MiniAppPickerSendToChatsModal = ({ onClose, app, pickerPayload, apiError, setApiError, onSuccess, onCancel, }) => {
    const { lang, analyticsAppName } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const apiFetchMany = useApiFetchMany();
    const owner = useOwner();
    const snackbar = useSnackbar();
    const { navigate } = useRouter();
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState([]);
    const modalTitleId = useId();
    const onChangeSelection = (peerIds) => {
        setSelected(peerIds);
    };
    const onManualClose = (apiError) => {
        if (onCancel) {
            const [errorType, errorInfo] = createSendToChatError(apiError);
            onCancel(errorType, errorInfo);
        }
    };
    const sendToChats = async () => {
        if (loading) {
            return;
        }
        setLoading(true);
        try {
            await sendWidgetToChats({
                apiFetch,
                apiFetchMany,
                app,
                owner,
                payload: pickerPayload,
                peers: selected,
                appName: analyticsAppName,
            });
            onClose();
            onSuccess?.();
            const snackbarProps = {
                lang,
                success: true,
            };
            if (selected.length === 1) {
                const peerId = selected[0];
                if (!peerId) {
                    return;
                }
                snackbarProps.closeParent = () => navigate({ kind: 'ConvoRoute', peerId, entrypoint: 'unknown' });
            }
            snackbar(getSnackbarProps(snackbarProps));
        }
        catch (error) {
            const errorMessage = error instanceof Error && (error.message || error.toString());
            setApiError?.(errorMessage || '');
            snackbar(getSnackbarProps({
                lang,
                success: false,
                errorMessage: errorMessage || '',
                onManualClose,
            }));
        }
        finally {
            setLoading(false);
        }
    };
    const onCancelButtonClick = () => {
        onClose();
        onManualClose(apiError);
    };
    const listFilter = (convo) => {
        const peerId = convo.peerId;
        return ((Peer.isChatPeerId(peerId) || Peer.isUserPeerId(peerId)) &&
            owner.id !== peerId &&
            (Convo.canForwardTo(convo) || Convo.isRestrictedToWrite(convo, owner.id)));
    };
    const listRenderer = useCallback((props) => {
        return React.createElement(PeerPickerList, { ...props, withRestrictedDisabling: true });
    }, []);
    return (React.createElement(ModalView, { onEscape: onClose },
        React.createElement(ModalBackdrop, { onClick: onClose },
            React.createElement(ModalPanel, { className: "MiniAppPickerSendToChats__modalPanel", ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { onClose: onClose, closeLabel: lang.use('me_close'), title: lang.use('me_mini_miniapps_picker_send_to_chats_title'), titleId: modalTitleId }),
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement(ConvoPicker, { className: "MiniAppPickerSendToChats__convoPicker", strategy: "multiple", onSelectionChange: onChangeSelection, listRenderer: listRenderer, listFilter: listFilter })),
                React.createElement(ModalFooter, { buttons: [
                        React.createElement(Button, { key: "picker_cancel", mode: "tertiary", onClick: onCancelButtonClick }, lang.use('me_mini_miniapps_picker_confirm_cancel')),
                        React.createElement(Button, { key: "picker_add", loading: loading, disabled: selected.length === 0, onClick: sendToChats }, lang.use('me_miniapps_picker_add_btn')),
                    ] })))));
};
//# sourceMappingURL=MiniAppPickerSendToChatsModal.js.map