import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { classNames as cx } from '@vkontakte/vkjs';
import { CallsIconButton } from '../CallsIconButton';
import { useLang } from '../../hooks/useLang';
export const ChatIconButton = ({ unreadCount = 0, onClick, ...restProps }) => {
    const { getLang } = useLang();
    let mod = '';
    let counter = '';
    switch (true) {
        case !unreadCount: {
            mod = 'none';
            break;
        }
        case unreadCount <= 9: {
            mod = 'single';
            counter = unreadCount.toString();
            break;
        }
        case unreadCount <= 99: {
            mod = 'double';
            counter = unreadCount.toString();
            break;
        }
        case unreadCount > 99: {
            mod = 'max';
            counter = '99+';
            break;
        }
    }
    const classNames = cx('ChatIconButton', `ChatIconButton--${mod}`, 'ChatIconButton--withAnimation');
    return (_jsx(CallsIconButton, { tooltip: getLang('calls_chat'), placement: "top-start", onClick: onClick, ...restProps, children: _jsx("div", { className: classNames, children: counter && _jsx("div", { className: "ChatIconButton__count", children: counter }) }) }));
};
//# sourceMappingURL=ChatIconButton.js.map