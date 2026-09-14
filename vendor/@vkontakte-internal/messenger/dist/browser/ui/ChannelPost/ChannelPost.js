import '../../ui/ChannelPost/ChannelPost.css';
import React, { forwardRef, useCallback, useState, } from 'react';
import { PostText } from '../../ui/PostText/PostText';
import { useBrowserEnv, useDispatch, useFeatureFlags } from '../../hooks/misc';
import { Icon12View } from '@vkontakte/icons';
import cx from 'classnames';
import * as Attach from '../../../core/model/Attach';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { ChannelPostDonutPlaceholder } from '../../ui/ChannelPostDonutPlaceholder/ChannelPostDonutPlaceholder';
import { ChannelPostMediaAttaches } from '../../ui/ChannelPostMediaAttaches/ChannelPostMediaAttaches';
import { ChannelPostAttaches } from '../../ui/ChannelPostAttaches/ChannelPostAttaches';
import { FormattedDate } from '../../ui/Time/Time';
import { ChannelPostPrimaryHighlightWrapper } from '../../ui/ChannelPostHighlightWrapper/ChannelPostPrimaryHighlightWrapper';
export const ChannelPostPending = React.memo(({ className, post, channelId, isCommunityChannel, onSizeChange }) => {
    const { isMobileLayout } = useLayoutData();
    const featureFlags = useFeatureFlags();
    const [useCSSMinContentWidth, setUseCSSMinContentWidth] = useState(false);
    const [attachWidth, setAttachWidth] = useState(undefined);
    const handleAttachesWidthChange = useCallback((width) => {
        setAttachWidth((prev) => {
            onSizeChange?.();
            if (featureFlags.vkm_new_bubbles_width_calc) {
                setUseCSSMinContentWidth(true);
                return;
            }
            const attachWidth = Math.max(width || 0, prev || 0);
            if (attachWidth) {
                return attachWidth;
            }
            return;
        });
    }, [featureFlags.vkm_new_bubbles_width_calc, onSizeChange]);
    const attaches = post.attaches;
    const isPrimaryAttaches = post.chunks.length === 0;
    const hasMediaAttaches = Boolean(attaches.photos ||
        attaches.videos ||
        Attach.docsWithPreview(attaches.docs));
    const hasPublicVideo = !isMobileLayout &&
        Attach.hasPublicVideo(attaches) &&
        attaches.videos?.[0].ownerId !== channelId;
    const width = (hasMediaAttaches || attaches.wall) && attachWidth;
    return (React.createElement(ChannelPost, { className: cx(className, 'ChannelPostPending', {
            'ChannelPostPending--withText': post.chunks.length !== 0,
            'ChannelPostPending--fitMediaAttachesWidth': useCSSMinContentWidth,
        }), maxWidth: width },
        hasMediaAttaches && !hasPublicVideo && (React.createElement(ChannelPostMediaAttaches, { className: "ChannelPost__mediaAttaches", attaches: attaches, hidePublicVideoInfo: true, onWidthChange: handleAttachesWidthChange })),
        React.createElement("div", { className: "ChannelPost__content" },
            hasMediaAttaches && hasPublicVideo && (React.createElement(ChannelPostMediaAttaches, { className: "ChannelPost__mediaAttaches ChannelPost__mediaAttaches--withPublicVideo", attaches: attaches, onWidthChange: handleAttachesWidthChange })),
            post.chunks && (React.createElement(PostText, { channelId: channelId, chunks: post.chunks, isCommunityChannel: isCommunityChannel })),
            React.createElement(ChannelPostAttaches, { attaches: post.attaches, channelId: channelId, postCmid: post.cmid, isPrimary: isPrimaryAttaches, onWidthChange: handleAttachesWidthChange }),
            React.createElement(ChannelPostMeta, { sentAt: post.sentAt }))));
});
ChannelPostPending.displayName = 'ChannelPostPending';
export const ChannelPostMarkedDeleted = React.memo(({ className, cmid, channelId, canRestore, isPostponed, isHighlighted, }) => {
    const dispatch = useDispatch();
    const restoreDeletedPost = () => {
        dispatch({
            type: 'UserChangedChannelPost',
            userAction: {
                kind: 'restore',
            },
            isPostponed: Boolean(isPostponed),
            channelId,
            cmid,
        });
    };
    return (React.createElement(ChannelPostPrimaryHighlightWrapper, { isActive: isHighlighted },
        React.createElement(ChannelPost, { className: cx(className, 'ChannelPostMarkedDeleted') },
            React.createElement(FormattedLangKey, { langkey: "me_channel_post_action_restore_deleted", values: {
                    action: (text) => canRestore ? (React.createElement("button", { className: "ChannelPostMarkedDeleted__restoreBtn", onClick: restoreDeletedPost }, text)) : (React.createElement(React.Fragment, null)),
                } }))));
});
ChannelPostMarkedDeleted.displayName = 'ChannelPostMarkedDeleted';
const ChannelPost = forwardRef(({ className, children, isUnread, maxWidth }, ref) => {
    return (React.createElement("div", { ref: ref, className: cx(className, 'ChannelPost', {
            'ChannelPost--unread': isUnread,
        }), style: {
            '--postMaxWidth': maxWidth && `${maxWidth}px`,
        } }, children));
});
ChannelPost.displayName = 'ChannelPost';
export const ChannelPostMeta = ({ views, sentAt, updatedAt, float, className, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx('ChannelPostMeta', { 'ChannelPostMeta--float': float }, className) },
        views !== undefined && views > 0 && (React.createElement("span", { className: "ChannelPostMeta__views" },
            React.createElement(Icon12View, null),
            lang.formatNumber(views, 'short'))),
        React.createElement("div", { className: "ChannelPostMeta__time" },
            Boolean(updatedAt) && React.createElement("div", null, lang.use('me_message_edited_label')),
            React.createElement(FormattedDate, { timestamp: sentAt, variant: "time" }))));
};
ChannelPostMeta.displayName = 'ChannelPostMeta';
ChannelPostDonutPlaceholder.displayName = 'ChannelPostDonutPlaceholder';
//# sourceMappingURL=ChannelPost.js.map