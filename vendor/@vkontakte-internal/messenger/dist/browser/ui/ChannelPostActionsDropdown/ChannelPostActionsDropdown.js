import '../../ui/ChannelPostActionsDropdown/ChannelPostActionsDropdown.css';
import React, { memo, useMemo, useRef, useCallback } from 'react';
import * as Viewer from '../../../core/model/Viewer';
import { ChannelPostActionsMenu } from './ChannelPostActionsMenu';
import { MessageActionsButtonMore, MessageActionsButton, FastForwardMessageActionButton, } from '../../ui/MessageActionsButton/MessageActionsButton';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useModal } from '../../hooks/useModal';
import { DeleteChannelPostModal } from '../../ui/DeleteChannelPostModal/DeleteChannelPostModal';
import { useBrowserEnv, useDispatch, useViewer } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { ReportChannelPostModal } from '../../ui/ReportModal/ReportModal';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon28CopyOutline } from '@vkontakte/icons';
import { copyTextToClipboard } from '@vkontakte/vkjs';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const ChannelPostActionsDropdown = memo(({ classNames, channelId, post, postCmid, canDelete, canEdit, isChannelArchived, parentWrapper, containerElement, postReactions, onReactionClick, isRepostsDisabled, onForward, canPostComments, isPostponed, isCommunityChannel, canChangeCommentsPosting, onSend, onEditSendTime, }) => {
    const { isMobileLayout } = useLayoutData();
    const { profileType } = useViewer();
    const { router, vkDomain } = useBrowserEnv();
    const { lang } = useBrowserEnv();
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const reportModal = useModal();
    const deleteModal = useModal();
    const dispatch = useDispatch();
    const { screenRoute, replace } = useRouter();
    const snackbar = useSnackbar();
    const startEditing = () => {
        dispatch({
            type: 'UserChangedChannelComposerDraft',
            kind: 'editing',
            channelId,
            editing: post,
        });
        /** Возвращаем юзера на экран истории канала, чтобы он перешел к редактированию поста в композере */
        if (screenRoute.kind === 'ChannelRoute' &&
            screenRoute.postCmid !== undefined &&
            screenRoute.commentCmid !== undefined) {
            replace({
                ...screenRoute,
                commentCmid: undefined,
            });
        }
    };
    const handleChangeCanPostComments = (action) => {
        dispatch({
            type: 'UserChangedChannelPost',
            userAction: {
                kind: action,
            },
            isPostponed,
            channelId,
            cmid: postCmid,
        });
    };
    const className = isMobileLayout
        ? 'ChannelPostActionsDropdown__menu--bottom'
        : 'ChannelPostActionsDropdown__menu--side';
    const copyUrl = useMemo(() => {
        if (Viewer.isEdu(profileType)) {
            return (router.toUrl({
                kind: 'SferumChannelProxyRoute',
                channelId: post.channelId,
                postCmid: post.cmid,
            }) || '');
        }
        if (isCommunityChannel) {
            const urlParams = new URLSearchParams({ cmid: String(post.cmid) });
            if (post.kind === 'Postponed') {
                urlParams.append('postponed', 'true');
            }
            return `https://${vkDomain}/im/channels/${post.channelId}?${urlParams.toString()}`;
        }
        return `https://${vkDomain}/wall${post.channelId}_${post.cmid}`;
    }, [
        profileType,
        post.channelId,
        post.cmid,
        post.kind,
        vkDomain,
        router,
        isCommunityChannel,
    ]);
    const handleCopy = () => {
        copyTextToClipboard(copyUrl).then(() => {
            snackbar({
                message: lang.use('me_channel_post_link_copied_snackbar'),
                before: (React.createElement(Icon28CopyOutline, { className: "ChannelPostActionsMenu__copyNotification" })),
            });
        });
    };
    const dropdownHandleRef = useRef();
    const onReactionPickerHeightChange = useCallback((value) => {
        if (isMobileLayout) {
            return;
        }
        // Т.к. реакции спозиционированы абсолютно, задаём отрицательный отступ
        // от верхней границы основного контента.
        dropdownHandleRef.current?.setVerticalShift(-Math.abs(value));
    }, [isMobileLayout, dropdownHandleRef]);
    return (React.createElement(React.Fragment, null,
        fastActionsTrigger.button && (React.createElement(Dropdown, { handleRef: dropdownHandleRef, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, content: React.createElement(ChannelPostActionsMenu, { post: post, onCopy: handleCopy, canForward: !isRepostsDisabled, postReactions: postReactions, onReactionClick: onReactionClick, className: className, canDelete: canDelete && !isChannelArchived, canEdit: canEdit && !isChannelArchived, canPostComments: canPostComments, canChangeCommentsPosting: canChangeCommentsPosting, onEdit: startEditing, onSend: onSend, onEditSendTime: onEditSendTime, onChangeCanPostComments: handleChangeCanPostComments, onDelete: deleteModal.open, onReport: reportModal.open, onForward: onForward, erid: post.ads.erid, eridUrl: post.ads.eridUrl, isOpened: isDropdownFastActionsOpened, isCommunityChannel: isCommunityChannel, onReactionPickerHeightChange: onReactionPickerHeightChange }), ...(isMobileLayout
                ? {
                    align: 'right',
                    position: 'bottom',
                    adaptation: 'horizontal',
                }
                : {
                    align: 'center',
                    position: 'right',
                    adaptation: 'vertical',
                }), portalTarget: parentWrapper, classNames: {
                wrapper: classNames?.wrapper,
                wrapperOpened: 'ChannelPostActionsDropdown--opened',
                wrapperClosed: fastActionsTrigger.button === 'tap'
                    ? undefined
                    : 'ChannelPostActionsDropdown--closed',
                portal: classNames?.portal,
            }, openType: "click", adaptive: true, hideOnClick: true, hideOnWheel: true, hideOnMouseLeave: true, contentPreventDefault: false },
            React.createElement(MessageActionsButton, null,
                React.createElement(MessageActionsButtonMore, { isTap: fastActionsTrigger.button === 'tap' }),
                !isRepostsDisabled && onForward && post.kind === 'Normal' && (React.createElement(FastForwardMessageActionButton, { onClick: (e) => {
                        e.stopPropagation();
                        onForward(post);
                    } }))))),
        fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { allowNativeContextMenu: true, ref: { current: containerElement }, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, contentPreventDefault: false, content: React.createElement(ChannelPostActionsMenu, { post: post, onSend: onSend, onCopy: handleCopy, canForward: !isRepostsDisabled, postReactions: postReactions, onReactionClick: onReactionClick, canDelete: canDelete && !isChannelArchived, canEdit: canEdit && !isChannelArchived, canPostComments: canPostComments, canChangeCommentsPosting: canChangeCommentsPosting, onEdit: startEditing, onForward: onForward, onEditSendTime: onEditSendTime, onChangeCanPostComments: handleChangeCanPostComments, onDelete: deleteModal.open, onReport: reportModal.open, erid: post.ads.erid, eridUrl: post.ads.eridUrl, isOpened: isContextMenuFastActionsOpened, isCommunityChannel: isCommunityChannel }) })),
        reportModal.isActive && post.kind === 'Normal' && (React.createElement(ReportChannelPostModal, { post: post, onClose: reportModal.close, isCommunityChannel: isCommunityChannel })),
        deleteModal.isActive && (React.createElement(DeleteChannelPostModal, { ownerId: channelId, postCmid: postCmid, isPostponed: post.kind === 'Postponed', handleModalClose: deleteModal.close }))));
});
//# sourceMappingURL=ChannelPostActionsDropdown.js.map