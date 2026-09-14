import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}],"Icon20UserSquareOnSquareOutline":["@vkontakte/icons",{"className":1}],"Link":["@vkontakte-internal/vkcom-kit",{"className":2}]} */
import { Link } from '@vkontakte-internal/vkcom-kit';
import { Icon20UserSquareOnSquareOutline } from '@vkontakte/icons';
import { useLang } from '../../../../../hooks/useLang';
import styles from './RoomStatusUser.module.css';
/** компонент для показа статуса cессионных залов */
export function RoomStatusUser({ onEnterRoom, onRoomRequestHelp, room, roomIdToEnter, timer, }) {
    const { getLang } = useLang();
    const roomName = (_jsxs("div", { className: styles.roomName, children: [_jsx(Icon20UserSquareOnSquareOutline, { className: styles.roomIcon }), room ? room.name : getLang('calls_rooms_main_title'), timer] }));
    // В зале
    if (room) {
        return (_jsxs("div", { className: styles.room, children: [roomName, _jsx(Link, { onClick: onRoomRequestHelp, className: styles.roomLink, children: getLang('calls_rooms_request_help') })] }));
    }
    // В основном зале
    if (roomIdToEnter || !room) {
        return (_jsxs("div", { className: styles.room, children: [roomName, _jsx(Link, { onClick: onEnterRoom, className: styles.roomLink, children: getLang('calls_rooms_return_to_room') })] }));
    }
    return null;
}
//# sourceMappingURL=RoomStatusUser.js.map