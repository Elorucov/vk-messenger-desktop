import '../../ui/ChannelActionModal/ChannelActionModal.css';
import React, { useCallback, useId } from 'react';
import * as Channel from '../../../core/model/Channel';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { Button } from '@vkontakte/vkui';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { useRouter } from '../../ui/Router/Router';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
const ChannelActionModal = ({ modalTitle, modalBody, buttons, onModalClose = () => { } }) => {
    const { lang } = useBrowserEnv();
    const modalTitleId = useId();
    return (React.createElement(ModalView, { onEscape: onModalClose, contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, { onClick: onModalClose },
            React.createElement(ModalPanel, { className: "ChannelActionModal__panel", ariaLabelledby: modalTitleId },
                React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: onModalClose, title: modalTitle, titleId: modalTitleId }),
                React.createElement(ModalBody, null, modalBody),
                React.createElement(ModalFooter, { buttons: buttons })))));
};
export const DeleteChannelModal = ({ channel, isCommunityChannel, onModalClose }) => {
    const dispatch = useDispatch();
    const { lang, stats } = useBrowserEnv();
    const { navigate } = useRouter();
    const modalTitle = isCommunityChannel
        ? lang.use('me_community_channel_delete_modal_title')
        : lang.use('me_channel_delete_modal_title');
    const modalBody = isCommunityChannel ? (lang.use('me_community_channel_delete_modal_text')) : (React.createElement(FormattedLangKey, { values: { name: channel.name }, langkey: "me_channel_admin_delete_modal_text" }));
    const handleDeleteModalSubmit = useCallback((action) => {
        // обработка закрытия канала происходит в ChannelMain
        dispatch({
            type: 'UserChangedChannel',
            channelId: channel.id,
            userAction: action,
            onComplete: () => {
                const screenName = Channel.getCommunityChannelParentScreenName(channel);
                // При удалении канала перекидываем в родительское сообщество
                if (isCommunityChannel && action === 'delete' && screenName) {
                    navigate({
                        kind: 'ScreenNameProxyRoute',
                        screenName,
                    });
                }
            },
        });
        onModalClose?.();
    }, [dispatch, channel, onModalClose, navigate, isCommunityChannel]);
    const handleDeleteCancel = () => {
        if (isCommunityChannel) {
            stats.logEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_messaging_action_item',
                    type_messaging_action_item: {
                        action_type: 'CANCEL_DELETE_CHANNEL',
                        conversation_id: channel.id,
                        conversation_type: 'channel',
                        community_id: channel.parentId,
                        label: getLogEventLabel(),
                    },
                },
            });
        }
        onModalClose?.();
    };
    const buttons = isCommunityChannel
        ? [
            React.createElement(Button, { mode: "secondary", appearance: "accent", key: "cancel", onClick: handleDeleteCancel }, lang.use('me_cancel')),
            React.createElement(Button, { mode: "primary", key: "submit", onClick: () => handleDeleteModalSubmit('delete') }, lang.use('me_community_channel_delete_modal_confirm')),
        ]
        : [
            React.createElement(Button, { mode: "tertiary", appearance: "negative", key: "cancel", onClick: () => handleDeleteModalSubmit('delete') }, lang.use('me_channel_action_delete_for_all')),
            React.createElement(Button, { mode: "primary", key: "submit", onClick: () => handleDeleteModalSubmit('leave') }, lang.use('me_channel_action_delete_for_admin')),
        ];
    return (React.createElement(ChannelActionModal, { modalTitle: modalTitle, modalBody: modalBody, buttons: buttons, onModalClose: handleDeleteCancel }));
};
export const LeaveChannelModal = ({ channel, isCommunityChannel, onModalClose }) => {
    const dispatch = useDispatch();
    const { lang, stats } = useBrowserEnv();
    const modalTitle = isCommunityChannel
        ? lang.use('me_community_channel_leave_modal_title')
        : lang.use('me_channel_leave_modal_title');
    const modalBody = isCommunityChannel ? (lang.use('me_community_channel_leave_modal_text')) : (React.createElement(FormattedLangKey, { values: { bold: (text) => React.createElement("b", null, text), name: channel.name }, langkey: "me_channel_delete_modal_text" }));
    const handleDeleteModalSubmit = useCallback(() => {
        // обработка закрытия канала происходит в ChannelMain
        dispatch({
            type: 'UserChangedChannel',
            channelId: channel.id,
            userAction: 'leave',
        });
        onModalClose?.();
    }, [dispatch, channel, onModalClose]);
    const handleLeaveCancel = () => {
        if (isCommunityChannel) {
            stats.logEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_messaging_action_item',
                    type_messaging_action_item: {
                        action_type: 'CANCEL_LEAVE_CHANNEL',
                        conversation_id: channel.id,
                        conversation_type: 'channel',
                        community_id: channel.parentId,
                        label: getLogEventLabel(),
                    },
                },
            });
        }
        onModalClose?.();
    };
    const buttons = isCommunityChannel
        ? [
            React.createElement(Button, { mode: "secondary", key: "cancel", onClick: handleLeaveCancel }, lang.use('me_community_channel_leave_modal_action_stay')),
            React.createElement(Button, { mode: "primary", appearance: "negative", key: "submit", onClick: handleDeleteModalSubmit }, lang.use('me_community_channel_leave_modal_action_confirm')),
        ]
        : [
            React.createElement(Button, { mode: "tertiary", key: "cancel", onClick: onModalClose }, lang.use('me_cancel')),
            React.createElement(Button, { mode: "primary", key: "submit", onClick: handleDeleteModalSubmit }, lang.use('me_channel_action_leave_submit')),
        ];
    return (React.createElement(ChannelActionModal, { modalTitle: modalTitle, modalBody: modalBody, buttons: buttons, onModalClose: handleLeaveCancel }));
};
//# sourceMappingURL=ChannelActionModal.js.map