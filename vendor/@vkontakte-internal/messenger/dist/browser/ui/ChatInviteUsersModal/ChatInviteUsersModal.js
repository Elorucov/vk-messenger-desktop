import '../../ui/ChatInviteUsersModal/ChatInviteUsersModal.css';
import React, { useCallback, useEffect, useId, useState } from 'react';
import { Button } from '@vkontakte/vkui';
import { useBrowserEnv, useFeatureFlags, usePeers, useViewer, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ReforgedCheckbox } from '../../ui/ReforgedCheckbox/ReforgedCheckbox';
import { PeersPicker, } from '../../ui/PeersPicker/PeersPicker';
import { API_ERROR_FLOOD, API_ERROR_LIMITS, API_ERROR_MESSAGES_CHAT_ADD_TEMPORARY_DENIED, API_ERROR_MESSAGES_CHAT_CANT_ADD_USER_BY_PRIVACY, API_ERROR_MESSAGES_CHAT_DISABLED, API_ERROR_MESSAGES_CHAT_MEMBER_NOT_STAFF, API_ERROR_MESSAGES_CHAT_NOT_ADMIN, API_ERROR_MESSAGES_CHAT_UNSUPPORTED, API_ERROR_MESSAGES_CONTACT_NOT_FOUND, API_ERROR_MESSAGES_GROUP_PEER_ACCESS, API_ERROR_MESSAGES_MEMBER_ACCESS_TO_GROUP_DENIED, API_ERROR_MESSAGES_MESSAGE_REQUEST_ALREADY_SENT, API_ERROR_MESSAGES_SPAM_RESTRICTION, } from '@vkontakte-internal/api-schema-typescript';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { IApi } from '../../../data/env/IApi';
import { INVITE_TO_CHAT_VISIBLE_MESSAGES_COUNT } from '../../../core/config/config';
import { usePhoneJoin } from '../../hooks/usePhoneJoin';
import { PeerPickerList } from '../../ui/PeerPickerList/PeerPickerList';
import { InviteButton } from '../../ui/InviteButton/InviteButton';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon24ErrorCircleOutline, Icon24WarningTriangleOutline, Icon28CheckCircleOutline, } from '@vkontakte/icons';
import { PrivateMessageInviteModal } from '../../ui/PrivateMessageInviteModal/PrivateMessageInviteModal';
import { useApiFetchMany } from '../../hooks/useApiFetch';
export const ChatInviteUsersModal = ({ convo, onClose, }) => {
    const { lang } = useBrowserEnv();
    const batchInviteFetch = useBatchInviteFetch();
    const peers = usePeers();
    const { viewer: { isVerified }, profileType, } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const featureFlags = useFeatureFlags();
    const chatInviteGroup = useModalGroup();
    const inviteChatMembersModal = useModal(chatInviteGroup.id);
    const phoneJoinModal = useModal(chatInviteGroup.id);
    const sendInviteLinkModal = useModal(chatInviteGroup.id);
    const [peersToInvite, setPeersToInvite] = useState([]);
    const [failedWithPrivacyPeerIds, setFailedWithPrivacyPeerIds] = useState([]);
    const [withHistory, setWithHistory] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const modalTitleId = useId();
    const inviteLink = withHistory
        ? convo.inviteLinks?.withHistory
        : convo.inviteLinks?.noHistory;
    useEffect(() => {
        inviteChatMembersModal.open();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleClose = useCallback(() => {
        chatInviteGroup.closeGroup();
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatInviteGroup.closeGroup, onClose]);
    const handleInviteClick = async () => {
        setIsSending(true);
        try {
            await batchInviteFetch(peersToInvite, convo.peerId, withHistory);
            onClose();
        }
        catch (error) {
            if (error instanceof IApi.ExecuteErrors) {
                const response = error.response;
                const errors = error.list;
                // Сервер вернёт нам пользователей, которых не удалось добавить
                // В случае ошибки в ответе будет false, а в error.list под соответствующим индексом код ошибки
                // Мапим ид пользователя и код ошибки, чтоб понять почему не удалось добавить в чат
                const inviteErrors = response
                    .reduce((acc, resp, i) => {
                    const peerId = peersToInvite[i];
                    if (resp === false && peerId !== undefined) {
                        acc.push(peerId);
                    }
                    return acc;
                }, [])
                    .reduce((acc, cur, i) => {
                    const error = errors[i];
                    if (error) {
                        acc.set(cur, error.code);
                    }
                    return acc;
                }, new Map());
                setPeersToInvite((prev) => prev.filter((peerId) => inviteErrors.has(peerId)));
                // Если у нас есть ошибки добавления пользователей из-за настроек приватности, то показываем их
                const privacyErrorPeerIds = [...inviteErrors.keys()].filter((id) => inviteErrors.get(id) ===
                    API_ERROR_MESSAGES_CHAT_CANT_ADD_USER_BY_PRIVACY);
                if (privacyErrorPeerIds.length &&
                    inviteLink &&
                    featureFlags.vkm_send_private_message_link) {
                    setFailedWithPrivacyPeerIds(privacyErrorPeerIds);
                    sendInviteLinkModal.open();
                    return;
                }
                // Если нет ошибок приватности, то берём ошибку с наибольшим кодом
                // Они обычно более информативны и у нас сохраняется понятный порядок
                if (privacyErrorPeerIds.length === 0) {
                    const errorCode = Math.max(...inviteErrors.values());
                    snackbar({
                        message: getErrorMessage(errorCode),
                        before: React.createElement(Icon24ErrorCircleOutline, { color: "#E64646" }),
                    });
                    return;
                }
                // Если нет доступа к ссылке на чат, то показываем ошибки
                // Если есть одна ошибка, то показываем с именем пользователя
                if (privacyErrorPeerIds.length === 1) {
                    const peerId = privacyErrorPeerIds[0];
                    if (!peerId) {
                        return;
                    }
                    const peer = peers.get(peerId);
                    if (!peer) {
                        return;
                    }
                    snackbar({
                        message: lang.use('me_chat_invitation_error_privacy_one', {
                            sex: peer.kind === 'User' ? peer.sex : 'unknown',
                            values: {
                                name: Peer.name(peer),
                            },
                        }),
                        before: React.createElement(Icon24ErrorCircleOutline, { color: "#E64646" }),
                    });
                    return;
                }
                // Если часть пользователей не удалось добавить из-за настроек приватности,
                if (privacyErrorPeerIds.length !== inviteErrors.size) {
                    snackbar({
                        message: lang.use('me_chat_invitation_error_privacy_many'),
                        before: React.createElement(Icon24WarningTriangleOutline, { color: "#FFA000" }),
                    });
                    return;
                }
                // Остаётся вариант, что всех пользователей не удалось добавить из-за настроек приватности
                snackbar({
                    message: lang.use('me_chat_invitation_error_privacy_all'),
                    before: React.createElement(Icon24ErrorCircleOutline, { color: "#E64646" }),
                });
            }
            else if (error instanceof IApi.RequestError) {
                snackbar({
                    message: getErrorMessage(error.code),
                    before: (React.createElement(Icon24ErrorCircleOutline, { color: "var(--vkui--color_text_negative)" })),
                });
            }
        }
        finally {
            setIsSending(false);
        }
    };
    const checkDisabledItem = (peerId) => {
        const peer = Peer.safeGet(peers, peerId);
        return (convo.members.memberIds.has(peerId) ||
            !(peer?.kind === 'User' && peer.canInviteToChats));
    };
    const getErrorMessage = useCallback((code) => {
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
            case API_ERROR_MESSAGES_CHAT_ADD_TEMPORARY_DENIED:
                return lang.use('me_chat_invitation_error_temporary_denied');
            case API_ERROR_FLOOD:
            case API_ERROR_MESSAGES_SPAM_RESTRICTION:
                return lang.use('me_chat_invitation_error_spamblock_or_floodcontrol');
            case null:
            default:
                return lang.use('me_chat_invitation_error_unknown');
        }
    }, [lang]);
    const snackbar = useSnackbar();
    const handlePhoneJoinError = useCallback((error, peer) => {
        if (error instanceof IApi.RequestError) {
            if (error.code !== API_ERROR_MESSAGES_CHAT_CANT_ADD_USER_BY_PRIVACY ||
                peer === undefined) {
                snackbar({
                    message: getErrorMessage(error.code),
                    before: React.createElement(Icon24ErrorCircleOutline, { color: "#E64646" }),
                });
                return;
            }
            if (inviteLink) {
                setFailedWithPrivacyPeerIds([peer.id]);
                sendInviteLinkModal.open();
                return;
            }
            else {
                snackbar({
                    message: lang.use('me_chat_invitation_error_privacy_one', {
                        sex: 'unknown',
                        values: {
                            name: Peer.name(peer),
                        },
                    }),
                    before: React.createElement(Icon24ErrorCircleOutline, { color: "#E64646" }),
                });
            }
            return;
        }
    }, [getErrorMessage, inviteLink, lang, sendInviteLinkModal, snackbar]);
    const handlePhoneJoinSuccess = useCallback(() => {
        snackbar({
            message: lang.use('me_phone_invite_success'),
            before: (React.createElement(Icon28CheckCircleOutline, { color: "var(--vkui--color_accent_green)" })),
        });
        phoneJoinModal.close();
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, phoneJoinModal.close, snackbar]);
    const { modal } = usePhoneJoin({
        onClose: phoneJoinModal.close,
        onSuccess: handlePhoneJoinSuccess,
        onError: handlePhoneJoinError,
        peerId: convo.peerId,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const InviteUserPickerList = useCallback((props) => {
        const updatedItems = [
            ...props.items,
        ];
        if (!searchQuery && (!isEdu || isVerified)) {
            updatedItems.unshift({
                id: 'add-by-phone',
                item: {
                    kind: 'template',
                    id: 'add-by-phone',
                    node: (React.createElement(InviteButton, { onClick: phoneJoinModal.open }, lang.use('me_phone_invite_chat_action'))),
                },
                selected: false,
                disabled: false,
                focusedWithNavigation: false,
            });
        }
        return React.createElement(PeerPickerList, { ...props, items: updatedItems });
    }, [searchQuery, isEdu, isVerified, phoneJoinModal.open, lang]);
    return (React.createElement(React.Fragment, null,
        inviteChatMembersModal.isActive && (React.createElement(ModalView, { onEscape: onClose, contextClass: "MEConfig" },
            React.createElement(ModalBackdrop, { onClick: onClose },
                React.createElement(ModalPanel, { className: "ChatInviteUsersModal", ariaLabelledby: modalTitleId },
                    React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: onClose, title: lang.use('me_chat_members_add'), titleId: modalTitleId }),
                    React.createElement(ModalBody, { withCustomLayout: true },
                        React.createElement(PeersPicker, { onPeersSelectionChange: setPeersToInvite, className: "ChatInviteUsersModal__picker", strategy: "multiple", selectedPeerIds: peersToInvite, controlSide: "right", listRenderer: InviteUserPickerList, onQueryChange: setSearchQuery, checkDisabledItem: checkDisabledItem, convo: convo })),
                    React.createElement(ModalFooter, { buttons: [
                            React.createElement(Button, { mode: "primary", key: "submit", onClick: handleInviteClick, loading: isSending, disabled: peersToInvite.length === 0 }, lang.use('me_invite')),
                        ] },
                        React.createElement(ReforgedCheckbox, { onChange: () => setWithHistory(!withHistory), checked: withHistory }, lang.use('me_invite_link_history_shown_description'))))))),
        phoneJoinModal.isActive && modal,
        sendInviteLinkModal.isActive && inviteLink && (React.createElement(PrivateMessageInviteModal, { peerIds: failedWithPrivacyPeerIds, inviteLink: inviteLink, onClose: sendInviteLinkModal.close, onComplete: handleClose }))));
};
function useBatchInviteFetch() {
    const apiFetchMany = useApiFetchMany();
    return (peersToInvite, convoPeerId, withHistory) => {
        return apiFetchMany(peersToInvite.map((peerId) => ({
            method: 'messages.addChatUser',
            params: {
                source: 'search',
                peer_id: peerId,
                chat_id: Peer.toRealId(convoPeerId),
                visible_messages_count: withHistory
                    ? INVITE_TO_CHAT_VISIBLE_MESSAGES_COUNT
                    : 0,
            },
        })));
    };
}
//# sourceMappingURL=ChatInviteUsersModal.js.map