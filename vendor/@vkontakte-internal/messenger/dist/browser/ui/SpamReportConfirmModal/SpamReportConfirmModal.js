import React, { useState } from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, useOwner, usePeers, useViewer, } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalView } from '../../ui/ModalView/ModalView';
import { Icon20PrivacyCircleFillRed, Icon24CheckCircleOn, Icon24ErrorCircleOutline, } from '@vkontakte/icons';
import { getOwnerGroupId } from '../../../data/store/State';
import { useSnackbar } from '../../hooks/useSnackbar';
import '../../ui/SpamReportConfirmModal/SpamReportConfirmModal.css';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalCloseButton } from '../../ui/ModalCloseButton/ModalCloseButton';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { Button, Checkbox, Group, Title } from '@vkontakte/vkui';
import { UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES, useUnknownSenderAnalytics, } from '../../hooks/useUnknownSenderAnalytics';
export const SpamReportConfirmModal = ({ banner, onClose, peerId, reportRequestExtraData, callbackData, }) => {
    const [isPending, setIsPending] = useState(false);
    const [isBanChecked, setIsBanChecked] = useState(true);
    const [isRemoveChatChecked, setIsRemoveChatChecked] = useState(true);
    const [isReportChecked, setIsReportChecked] = useState(true);
    const { lang, api } = useBrowserEnv();
    const { sendComplaintEvent } = useUnknownSenderAnalytics(peerId, {
        bannerName: banner.name,
        isUser2IdRequired: true,
    });
    const { id: ownerId } = useOwner();
    const { id: viewerId } = useViewer();
    const dispatch = useDispatch();
    const router = useRouter();
    const showSnackbar = useSnackbar();
    const peers = usePeers();
    const peer = Peer.safeGet(peers, peerId);
    const canSubmit = peer.kind === 'User'
        ? isBanChecked || isRemoveChatChecked || isReportChecked
        : isRemoveChatChecked || isReportChecked;
    if (peer.kind !== 'User' && peer.kind !== 'Chat') {
        return null;
    }
    const handleAction = async () => {
        try {
            setIsPending(true);
            if (UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES.includes(banner.name)) {
                sendComplaintEvent({ isBanChecked, isRemoveChatChecked });
            }
            await sendRequests({
                api,
                dispatch,
                peerId,
                viewerId,
                ownerId,
                isBanChecked,
                isRemoveChatChecked,
                isReportChecked,
                reportRequestExtraData,
                callbackData,
                bannerName: banner.name,
                shouldOmitReportsAdd: Boolean(callbackData),
            });
            const messages = {
                /**
                 * 1   - isRemoveChatChecked
                 * 01  - isBanChecked
                 * 001 - isReportChecked
                 */
                User: peer.kind === 'User'
                    ? {
                        '111': lang.use('me_spam_report_modal_snackbar_all_checked', {
                            values: {
                                name: peer.firstName,
                            },
                            sex: peer.sex,
                        }),
                        '100': lang.use('me_spam_report_modal_snackbar_remove_checked'),
                        '110': lang.use('me_spam_report_modal_snackbar_remove_and_ban_checked', {
                            values: {
                                name: peer.firstName,
                            },
                            sex: peer.sex,
                        }),
                        '101': lang.use('me_spam_report_modal_snackbar_remove_and_report_checked'),
                        '010': lang.use('me_spam_report_modal_snackbar_ban_checked', {
                            values: {
                                name: peer.firstName,
                            },
                            sex: peer.sex,
                        }),
                        '011': lang.use('me_spam_report_modal_snackbar_ban_and_report_checked', {
                            values: {
                                name: peer.firstName,
                            },
                            sex: peer.sex,
                        }),
                        '001': lang.use('me_spam_report_modal_snackbar_report_checked'),
                    }
                    : {},
                /**
                 * 1  - isRemoveChatChecked
                 * 01 - isReportChecked
                 */
                Chat: {
                    '11': lang.use('me_spam_report_modal_snackbar_group_all_checked'),
                    '10': lang.use('me_spam_report_modal_snackbar_group_remove_checked'),
                    '01': lang.use('me_spam_report_modal_snackbar_group_report_checked'),
                },
            };
            const message = messages[peer.kind][peer.kind === 'User'
                ? `${+isRemoveChatChecked}${+isBanChecked}${+isReportChecked}`
                : `${+isRemoveChatChecked}${+isReportChecked}`];
            showSnackbar({
                message,
                before: React.createElement(Icon24CheckCircleOn, { fill: "var(--vkui--color_icon_accent)" }),
            });
            if (isRemoveChatChecked) {
                router.navigate({ kind: 'MainRoute' });
            }
            onClose();
        }
        catch {
            showSnackbar({
                message: lang.use('me_report_user_as_spam_modal_error_text'),
                before: (React.createElement(Icon24ErrorCircleOutline, { fill: "var(--vkui--color_icon_negative)" })),
            });
        }
        finally {
            setIsPending(false);
        }
    };
    return (React.createElement(ModalView, { onEscape: onClose },
        React.createElement(ModalBackdrop, { onClick: onClose },
            React.createElement(ModalPanel, { className: "SpamReportConfirmModal__modalPanel", topRight: React.createElement(ModalCloseButton, { closeLabel: lang.use('me_close'), onClose: onClose, mode: "modalHeader" }) },
                React.createElement(ModalBody, null,
                    React.createElement("div", { className: "SpamReportConfirmModal__wrapper" },
                        React.createElement("div", { className: "SpamReportConfirmModal__body" },
                            React.createElement("div", { className: "SpamReportConfirmModalPhoto" },
                                React.createElement(PeerAvatar, { peer: peer, size: 72 }),
                                React.createElement(Icon20PrivacyCircleFillRed, { className: "SpamReportConfirmModalPhoto__icon" })),
                            React.createElement(Title, { level: "2", weight: "2", style: { textAlign: 'center' }, Component: "h2", useAccentWeight: true }, lang.use('me_chat_spam_report_modal_title'))),
                        React.createElement(Group, { className: "SpamReportConfirmModal__checkboxes", style: {
                                background: 'var(--vkui--color_background_secondary)',
                            } },
                            React.createElement("div", null,
                                peer.kind === 'User' && (React.createElement(React.Fragment, null,
                                    React.createElement(Checkbox, { checked: isRemoveChatChecked, onChange: () => {
                                            setIsRemoveChatChecked((v) => !v);
                                        } }, lang.use('me_chat_spam_report_modal_delete_checkox')),
                                    React.createElement(Checkbox, { checked: isBanChecked, onChange: () => {
                                            setIsBanChecked((v) => !v);
                                        }, description: lang.use('me_chat_spam_report_modal_blacklist_checkox_desc', {
                                            values: {
                                                name: peer.firstName,
                                            },
                                        }) }, lang.use('me_chat_spam_report_modal_blacklist_checkox')),
                                    React.createElement(Checkbox, { checked: isReportChecked, onChange: () => {
                                            setIsReportChecked((v) => !v);
                                        }, description: lang.use('me_chat_spam_report_modal_report_checkox_desc') }, lang.use('me_chat_spam_report_modal_report_checkox')))),
                                peer.kind === 'Chat' && (React.createElement(React.Fragment, null,
                                    React.createElement(Checkbox, { checked: isRemoveChatChecked, onChange: () => {
                                            setIsRemoveChatChecked((v) => !v);
                                        } }, lang.use('me_chat_spam_report_modal_leave_checkox')),
                                    React.createElement(Checkbox, { checked: isReportChecked, onChange: () => {
                                            setIsReportChecked((v) => !v);
                                        }, description: lang.use('me_groupchat_spam_report_modal_report_checkox_desc') }, lang.use('me_chat_spam_report_modal_report_checkox')))))),
                        React.createElement("div", { className: "SpamReportConfirmModal__actions" },
                            React.createElement(Button, { mode: "secondary", size: "l", stretched: true, onClick: onClose }, lang.use('me_cancel')),
                            React.createElement(Button, { size: "l", stretched: true, disabled: !canSubmit, onClick: handleAction, loading: isPending }, lang.use('me_chat_spam_report_modal_submit')))))))));
};
async function sendRequests(params) {
    const { peerId, api, dispatch, callbackData, bannerName } = params;
    if (Peer.isUserPeerId(peerId)) {
        await sendRequestsForUser({
            ...params,
            peerId,
        });
    }
    else {
        await sendRequestsForChat({
            ...params,
            peerId,
        });
    }
    if (callbackData) {
        await api.fetch('messages.conversationBarCallback', {
            peer_id: peerId,
            callback_data: callbackData,
        });
    }
    dispatch({
        type: 'UserHideConvoBanner',
        name: bannerName,
        peerId: peerId,
    });
}
async function sendRequestsForUser({ api, peerId, isBanChecked, isReportChecked, isRemoveChatChecked, reportRequestExtraData, shouldOmitReportsAdd, }) {
    try {
        await api.fetchMany([
            ...(isReportChecked && !shouldOmitReportsAdd
                ? [
                    {
                        method: 'reports.add',
                        params: {
                            type: 'dialogue',
                            item_id: peerId,
                            extra_data: reportRequestExtraData,
                        },
                    },
                ]
                : []),
            ...(isBanChecked
                ? [
                    {
                        method: 'account.ban',
                        params: {
                            owner_id: peerId,
                        },
                    },
                ]
                : []),
            ...(isRemoveChatChecked
                ? [
                    {
                        method: 'messages.deleteConversation',
                        params: {
                            user_id: peerId,
                            group_id: 0,
                        },
                    },
                ]
                : []),
        ]);
    }
    catch (err) {
        handleRequestsErrors(err);
    }
}
async function sendRequestsForChat({ api, peerId, viewerId, ownerId, reportRequestExtraData, isReportChecked, isRemoveChatChecked, shouldOmitReportsAdd, }) {
    try {
        await api.fetchMany([
            ...(isReportChecked && !shouldOmitReportsAdd
                ? [
                    {
                        method: 'reports.add',
                        params: {
                            type: 'chat',
                            item_id: peerId,
                            extra_data: reportRequestExtraData,
                        },
                    },
                ]
                : []),
            // При репорте на чат, необходимо выйти из него
            ...(Peer.isChatPeerId(peerId) && isRemoveChatChecked
                ? [
                    {
                        method: 'messages.removeChatUser',
                        params: {
                            chat_id: Peer.toRealId(peerId),
                            user_id: Peer.toRealId(viewerId),
                            group_id: getOwnerGroupId(ownerId),
                        },
                    },
                ]
                : []),
        ]);
        if (isRemoveChatChecked) {
            // Удаляем беседу после выхода из нее, так как выход из беседы генерирует сообщение
            await api.fetch('messages.deleteConversation', {
                peer_id: peerId,
                group_id: getOwnerGroupId(ownerId),
            });
        }
    }
    catch (err) {
        handleRequestsErrors(err);
    }
}
// Скипаем ACCESS_DENIED, так как мы не можем определить был ли уже отправлен репорт,
// и при повторной отправке репорта получаем ACCESS_DENIED
function handleRequestsErrors(err) {
    const ACCESS_DENIED_ERROR_CODE = 15;
    const hasErrorList = (err) => {
        return !!err && typeof err === 'object' && 'list' in err;
    };
    if (hasErrorList(err) &&
        Array.isArray(err.list) &&
        err.list.every((errItem) => 'code' in errItem && errItem.code === ACCESS_DENIED_ERROR_CODE)) {
        return;
    }
    throw err;
}
//# sourceMappingURL=SpamReportConfirmModal.js.map