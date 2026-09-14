import React, { useCallback, useEffect, useState } from 'react';
import '../../ui/VKNotifications/VKNotifications.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon20Cancel } from '@vkontakte/icons';
import cx from 'classnames';
export const VKNotifications = ({ peerId, className }) => {
    const [notifications, setNotifications] = useState([]);
    const { botKeyboard } = useBrowserEnv();
    const removeNotification = useCallback((id) => {
        setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
    }, []);
    useEffect(() => {
        const unsubscribe = botKeyboard.subscribe((event) => {
            if (event.type === 'show_snackbar' && event.peerId === peerId) {
                if (botKeyboard.openSnackbar) {
                    botKeyboard.openSnackbar(event);
                }
                else {
                    setNotifications((prevNotifications) => [
                        ...prevNotifications.slice(-1),
                        { ...event },
                    ]);
                }
            }
        });
        return () => unsubscribe();
    }, [botKeyboard, peerId]);
    return (React.createElement(TransitionGroup, { className: cx('VKNotifications', className) }, notifications.map(({ id, text }) => (React.createElement(CSSTransition, { key: id, timeout: 300, classNames: "VKNotifications__item" },
        React.createElement(VKNotification, { text: text, id: id, removeNotification: removeNotification }))))));
};
const VKNotification = ({ id, text, removeNotification }) => {
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            removeNotification(id);
        }, timeToHide);
        return () => clearTimeout(timeoutId);
    }, [removeNotification, id]);
    return (React.createElement("div", { className: "VKNotifications__notification" },
        React.createElement("div", null, text),
        React.createElement("div", { className: "VKNotifications__close-button", onClick: () => removeNotification(id) },
            React.createElement(Icon20Cancel, null))));
};
const timeToHide = 5000;
//# sourceMappingURL=VKNotifications.js.map