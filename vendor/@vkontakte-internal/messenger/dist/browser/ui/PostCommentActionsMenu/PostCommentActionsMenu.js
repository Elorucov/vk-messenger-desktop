import { Icon20DeleteOutline, Icon20ReplyOutline, Icon20ReportOutline, Icon20ShareOutline, Icon20WriteOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { ActionsMenu, ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import React, { useMemo } from 'react';
import cx from 'classnames';
import { ContextMenu, } from '../../ui/ContextMenu/ContextMenu';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const PostCommentActionsMenu = ({ className, getIsActionAvailable, onAction, }) => {
    const { lang } = useBrowserEnv();
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        getIsActionAvailable('reply') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ReplyOutline, null), title: lang.use('me_comment_action_reply'), onClick: () => onAction?.('reply'), type: "secondary" })),
        getIsActionAvailable('forward') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ShareOutline, null), title: lang.use('me_comment_action_forward'), onClick: () => onAction?.('forward'), type: "secondary" })),
        getIsActionAvailable('edit') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20WriteOutline, null), title: lang.use('me_comment_action_edit'), onClick: () => onAction?.('edit'), type: "secondary" })),
        getIsActionAvailable('report') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ReportOutline, null), title: lang.use('me_comment_action_report'), onClick: () => onAction?.('report'), type: "danger" })),
        getIsActionAvailable('delete') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DeleteOutline, null), title: lang.use('me_comment_action_delete'), onClick: () => onAction?.('delete'), type: "danger" })),
        getIsActionAvailable('delete_with_reason') && (React.createElement(React.Fragment, null,
            React.createElement(ActionsMenuSeparator, null),
            React.createElement(ActionsMenuAction, { onClick: () => onAction?.('delete_with_reason'), title: lang.use('me_reports_dwr'), "aria-label": lang.use('me_reports_dwr') }))))), [getIsActionAvailable, lang, onAction]);
    return (React.createElement(ActionsMenu, { className: cx('PostCommentActionsMenu', className) }, actionsList));
};
export const PostCommentActionsMenuDropdown = ({ children, parentWrapper, classNames, getToggleOpen, ...actionMenuProps }) => {
    const { isMobileLayout } = useLayoutData();
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    return (React.createElement(React.Fragment, null,
        fastActionsTrigger.button && (React.createElement(Dropdown, { open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, content: React.createElement(PostCommentActionsMenu, { ...actionMenuProps }), ...(isMobileLayout
                ? {
                    align: 'right',
                    position: 'bottom',
                    adaptation: 'horizontal',
                }
                : {
                    align: 'right',
                    adaptation: 'vertical',
                }), portalTarget: parentWrapper, classNames: {
                wrapper: classNames?.wrapper,
                wrapperOpened: 'PostCommentActionsMenuDropdown--opened',
                wrapperClosed: fastActionsTrigger.button === 'tap'
                    ? undefined
                    : 'PostCommentActionsMenuDropdown--closed',
                portal: classNames?.portal,
            }, openType: "click", adaptive: true, hideOnClick: true, hideOnWheel: true, hideOnMouseLeave: true, contentPreventDefault: false }, children)),
        fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { allowNativeContextMenu: true, getToggleOpen: getToggleOpen, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, contentPreventDefault: false, content: React.createElement(PostCommentActionsMenu, { ...actionMenuProps }) }))));
};
//# sourceMappingURL=PostCommentActionsMenu.js.map