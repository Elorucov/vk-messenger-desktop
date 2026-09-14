import React, { useCallback, useMemo, useState } from 'react';
import { ActionsMenu, ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { useBrowserEnv, useChannel, useChannelsConfig, useDispatch, useViewer, } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import * as Channel from '../../../core/model/Channel';
import { Icon20AdvertisingOutline, Icon20CopyOutline, Icon20CommentDisableOutline, Icon20CommentOutline, Icon20DeleteOutline, Icon20ReportOutline, Icon20ShareOutline, Icon20WriteOutline, Icon28CopyOutline, Icon24SendOutline, Icon20RecentOutline, Icon20Chain, } from '@vkontakte/icons';
import cx from 'classnames';
import { CommonCopySelectionAction } from '../../ui/MessageActionsMenu/CommonCopySelectionAction';
import { CommonCopyMessageTextAction } from '../../ui/MessageActionsMenu/CommonCopyMessageTextAction';
import { MessageReactionPickerExtended } from '../../ui/MessageReactionPickerExtended/MessageReactionPickerExtended';
import { MessageReactionPickerExpandableContainer } from '../../ui/MessageReactionPickerExpandableContainer/MessageReactionPickerExpandableContainer';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import * as Post from '../../../core/model/Post';
import { CopyText } from '../../ui/CopyText/CopyText';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ExternalLink } from '../../ui/Link/Link';
import { canDeleteChannelPostWithReason, canGeoBlock, canMarkPostAsFakeNews, } from '../../utils/moderation';
export const ChannelPostActionsMenu = ({ className, canDelete, canEdit, erid, eridUrl, canPostComments, canChangeCommentsPosting, isOpened: isActionsMenuOpened, post, postReactions, canForward, isCommunityChannel, onDelete, onEdit, onReport, onCopy, onReactionClick, onForward, onChangeCanPostComments, onSend, onEditSendTime, onReactionPickerHeightChange, }) => {
    const snackbar = useSnackbar();
    const dispatch = useDispatch();
    const { lang, contentManagement } = useBrowserEnv();
    const { settings } = useViewer();
    const { isMobileLayout } = useLayoutData();
    const [isReactionPickerExtended, setReactionPickerExtended] = useState(settings.autoExtendReactionPicker);
    const onCopyErid = useCallback(() => {
        snackbar({
            message: lang.use('me_channel_post_erid_copied_snackbar'),
            before: (React.createElement(Icon28CopyOutline, { className: "ChannelPostActionsMenu__copyNotification" })),
        });
    }, [lang, snackbar]);
    const { contentOptions, moderatorMarkFakeNewsRightCsrfHash } = useChannelsConfig();
    const isPostFakeNews = post.kind === 'Normal' && post.fakeNews;
    const channel = useChannel(post.channelId);
    const isAdmin = channel?.kind === 'Channel' ? Channel.canAdmin(channel) : false;
    const handleAction = useCallback((userAction) => {
        switch (userAction) {
            case 'report': {
                onReport();
                break;
            }
            case 'delete': {
                onDelete();
                break;
            }
            case 'edit': {
                onEdit();
                break;
            }
            case 'forward': {
                if (post.kind === 'Normal') {
                    onForward?.(post);
                }
                break;
            }
            case 'enable_comments':
            case 'disable_comments': {
                onChangeCanPostComments(userAction);
                break;
            }
            case 'copy': {
                onCopy();
                break;
            }
            case 'send': {
                onSend?.();
                break;
            }
            case 'editSendTime': {
                onEditSendTime?.();
                break;
            }
            case 'delete_with_reason':
                contentManagement?.deleteWithReason({
                    objectType: 14 /* IContentManagement.ObjectType.CommunityChannelPost */,
                    objectId: post.cmid,
                    objectOwnerId: post.channelId,
                });
                break;
            case 'geo_block':
                contentManagement?.geoBlockChannelPost({
                    objectId: post.cmid,
                    objectOwnerId: post.channelId,
                });
                break;
            case 'set_fake_news_mark':
            case 'unset_fake_news_mark':
                if (!contentManagement) {
                    return;
                }
                const isFakeNews = userAction === 'set_fake_news_mark';
                if (contentManagement.markPostAsFakeNews &&
                    moderatorMarkFakeNewsRightCsrfHash) {
                    dispatch({
                        type: 'ChannelsMarkPostAsFake',
                        isFakeNews,
                        cmid: post.cmid,
                        channelId: post.channelId,
                    });
                    contentManagement.markPostAsFakeNews({
                        objectId: post.cmid,
                        objectOwnerId: post.channelId,
                        isFakeNews,
                        moderatorCsrfHash: moderatorMarkFakeNewsRightCsrfHash,
                        onFail: () => {
                            dispatch({
                                type: 'ChannelsMarkPostAsFake',
                                isFakeNews: !isFakeNews,
                                cmid: post.cmid,
                                channelId: post.channelId,
                            });
                        },
                    });
                }
                break;
            default:
                exhaustivenessCheck(userAction);
        }
    }, [
        onReport,
        onDelete,
        onEdit,
        dispatch,
        post,
        onForward,
        onChangeCanPostComments,
        onCopy,
        onSend,
        onEditSendTime,
        contentManagement,
        moderatorMarkFakeNewsRightCsrfHash,
    ]);
    const handleReactionPickerExtend = useCallback(() => {
        setReactionPickerExtended(true);
    }, [setReactionPickerExtended]);
    const isReactionsAvailable = postReactions && postReactions.size > 0 && Post.isReactionsAvailable(post);
    const isModerator = isCommunityChannel &&
        contentManagement &&
        (canDeleteChannelPostWithReason(contentOptions) ||
            canGeoBlock(contentOptions) ||
            canMarkPostAsFakeNews(contentOptions));
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        post.kind === 'Postponed' && onSend && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon24SendOutline, { width: 20, height: 20 }), title: lang.use('me_channel_postponed_action_send'), onClick: () => handleAction('send'), type: "secondary" })),
        post.kind === 'Postponed' && onEditSendTime && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20RecentOutline, null), title: lang.use('me_channel_postponed_action_time'), onClick: () => handleAction('editSendTime'), type: "secondary" })),
        canForward && onForward && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ShareOutline, null), title: lang.use('me_message_action_forward'), onClick: () => handleAction('forward'), type: "secondary" })),
        canEdit && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20WriteOutline, null), title: lang.use('me_channel_post_action_edit'), onClick: () => handleAction('edit'), type: "secondary" })),
        canChangeCommentsPosting &&
            post.kind !== 'Postponed' &&
            (canPostComments ? (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20CommentDisableOutline, null), title: lang.use('me_channel_post_action_disable_comments'), onClick: () => handleAction('disable_comments'), type: "secondary" })) : (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20CommentOutline, null), title: lang.use('me_channel_post_action_enable_comments'), onClick: () => handleAction('enable_comments'), type: "secondary" }))),
        React.createElement(CommonCopySelectionAction, null),
        React.createElement(CommonCopyMessageTextAction, { chunks: post.chunks }),
        React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20Chain, null), title: lang.use('me_copy_post_url_action'), onClick: () => handleAction('copy'), type: "secondary" }),
        post.kind !== 'Postponed' && !isAdmin && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ReportOutline, null), title: lang.use('me_channel_post_action_spam'), onClick: () => handleAction('report'), type: "danger" })),
        canDelete && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DeleteOutline, null), title: lang.use('me_channel_post_action_delete'), onClick: () => handleAction('delete'), type: "danger" })),
        (eridUrl || erid) && React.createElement(ActionsMenuSeparator, null),
        eridUrl && (React.createElement(ExternalLink, { className: "ChannelPostActionsMenu__link", stopPropagation: false, href: eridUrl },
            React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20AdvertisingOutline, null), title: lang.use('me_channel_post_action_about_erid') }))),
        erid && (React.createElement(CopyText, { text: erid, stopPropagation: false, onCopyDone: onCopyErid },
            React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20CopyOutline, null), title: lang.use('me_channel_post_action_copy_erid', {
                    values: {
                        erid,
                    },
                }) }))),
        isModerator && (React.createElement(React.Fragment, null,
            React.createElement(ActionsMenuSeparator, null),
            canGeoBlock(contentOptions) && (React.createElement(ActionsMenuAction, { onClick: () => handleAction('geo_block'), title: lang.use('me_reports_gb'), "aria-label": lang.use('me_reports_gb') })),
            canDeleteChannelPostWithReason(contentOptions) && (React.createElement(ActionsMenuAction, { onClick: () => handleAction('delete_with_reason'), title: lang.use('me_reports_dwr'), "aria-label": lang.use('me_reports_dwr') })),
            canMarkPostAsFakeNews(contentOptions) && (React.createElement(React.Fragment, null, isPostFakeNews ? (React.createElement(ActionsMenuAction, { onClick: () => handleAction('unset_fake_news_mark'), title: lang.use('me_reports_unset_fake_news_mark') })) : (React.createElement(ActionsMenuAction, { onClick: () => handleAction('set_fake_news_mark'), title: lang.use('me_reports_set_fake_news_mark') })))))))), [
        isPostFakeNews,
        canChangeCommentsPosting,
        canDelete,
        canEdit,
        canForward,
        canPostComments,
        erid,
        eridUrl,
        handleAction,
        lang,
        onEditSendTime,
        onSend,
        onCopyErid,
        onForward,
        post.chunks,
        post.kind,
        contentOptions,
        isModerator,
        isAdmin,
    ]);
    const reactions = useMemo(() => {
        if (!postReactions) {
            return null;
        }
        if (isCommunityChannel) {
            // Для новых каналов реакции сортировать не требуется
            return [...postReactions.values()];
        }
        else {
            return [...postReactions.values()].sort((a, b) => a.id - b.id);
        }
    }, [postReactions, isCommunityChannel]);
    return (React.createElement("div", { className: cx('ChannelPostActionsContent__wrapper', {
            'ChannelPostActionsContent__wrapper--withReactions': isReactionsAvailable,
            'ChannelPostActionsContent__wrapper--mobile': isMobileLayout,
        }) },
        React.createElement(MessageReactionPickerExpandableContainer, { isVisible: isActionsMenuOpened, isCentered: isMobileLayout, onReactionPickerHeightChange: onReactionPickerHeightChange, content: ({ width, onHeightChange }) => {
                if (reactions && isReactionsAvailable) {
                    const active = post.kind === 'Normal' ? post.reactionId : undefined;
                    return (React.createElement(MessageReactionPickerExtended, { width: width, isVisible: isActionsMenuOpened, isExtended: isReactionPickerExtended, reactions: reactions, onClick: onReactionClick, active: active, onHeightChange: onHeightChange, onExtendClick: handleReactionPickerExtend }));
                }
                return null;
            } }),
        React.createElement(ActionsMenu, { className: className }, actionsList)));
};
//# sourceMappingURL=ChannelPostActionsMenu.js.map