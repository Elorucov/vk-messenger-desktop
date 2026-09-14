import '../../ui/ChannelPostPendingSecondary/ChannelPostPendingSecondary.css';
import React, { useCallback, useState } from 'react';
import { PostText } from '../../ui/PostText/PostText';
import * as Attach from '../../../core/model/Attach';
import { ChannelPostAttaches } from '../../ui/ChannelPostAttaches/ChannelPostAttaches';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import { useRouter } from '../../ui/Router/Router';
import { ChannelPostContentWrapper } from '../../ui/ChannelPostContentWrapper/ChannelPostContentWrapper';
import { ChannelPostMediaAttaches } from '../../ui/ChannelPostMediaAttaches/ChannelPostMediaAttaches';
import { ChannelPostHeader } from '../../ui/ChannelPostSecondary/ChannelPostSecondary';
import cx from 'classnames';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useFeatureFlags } from '../../hooks/misc';
export const ChannelPostPendingSecondary = React.memo(({ post, channelId, channelName, channelPhoto, signerName, isCommunityChannel, onSizeChange, }) => {
    const { screenRoute, rightPanel, replace, navigate } = useRouter();
    const { isMobileLayout } = useLayoutData();
    const handleLinkClick = (e) => {
        const nextRoute = {
            organiser: screenRoute.organiser,
            ...rightPanel,
            kind: 'ChannelPanel',
            channelId: channelId,
            section: undefined,
        };
        if (rightPanel?.kind === 'ChannelPanel' &&
            channelId === rightPanel.channelId) {
            e.preventDefault();
            if (rightPanel.section !== undefined) {
                replace(nextRoute);
            }
            return;
        }
        navigate(nextRoute);
    };
    const featureFlags = useFeatureFlags();
    const [useCSSMinContentWidth, setUseCSSMinContentWidth] = useState(false);
    const [attachWidth, setAttachWidth] = useState(undefined);
    const handleAttachesWidthChange = useCallback((width) => {
        onSizeChange?.();
        if (featureFlags.vkm_new_bubbles_width_calc) {
            setUseCSSMinContentWidth(true);
            return;
        }
        setAttachWidth((prev) => {
            const attachWidth = Math.max(width || 0, prev || 0);
            if (attachWidth) {
                return attachWidth;
            }
            return;
        });
    }, [featureFlags.vkm_new_bubbles_width_calc, onSizeChange]);
    const width = (post.attaches.photos || post.attaches.videos || post.attaches.wall) &&
        attachWidth;
    const attaches = post.attaches;
    const isPrimaryAttaches = post.chunks.length === 0;
    const hasMediaAttaches = Boolean(attaches.photos ||
        attaches.videos ||
        Attach.docsWithPreview(attaches.docs));
    const hasPublicVideo = !isMobileLayout &&
        Attach.hasPublicVideo(attaches) &&
        attaches.videos?.[0].ownerId !== channelId;
    return (React.createElement("div", { className: cx('ChannelPostPendingSecondary', {
            'ChannelPostPendingSecondary--withText': post.chunks.length !== 0,
        }) },
        React.createElement("div", { className: "ChannelPostPendingSecondary__avatar", tabIndex: 0, role: "button", "aria-label": channelName, onClick: handleLinkClick },
            React.createElement(ChannelAvatar, { name: channelName, photo: channelPhoto, size: 36 })),
        React.createElement(ChannelPostHeader, { onTitleClick: handleLinkClick, channelName: channelName, signerName: signerName, sentAt: post.sentAt, views: 0, commentsCount: 0 }),
        React.createElement(ChannelPostContentWrapper, { className: cx('ChannelPostPendingSecondary__content', {
                'ChannelPostPendingSecondary--fitMediaAttachesWidth': useCSSMinContentWidth,
            }) },
            hasMediaAttaches && !hasPublicVideo && (React.createElement(ChannelPostMediaAttaches, { className: cx('ChannelPostPendingSecondary__mediaAttaches', {
                    'ChannelPostPendingSecondary__mediaAttaches--withPublicVideo': hasPublicVideo,
                }), attaches: attaches, onWidthChange: handleAttachesWidthChange, hidePublicVideoInfo: true })),
            React.createElement("div", { className: cx({
                    ChannelPostPendingSecondary__mainContent: !useCSSMinContentWidth,
                }), style: { width } },
                post.chunks && (React.createElement(PostText, { channelId: channelId, chunks: post.chunks, isCommunityChannel: isCommunityChannel })),
                hasMediaAttaches && hasPublicVideo && (React.createElement(ChannelPostMediaAttaches, { className: cx('ChannelPostPendingSecondary__mediaAttaches', {
                        'ChannelPostPendingSecondary__mediaAttaches--withPublicVideo': hasPublicVideo,
                    }), attaches: attaches })),
                React.createElement(ChannelPostAttaches, { className: "ChannelPostPendingSecondary__attaches", attaches: attaches, channelId: channelId, postCmid: post.cmid, onWidthChange: handleAttachesWidthChange, isPrimary: isPrimaryAttaches })))));
});
//# sourceMappingURL=ChannelPostPendingSecondary.js.map