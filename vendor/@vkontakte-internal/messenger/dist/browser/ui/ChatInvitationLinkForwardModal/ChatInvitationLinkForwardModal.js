import React, { forwardRef, useState, useRef, useImperativeHandle, useCallback, } from 'react';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { isConvoUpload, Uploader } from '../../../data/env/Uploader';
import { useBrowserEnv, useDispatch, useOwner, useViewer, } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ChatInvitationLinkTab } from '../../ui/ChatInvitationLink/ChatInvitationLink';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { ConvoPicker, } from '../../ui/ConvoPicker/ConvoPicker';
import { PeerPickerList } from '../../ui/PeerPickerList/PeerPickerList';
/**
 * Модальное окно, позволяющее переслать ссылку-приглашение в чат в другой чат.
 */
export const ChatInvitationLinkForwardModal = forwardRef(function ChatInvitationLinkForwardModal({ openConvo, listFilter, listRenderer }, ref) {
    const { lang, uploader } = useBrowserEnv();
    const dispatch = useDispatch();
    const owner = useOwner();
    const { viewer: { id: viewerId }, } = useViewer();
    const snackbar = useSnackbar();
    const [open, setOpen] = useState(false);
    /**
     * Данные о ссылке-приглашении для передачи в другой чат.
     */
    const payload = useRef(null);
    useImperativeHandle(ref, () => ({
        open: (forwardedPayload) => {
            payload.current = forwardedPayload;
            setOpen(true);
        },
        close: () => setOpen(false),
    }), []);
    const listRendererWithRestricted = useCallback((props) => {
        return React.createElement(PeerPickerList, { ...props, withRestrictedDisabling: true });
    }, []);
    /**
     * Пересылает (загружает) файлы в нужный чат с помощью `uploader`.
     *
     * Здесь не получится использовать `useUploader`, т.к. в данном кейсе он
     * будет завязываться на контекст, а это не позволяет нам выполнить нужное
     * действие с ним (даже отложенное) - при обновлении контекста (при смене
     * `peerId`) вся правая панель размаунтится, а вместе с этим размаунтится и
     * данный компонент.
     */
    const uploadFiles = (peerId, files) => {
        uploader.uploadFiles(files, {}, {
            viewerId,
            targetPeerId: peerId,
            groupId: owner.kind === 'Group' ? owner.id : undefined,
            isChannel: false,
        }, {
            onError: () => {
                snackbar({
                    message: lang.use('me_composer_attachments_error_uploading'),
                });
            },
            onUploadStart: (trackId) => {
                if (isConvoUpload(peerId)) {
                    dispatch({
                        type: 'UserChangedComposerDraft',
                        kind: 'startUploading',
                        trackIds: [trackId],
                        peerId,
                        isPostponed: false,
                    });
                }
            },
            onUploadAbort: (trackId) => {
                if (isConvoUpload(peerId)) {
                    dispatch({
                        type: 'UserChangedComposerDraft',
                        kind: 'removeUploads',
                        trackIds: [trackId],
                        peerId,
                        isPostponed: false,
                    });
                }
            },
            onUploadFinish: (result) => {
                const trackIds = Array.from(result.keys());
                const attachesArray = Array.from(result.values());
                const attaches = Uploader.buildAttachments(attachesArray);
                if (isConvoUpload(peerId)) {
                    dispatch({
                        type: 'UserChangedComposerDraft',
                        kind: 'addAttaches',
                        attaches,
                        trackIds,
                        peerId: peerId,
                        isPostponed: false,
                    });
                }
            },
        });
    };
    if (!open)
        return null;
    const onForwardToConvoPicked = (peerIds) => {
        if (peerIds[0] === undefined || !payload.current?.kind) {
            return;
        }
        const selectedPeerId = peerIds[0];
        openConvo({ peerId: selectedPeerId, entrypoint: 'forward_messages_target' });
        dispatch({
            type: 'UserChangedConvo',
            userAction: 'hide_bot_keyboard',
            peerId: selectedPeerId,
        });
        const { kind } = payload.current;
        switch (kind) {
            case ChatInvitationLinkTab.QR: {
                const { data, filename, mime } = payload.current;
                const file = new File([data], filename, { type: mime });
                uploadFiles(selectedPeerId, [file]);
                break;
            }
            case ChatInvitationLinkTab.Text: {
                dispatch({
                    type: 'UserChangedComposerDraft',
                    kind: 'text',
                    text: payload.current.data,
                    html: payload.current.data,
                    peerId: selectedPeerId,
                    isPostponed: false,
                });
                break;
            }
            default:
                exhaustivenessCheck(kind);
        }
        // Очищаем уже отправленные данные.
        payload.current = null;
    };
    return (React.createElement(ModalInterface, { onClose: () => setOpen(false), contextClass: "MEAppConfig", closeLabel: lang.use('me_close'), title: lang.use('me_forward_to_convo_picker_title'), withCustomLayout: true },
        React.createElement(ConvoPicker, { onSelectionChange: onForwardToConvoPicked, className: "ConvoMain__convoPicker", listFilter: listFilter, listRenderer: listRenderer ?? listRendererWithRestricted, withFavorites: true })));
});
//# sourceMappingURL=ChatInvitationLinkForwardModal.js.map