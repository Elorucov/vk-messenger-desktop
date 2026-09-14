import '../../ui/ConversationsBar/ConversationsBar.css';
import React from 'react';
import { Button } from '@vkontakte/vkui';
import { Icon20Cancel } from '@vkontakte/icons';
import cx from 'classnames';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { ExternalLink } from '../../ui/Link/Link';
export const ConversationsBar = ({ className, conversationBar, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const { icon, title, buttons, text, canHide, name } = conversationBar;
    /**
     * Пока неизвестно какие еще варианты баннеров тут
     * могут быть - поддержим только один известный нам
     */
    if (name !== 'ux_poll_sa_msg') {
        return null;
    }
    const onClose = () => {
        dispatch({
            type: 'UserHideConversationsBar',
            name,
        });
    };
    return (React.createElement("div", { className: cx('ConversationsBar', className) },
        icon && (React.createElement("div", { className: "ConversationsBar__icon" },
            React.createElement("img", { src: icon, alt: title }))),
        React.createElement("div", { className: "ConversationsBar__content" },
            React.createElement("div", { className: "ConversationsBar__title" }, title),
            React.createElement("div", { className: "ConversationsBar__text" }, text),
            buttons.map((button) => {
                return button.type === 'link' && button.link ? (React.createElement(ExternalLink, { target: "_blank", href: button.link, className: "ConversationsBar__link", onClick: button.hideOnAction ? onClose : undefined, key: button.text }, button.text)) : (React.createElement(Button, { mode: button.layout, onClick: button.hideOnAction ? onClose : undefined, key: button.text }, button.text));
            })),
        canHide && (React.createElement(Tooltip, { position: "top", content: lang.use('me_close'), delay: 1000 },
            React.createElement("button", { "aria-label": lang.use('me_close'), className: "ConversationsBar__close", onClick: onClose },
                React.createElement(Icon20Cancel, null))))));
};
//# sourceMappingURL=ConversationsBar.js.map