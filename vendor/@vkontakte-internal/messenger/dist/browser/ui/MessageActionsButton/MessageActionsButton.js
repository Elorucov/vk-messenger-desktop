import { Icon16MoreHorizontal, Icon16PenOutline, Icon16ReplyOutline, Icon16ShareOutline, } from '@vkontakte/icons';
import React from 'react';
import cx from 'classnames';
import '../../ui/MessageActionsButton/MessageActionsButton.css';
import { useBrowserEnv } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { usePerformanceSettings } from '../../hooks/usePerformanceSettings';
export const MessageActionsButton = React.forwardRef(({ containerClassName, children }, forwardedRef) => {
    const { isMobileLayout } = useLayoutData();
    return (React.createElement("div", { className: cx('MessageActionsButtonContainer', containerClassName, {
            'MessageActionsButtonContainer--tappable': isMobileLayout,
        }) },
        React.createElement("div", { className: "MessageActionsButtonWrapper", ref: forwardedRef }, children)));
});
export const MessageActionsButtonMore = ({ isTap, }) => {
    const { lang } = useBrowserEnv();
    const { enableAnimations } = usePerformanceSettings();
    return (React.createElement("button", { type: "button", "aria-label": lang.use('me_message_actions_button'), className: cx('MessageActionsButton', {
            'MessageActionsButton--animated': enableAnimations,
            'MessageActionsButton--tap': isTap,
        }) },
        React.createElement(Icon16MoreHorizontal, null),
        isTap && React.createElement("div", { className: "MessageActionsButton--tapArea" })));
};
export const FastReplyMessageActionButton = (props) => {
    const { onClick } = props;
    const { lang } = useBrowserEnv();
    return (React.createElement("button", { className: "MessageActionsButton", "aria-label": lang.use('me_message_action_reply'), onClick: onClick },
        React.createElement(Icon16ReplyOutline, null)));
};
export const FastEditMessageActionButton = (props) => {
    const { onClick } = props;
    const { lang } = useBrowserEnv();
    return (React.createElement("button", { className: "MessageActionsButton", "aria-label": lang.use('me_message_action_edit'), onClick: onClick },
        React.createElement(Icon16PenOutline, null)));
};
export const FastForwardMessageActionButton = (props) => {
    const { onClick } = props;
    const { lang } = useBrowserEnv();
    return (React.createElement("button", { className: "MessageActionsButton", "aria-label": lang.use('me_message_action_forward'), onClick: onClick },
        React.createElement(Icon16ShareOutline, null)));
};
//# sourceMappingURL=MessageActionsButton.js.map