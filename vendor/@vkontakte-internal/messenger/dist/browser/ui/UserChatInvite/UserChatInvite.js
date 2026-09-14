import React, { useCallback, useEffect, useId, useState, } from 'react';
import { useBrowserEnv, useOwner, usePeers } from '../../hooks/misc';
import { ConvoPicker, } from '../../ui/ConvoPicker/ConvoPicker';
import '../../ui/UserChatInvite/UserChatInvite.css';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import { PeerPickerList } from '../../ui/PeerPickerList/PeerPickerList';
import { Icon20Add } from '@vkontakte/icons';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { useRouter } from '../../ui/Router/Router';
import { PickerSearchInput } from '../../ui/PickerSearchInput/PickerSearchInput';
import { PeerPickerListItem } from '../../ui/PeerPickerListItem/PeerPickerListItem';
import { ReforgedCheckbox } from '../../ui/ReforgedCheckbox/ReforgedCheckbox';
import { IApi } from '../../../data/env/IApi';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { INVITE_TO_CHAT_VISIBLE_MESSAGES_COUNT } from '../../../core/config/config';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { ChatCreation } from '../../ui/ChatCreation/ChatCreation';
import { InviteButton } from '../../ui/InviteButton/InviteButton';
import { Button } from '@vkontakte/vkui';
import { API_ERROR_LIMITS, API_ERROR_MESSAGES_CHAT_NOT_ADMIN, API_ERROR_MESSAGES_GROUP_PEER_ACCESS, API_ERROR_MESSAGES_CONTACT_NOT_FOUND, API_ERROR_MESSAGES_MESSAGE_REQUEST_ALREADY_SENT, API_ERROR_MESSAGES_CHAT_DISABLED, API_ERROR_MESSAGES_CHAT_UNSUPPORTED, API_ERROR_MESSAGES_MEMBER_ACCESS_TO_GROUP_DENIED, API_ERROR_MESSAGES_CHAT_MEMBER_NOT_STAFF, API_ERROR_FLOOD, API_ERROR_MESSAGES_SPAM_RESTRICTION, } from '@vkontakte-internal/api-schema-typescript';
import { useApiFetch } from '../../hooks/useApiFetch';
export const UserChatInvite = ({ onClose, peerId, source, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const { navigate } = useRouter();
    const peers = usePeers();
    const owner = useOwner();
    const modalGroup = useModalGroup();
    const invitationModal = useModal(modalGroup.id);
    const chatCreationModal = useModal(modalGroup.id);
    const errorModal = useModal(modalGroup.id);
    const peer = Peer.safeGet(peers, peerId);
    const modalTitleId = useId();
    const [showLastMessages, setShowLastMessages] = useState(true);
    const [isInviting, setInviting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const closeError = () => {
        setErrorMessage(null);
        errorModal.close();
    };
    const close = () => {
        onClose();
    };
    useEffect(() => {
        invitationModal.open();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const onConvoSelection = async (selection) => {
        const [chatId] = selection;
        if (!chatId) {
            return;
        }
        try {
            setInviting(true);
            await apiFetch('messages.addChatUser', {
                chat_id: Peer.toRealId(chatId),
                peer_id: peerId,
                visible_messages_count: showLastMessages
                    ? INVITE_TO_CHAT_VISIBLE_MESSAGES_COUNT
                    : 0,
                source,
            });
            onClose();
            navigate({
                kind: 'ConvoRoute',
                peerId: chatId,
                entrypoint: 'convo_invite',
            });
        }
        catch (e) {
            if (e instanceof IApi.RequestError) {
                // Ставим строку, которая пришла из апи, если она есть.
                // Нужно для кейсов с ошибкой доступа – там апи возвращает один `code` (15), но разный текст ошибки
                if (typeof e.apiError.error_text === 'string') {
                    setErrorMessage(e.apiError.error_text);
                }
                else {
                    setErrorMessage(getErrorMessage(e.code));
                }
                errorModal.open();
            }
        }
        finally {
            setInviting(false);
        }
    };
    const itemRenderer = useCallback((entry) => {
        switch (entry.item.kind) {
            case 'peer':
                return (React.createElement(PeerPickerListItem, { isGlobal: entry.item.isGlobal, controlType: "arrow", controlSide: "right", selected: entry.selected, disabled: entry.disabled, peerId: entry.item.peerId, onSelection: () => entry.onSelection({
                        id: entry.id,
                        value: entry.item,
                    }) }));
            case 'edu_peer':
            case 'template':
                return entry.item.node;
            default:
                return exhaustivenessCheck(entry.item);
        }
    }, []);
    const List = useCallback(
    // @todo Какое-то сложное расхождение по типам между Picker, PickerList, PeersPicker, PeersPickerList
    // Нужно детальнее погрузиться в цепочку вложенности компонентов и привести типы в порядок.
    (props) => {
        return (React.createElement(PeerPickerList, { ...props, itemRenderer: itemRenderer, header: React.createElement(InviteButton, { onClick: chatCreationModal.open, icon: React.createElement(Icon20Add, null), className: "UserChatInvite__createChatButton" }, lang.use('me_chat_invitation_create_chat_button')) }));
    }, [chatCreationModal.open, itemRenderer, lang]);
    const Search = useCallback(
    // @todo Какое-то сложное расхождение по типам между Picker, PickerList, PeersPicker, PeersPickerList
    // Нужно детальнее погрузиться в цепочку вложенности компонентов и привести типы в порядок.
    (props) => {
        return (React.createElement(PickerSearchInput, { ...props, placeholder: lang.use('me_user_chat_invite_search_placeholder') }));
    }, [lang]);
    const onChatCreation = (chatId) => {
        navigate({
            kind: 'ConvoRoute',
            peerId: chatId,
            entrypoint: 'create_conversation',
        });
    };
    const getErrorMessage = (code) => {
        switch (code) {
            case API_ERROR_LIMITS:
                return lang.use('me_chat_invitation_error_out_of_limits');
            case API_ERROR_MESSAGES_CHAT_NOT_ADMIN:
                return lang.use('me_chat_invitation_error_no_permissions');
            case API_ERROR_MESSAGES_GROUP_PEER_ACCESS:
                return lang.use('me_chat_invitation_error_community_interaction');
            case API_ERROR_MESSAGES_CONTACT_NOT_FOUND:
                return lang.use('me_chat_invitation_error_contact_not_found');
            case API_ERROR_MESSAGES_MESSAGE_REQUEST_ALREADY_SENT:
                return lang.use('me_chat_invitation_error_message_sent');
            case API_ERROR_MESSAGES_CHAT_DISABLED:
                return lang.use('me_chat_invitation_error_chat_disabled');
            case API_ERROR_MESSAGES_CHAT_UNSUPPORTED:
                return lang.use('me_chat_invitation_error_chat_not_supported');
            case API_ERROR_MESSAGES_MEMBER_ACCESS_TO_GROUP_DENIED:
                return lang.use('me_chat_invitation_error_no_group_access');
            case API_ERROR_MESSAGES_CHAT_MEMBER_NOT_STAFF:
                return lang.use('me_chat_invitation_error_not_staff');
            case API_ERROR_FLOOD:
            case API_ERROR_MESSAGES_SPAM_RESTRICTION:
                return lang.use('me_chat_invitation_error_spamblock_or_floodcontrol');
            case null:
            default:
                return lang.use('me_chat_invitation_error_unknown');
        }
    };
    const onLastMessagesChange = (event) => {
        setShowLastMessages(event.target.checked);
    };
    const inviteListFilter = (convo) => Convo.canInviteTo(convo, owner);
    return (React.createElement(React.Fragment, null,
        invitationModal.isActive && (React.createElement(ModalView, { onEscape: close },
            React.createElement(ModalBackdrop, { onClick: close },
                React.createElement(ModalPanel, { className: "UserChatInvite__modal", ariaLabelledby: modalTitleId },
                    React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: close, title: lang.use('me_chat_invitation_modal_title', {
                            values: { user: Peer.name(peer, 'acc') },
                        }), titleId: modalTitleId }),
                    React.createElement(ModalBody, { withCustomLayout: true },
                        React.createElement(ConvoPicker, { onSelectionChange: onConvoSelection, filter: "chats", className: "UserChatInvite__convoPicker", listRenderer: List, searchRenderer: Search, listFilter: inviteListFilter })),
                    React.createElement(ModalFooter, null,
                        React.createElement("div", { className: "UserChatInvite__footer" },
                            React.createElement(ReforgedCheckbox, { className: "UserChatInvite__checkbox", onChange: onLastMessagesChange, checked: showLastMessages }, lang.use('me_chat_invitation_show_last_messages', {
                                values: {
                                    num: INVITE_TO_CHAT_VISIBLE_MESSAGES_COUNT.toString(),
                                },
                                num: INVITE_TO_CHAT_VISIBLE_MESSAGES_COUNT,
                            })),
                            isInviting && React.createElement("div", { className: "UserChatInvite__tint" }))))))),
        React.createElement(ModalInterface, { onClose: chatCreationModal.close, onBack: chatCreationModal.close, backLabel: lang.use('me_back'), closeLabel: lang.use('me_close'), title: lang.use('me_chat_creation_title'), isHidden: !chatCreationModal.isActive, panelClass: "UserChatInvite__modal", withCustomLayout: true },
            React.createElement(ChatCreation, { onCreate: onChatCreation, modalGroupId: modalGroup.id, initialPeerIds: [peerId] })),
        errorModal.isActive && (React.createElement(ModalInterface, { closeLabel: lang.use('me_close'), onClose: closeError, title: lang.use('me_error_title'), buttons: React.createElement(Button, { mode: "primary", onClick: closeError }, lang.use('me_close')), withCustomLayout: true },
            React.createElement("div", { className: "UserChatInvite__error" }, errorMessage)))));
};
//# sourceMappingURL=UserChatInvite.js.map