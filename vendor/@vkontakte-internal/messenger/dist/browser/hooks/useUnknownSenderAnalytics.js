import { useCallback, useEffect, useRef } from 'react';
import { useBrowserEnv, useConvo, useViewer } from '../hooks/misc';
import { getConvoMemberInviterId } from '../../core/model/Convo';
/**
 * Банеры по которым требуется отправка данных аналитики
 */
export const UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES = [
    'not_friend',
    'spam_chat_invite_banner',
    'spam_dialog',
];
export function useUnknownSenderAnalytics(peerId, { bannerName, isUser2IdRequired } = {}) {
    const { stats: { logEvent: statsLogEvent }, } = useBrowserEnv();
    const isFirstShowEventSending = useRef(true);
    const convo = useConvo(peerId);
    const viewer = useViewer();
    const inviterId = getConvoMemberInviterId(convo, viewer.id);
    const queue = useRef([]);
    const getUser2IdByBannerName = useCallback((name) => {
        switch (name) {
            case 'not_friend':
            case 'spam_dialog':
                return peerId;
            case 'spam_chat_invite_banner':
                return inviterId;
            default:
                throw new Error('Запрошен "user2_id" для неподдерживаемого банера');
        }
    }, [inviterId, peerId]);
    let user2IdByBannerName;
    let isUser2IdByBannerNameNone = false;
    try {
        if (bannerName) {
            user2IdByBannerName = getUser2IdByBannerName(bannerName);
        }
        else {
            isUser2IdByBannerNameNone = true;
        }
    }
    catch (error) {
        isUser2IdByBannerNameNone = true;
    }
    useEffect(() => {
        if (user2IdByBannerName) {
            for (let callback = queue.current.shift(); callback; callback = queue.current.shift()) {
                callback(user2IdByBannerName);
            }
        }
    }, [user2IdByBannerName]);
    const baseSendEvent = useCallback((callback, { user2Id } = {}) => {
        const _user2Id = user2Id || user2IdByBannerName;
        if (isUser2IdRequired && !_user2Id) {
            if (isUser2IdByBannerNameNone) {
                throw new Error('Отсутствует значение для обязательного поля "user2_id"');
            }
            queue.current.push(callback);
            return;
        }
        callback(_user2Id);
    }, [isUser2IdByBannerNameNone, isUser2IdRequired, user2IdByBannerName]);
    const sendComplaintEvent = useCallback(({ isBanChecked, isRemoveChatChecked, user2Id } = {}) => baseSendEvent((user2Id) => {
        statsLogEvent({
            type: 'type_action',
            type_action: {
                type: 'type_im_conversations_banner_item',
                type_im_conversations_banner_item: {
                    event_type: 'click',
                    banner_name: 'unknown_sender',
                    user2_id: user2Id,
                },
            },
        });
        if (isRemoveChatChecked) {
            statsLogEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_messaging_action_item',
                    type_messaging_action_item: {
                        action_type: 'LEAVE_CHAT',
                        label: 'unknown_sender',
                        peer_id: peerId,
                        user2_id: user2Id,
                    },
                },
            });
        }
        if (isBanChecked) {
            statsLogEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_messaging_action_item',
                    type_messaging_action_item: {
                        action_type: 'ADD_TO_BLACKLIST',
                        label: 'unknown_sender',
                        peer_id: peerId,
                        user2_id: user2Id,
                    },
                },
            });
        }
    }, { user2Id }), [baseSendEvent, peerId, statsLogEvent]);
    const sendHideEvent = useCallback(({ user2Id } = {}) => baseSendEvent((user2Id) => statsLogEvent({
        type: 'type_action',
        type_action: {
            type: 'type_im_conversations_banner_item',
            type_im_conversations_banner_item: {
                event_type: 'hide',
                banner_name: 'unknown_sender',
                user2_id: user2Id,
            },
        },
    }), { user2Id }), [baseSendEvent, statsLogEvent]);
    const sendShowEvent = useCallback(({ firstSendingOnly, user2Id } = {}) => {
        if (firstSendingOnly && !isFirstShowEventSending.current) {
            return;
        }
        isFirstShowEventSending.current = false;
        baseSendEvent((user2Id) => statsLogEvent({
            type: 'type_action',
            type_action: {
                type: 'type_im_conversations_banner_item',
                type_im_conversations_banner_item: {
                    event_type: 'show',
                    banner_name: 'unknown_sender',
                    user2_id: user2Id,
                },
            },
        }), { user2Id });
    }, [baseSendEvent, statsLogEvent]);
    return {
        getUser2IdByBannerName,
        sendComplaintEvent,
        sendHideEvent,
        sendShowEvent,
    };
}
//# sourceMappingURL=useUnknownSenderAnalytics.js.map