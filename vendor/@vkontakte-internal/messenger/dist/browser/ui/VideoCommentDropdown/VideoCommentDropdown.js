import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import '../../ui/VideoCommentDropdown/VideoCommentDropdown.css';
import React, { useCallback } from 'react';
import { Icon16Cancel, Icon20DeleteOutline, Icon20More, Icon20ReportOutline, Icon24CheckCircleOutline, } from '@vkontakte/icons';
import cx from 'classnames';
import { useModal } from '../../hooks/useModal';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { ReportCommentModal } from '../../ui/ReportModal/ReportModal';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { useSnackbar } from '../../hooks/useSnackbar';
export const VideoCommentDropdown = ({ comment, canDelete, canReport, className, videoId, sourceOwnerId, }) => {
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const reportModal = useModal();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const actions = [canDelete, canReport].filter(Boolean);
    const handleDeleteActionClick = useCallback(() => {
        dispatch({
            type: 'UserChangedVideoComment',
            videoId,
            commentCmid: comment.cmid,
            userAction: {
                kind: 'delete',
            },
        });
    }, [dispatch, videoId, comment.cmid]);
    const onReport = useCallback((reasonId) => {
        dispatch({
            type: 'UserChangedVideoComment',
            videoId,
            commentCmid: comment.cmid,
            userAction: {
                kind: 'report',
                reason: reasonId,
                onSuccess: () => {
                    snackbar({
                        message: lang.use('me_video_report_modal_success'),
                        before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                    });
                },
            },
        });
    }, [dispatch, videoId, comment.cmid, snackbar, lang]);
    return (React.createElement("div", { className: cx('VideoCommentDropdown', className) },
        actions.length > 1 ? (React.createElement(Dropdown, { hideOnClick: true, hideOnWheel: true, content: React.createElement(ActionsMenu, null,
                React.createElement(ActionsMenuAction, { onClick: reportModal.open, leftIcon: React.createElement(Icon20ReportOutline, null), title: lang.use('me_video_comment_action_report'), type: "danger" }),
                React.createElement(ActionsMenuAction, { onClick: handleDeleteActionClick, leftIcon: React.createElement(Icon20DeleteOutline, null), title: lang.use('me_video_comment_action_delete'), type: "danger" })), align: "center", position: "bottom", adaptive: true, openType: isMobileLayout ? 'click' : 'hover' },
            React.createElement("button", { className: cx('VideoCommentDropdown__button', !isMobileLayout && 'VideoCommentDropdown__button--hidden'), "aria-label": lang.use('me_actions_more') },
                isMobileLayout && (React.createElement("div", { className: "VideoCommentDropdown__actionTapArea" })),
                React.createElement(Icon20More, null)))) : (React.createElement(React.Fragment, null,
            canReport && (React.createElement(Tooltip, { position: "top", align: "center", content: lang.use('me_video_comment_action_report') },
                React.createElement("button", { onClick: reportModal.open, className: cx('VideoCommentDropdown__button', !isMobileLayout && 'VideoCommentDropdown__button--hidden'), "aria-label": lang.use('me_video_comment_action_report') },
                    React.createElement(Icon20ReportOutline, null)))),
            canDelete && (React.createElement(Tooltip, { position: "top", align: "center", content: lang.use('me_video_comment_action_delete') },
                React.createElement("button", { onClick: handleDeleteActionClick, className: cx('VideoCommentDropdown__button', !isMobileLayout && 'VideoCommentDropdown__button--hidden'), "aria-label": lang.use('me_video_comment_action_delete') },
                    React.createElement(Icon16Cancel, null)))))),
        reportModal.isActive && (React.createElement(ReportCommentModal, { sourceOwnerId: sourceOwnerId, comment: comment, onClose: reportModal.close, onReport: onReport }))));
};
//# sourceMappingURL=VideoCommentDropdown.js.map