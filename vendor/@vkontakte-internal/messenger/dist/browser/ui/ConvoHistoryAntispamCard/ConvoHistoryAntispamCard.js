import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import './ConvoHistoryAntispamCard.css';
import cx from 'classnames';
import { Icon20ErrorCircleOutline, Icon20MessagesOutline, Icon20UsersOutline, } from '@vkontakte/icons';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, usePeers } from '../../hooks/misc';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { useMutualHint } from '../../hooks/useMutualFriends';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { SpamReportConfirmModal } from '../../ui/SpamReportConfirmModal/SpamReportConfirmModal';
import { useModal } from '../../hooks/useModal';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { useInView } from 'react-intersection-observer';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { useApiFetch } from '../../hooks/useApiFetch';
import { UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES, useUnknownSenderAnalytics, } from '../../hooks/useUnknownSenderAnalytics';
export const ConvoHistoryAntispamCard = ({ className, convo, onInViewChange, }) => {
    const peers = usePeers();
    const peerId = convo.peerId;
    const peer = Peer.safeGet(peers, peerId);
    const dispatch = useDispatch();
    const apiFetch = useApiFetch();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const spamReportConfirmModal = useModal();
    const [spamCallbackData, setSpamCallbackData] = useState('');
    const { ref, inView } = useInView({
        threshold: 0,
        initialInView: true,
    });
    const [sharedConvosCount, setSharedConvosCount] = useState(0);
    useEffect(() => {
        ;
        (async () => {
            try {
                const { count } = await apiFetch('messages.getSharedConversations', {
                    peer_id: peerId,
                    extended: 0,
                });
                setSharedConvosCount(count);
            }
            catch { }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useLayoutEffect(() => {
        onInViewChange?.(inView);
    }, [inView, onInViewChange]);
    const banner = convo.convoBanner;
    const { sendHideEvent, sendShowEvent } = useUnknownSenderAnalytics(peerId, {
        bannerName: banner?.name,
        isUser2IdRequired: true,
    });
    useEffect(() => {
        if (UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES.includes(banner?.name)) {
            sendShowEvent({ firstSendingOnly: true });
        }
    }, [banner?.name, sendShowEvent]);
    if (!banner || peer.kind !== 'User') {
        return null;
    }
    const handleActionClick = (button) => {
        switch (button.type) {
            case 'antispam':
            case 'spam':
                if (button.type === 'antispam') {
                    setSpamCallbackData(button.callbackData);
                }
                spamReportConfirmModal.open();
                break;
            case 'hide_banner':
                if (UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES.includes(banner.name)) {
                    sendHideEvent();
                }
                dispatch({
                    type: 'UserHideConvoBanner',
                    name: banner.name,
                    peerId,
                });
                break;
            default:
                break;
        }
    };
    return (React.createElement("section", { className: cx(className, 'ConvoHistoryAntispamCard', {
            'ConvoHistoryAntispamCard--withoutBubbles': isWithoutBubblesTheme,
        }), ref: ref },
        React.createElement(ConvoHistoryAntispamCardUserInfo, { peer: peer }),
        React.createElement("div", { className: "ConvoHistoryAntispamCard__text ConvoHistoryAntispamCardText" },
            React.createElement(Icon20ErrorCircleOutline, { color: "var(--vkui--color_icon_negative)" }),
            banner.cardInfo?.text),
        React.createElement(ConvoHistoryAntispamCardMutualFriends, { peer: peer }),
        sharedConvosCount > 0 && (React.createElement(ConvoHistoryAntispamCardSharedConvosCount, { count: sharedConvosCount })),
        React.createElement("footer", { className: "ConvoHistoryAntispamCard__footer ConvoHistoryAntispamCardFooter" }, convo.convoBanner?.buttons.map((button, i) => (React.createElement(Button, { key: i, className: "ConvoHistoryAntispamCardFooter__button", appearance: button.appearance, mode: button.mode, onClick: () => handleActionClick(button) }, button.text)))),
        spamReportConfirmModal.isActive &&
            (Peer.isUserPeerId(peerId) || Peer.isChatPeerId(peerId)) && (React.createElement(SpamReportConfirmModal, { banner: banner, peerId: peerId, onClose: spamReportConfirmModal.close, callbackData: spamCallbackData }))));
};
const ConvoHistoryAntispamCardUserInfo = ({ peer }) => {
    const { lang } = useBrowserEnv();
    const name = useMemo(() => {
        if (peer.isDeactivated &&
            peer.deactivationReason === Peer.DEACTIVATED_REASON_DELETED) {
            return lang.use('me_convo_empty_history_user_name_deleted');
        }
        if (peer.isDeactivated &&
            peer.deactivationReason === Peer.DEACTIVATED_REASON_BANNED) {
            return lang.use('me_convo_empty_history_user_name_banned');
        }
        return Peer.name(peer);
    }, [peer, lang]);
    return (React.createElement("div", { className: "ConvoHistoryAntispamCardPeer" },
        React.createElement(PeerAvatar, { peer: peer, size: 72 }),
        React.createElement("div", { className: "ConvoHistoryAntispamCardPeerName" }, name)));
};
const ConvoHistoryAntispamCardMutualFriends = ({ peer, }) => {
    const { lang } = useBrowserEnv();
    const mutualFriends = useMutualHint(peer);
    return (mutualFriends &&
        mutualFriends.count > 0 &&
        !peer.isDeactivated && (React.createElement(UsersStack, { size: 16, count: mutualFriends.count, photos: mutualFriends.hint
            .map((user) => user?.photo)
            .filter((photo) => photo !== undefined)
            .reverse(), className: "ConvoHistoryAntispamCardMutualFriends" },
        React.createElement("span", { className: "ConvoHistoryAntispamCardMutualFriends__children" },
            React.createElement(Icon20UsersOutline, null),
            lang.use('me_n_common_friends', {
                num: mutualFriends.count,
            })))));
};
const ConvoHistoryAntispamCardSharedConvosCount = ({ count, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "ConvoHistoryAntispamCardSharedConvosCount" },
        React.createElement(Icon20MessagesOutline, null),
        lang.use('me_n_shared_convos_count', {
            num: count,
        })));
};
//# sourceMappingURL=ConvoHistoryAntispamCard.js.map