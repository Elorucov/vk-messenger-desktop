import React, { useCallback, useRef, useState } from 'react';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { Interpolate } from '@vkontakte-internal/vkcom-kit';
import cx from 'classnames';
import { Icon24AddSquareOutline, Icon24CheckCircleOutline, Icon24CheckSquareOutline, Icon24WarningTriangleOutline, } from '@vkontakte/icons';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useSubscribeOnClipAuthor } from '../../hooks/useSubscribeOnClipAuthor';
export const AttachVideoClipsTitle = ({ author, peersCached, coownerPeers, clipId, ownerId, onClick, }) => {
    const { vkm_coauthors_posts_and_clips } = useFeatureFlags();
    const { lang, stats } = useBrowserEnv();
    const snackbar = useSnackbar();
    const containerRef = useRef(null);
    const [fits, setFits] = useState(null);
    const isThereSingleAuthor = !coownerPeers.length || !vkm_coauthors_posts_and_clips;
    const isThereTwoAuthors = coownerPeers.length === 1 && peersCached && (fits || fits === null);
    const subscribtionManager = useSubscribeOnClipAuthor({
        author,
        onSubscribeSucceed: () => snackbar({
            message: lang.use('me_convo_clip_subscribe_succeed_snackbar'),
            mode: 'dark',
            before: (React.createElement(Icon24CheckCircleOutline, { color: "var(--vkui--color_icon_positive)" })),
        }),
        onSubscribeFailed: () => snackbar({
            message: lang.use('me_convo_clip_subscribe_failed_snackbar'),
            mode: 'dark',
            before: (React.createElement(Icon24WarningTriangleOutline, { color: "var(--vkui--color_icon_negative)" })),
        }),
        onUnsubscribeSucceed: () => snackbar({
            message: lang.use('me_convo_clip_unsubscribe_succeed_snackbar'),
            mode: 'dark',
            before: (React.createElement(Icon24CheckCircleOutline, { color: "var(--vkui--color_icon_positive)" })),
        }),
        onUnsubscribeFailed: () => snackbar({
            message: lang.use('me_convo_clip_unsubscribe_failed_snackbar'),
            mode: 'dark',
            before: (React.createElement(Icon24WarningTriangleOutline, { color: "var(--vkui--color_icon_negative)" })),
        }),
    });
    const handleSubscriptionEvent = useCallback((type) => {
        stats.logEvent({
            type: 'type_click',
            screen: 'im_chat',
            type_click: {
                item: {
                    id: clipId,
                    owner_id: ownerId,
                    type: 'clip',
                },
                type: 'type_clip_viewer_item',
                type_clip_viewer_item: {
                    video_owner_id: ownerId,
                    video_id: clipId,
                    event_type: 'click_to_subscription_button',
                    type_clips_subscribe_click_item: {
                        event_subtype: type,
                        subscription_place: 'im_chat',
                    },
                    screen_type: 'subscriptions',
                },
            },
        });
    }, [stats, ownerId, clipId]);
    return (React.createElement("div", { className: cx('AttachVideosClip__title', {
            'AttachVideosClip__title--withSubscribeButton': isThereSingleAuthor,
        }), ref: containerRef, onClick: onClick },
        isThereSingleAuthor && (React.createElement(React.Fragment, null,
            React.createElement(PeerTitle, { peer: author, className: "AttachVideosClip__authorName", iconColor: "var(--vkui--color_text_contrast)" }),
            subscribtionManager.canSubscribe && (React.createElement("button", { className: "AttachVideosClip__manageSubscriptionButton", onClick: (e) => {
                    subscribtionManager.subscribe(e);
                    handleSubscriptionEvent('subscribe');
                } },
                React.createElement(Icon24AddSquareOutline, null))),
            subscribtionManager.canUnsubscribe && (React.createElement("button", { className: "AttachVideosClip__manageSubscriptionButton", onClick: (e) => {
                    subscribtionManager.unsubscribe(e);
                    handleSubscriptionEvent('unsubscribe');
                } },
                React.createElement(Icon24CheckSquareOutline, null))))),
        isThereTwoAuthors && (React.createElement("div", { ref: (ref) => {
                if (fits === null && ref && containerRef.current) {
                    setFits(ref.clientWidth < containerRef.current.clientWidth);
                }
            } }, coownerPeers[0] && (React.createElement(Interpolate, { values: {
                name1: (React.createElement(PeerTitle, { peer: author, iconColor: "var(--vkui--color_text_contrast)", skipImageStatus: true })),
                name2: (React.createElement(PeerTitle, { peer: coownerPeers[0], iconColor: "var(--vkui--color_text_contrast)", skipImageStatus: true })),
            } }, lang.use('me_attaches_authors_title_and_name', {
            values: {
                name1: '<name1 />',
                name2: '<name2 />',
            },
        }))))),
        !isThereSingleAuthor && !isThereTwoAuthors && (React.createElement(AttachTitleRestAuthors, { author: author, coownersLength: coownerPeers.length }))));
};
const AttachTitleRestAuthors = ({ author, coownersLength, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(Interpolate, { values: {
            name: (React.createElement(PeerTitle, { peer: author, iconColor: "var(--vkui--color_text_contrast)", skipImageStatus: true })),
            count: coownersLength.toString(),
            span: ({ children }) => React.createElement("span", null, children),
        } }, lang.use('me_attaches_name_and_more_authors_short', {
        values: {
            name: '{name}',
            count: '{count}',
            span: (children) => `<span>${children}</span>`,
        },
    })));
};
//# sourceMappingURL=AttachVideoClipsTitle.js.map