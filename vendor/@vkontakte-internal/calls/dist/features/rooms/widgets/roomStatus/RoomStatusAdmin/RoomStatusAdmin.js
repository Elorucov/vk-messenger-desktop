import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"Icon20UserSquareOnSquareOutline":["@vkontakte/icons",{"className":1}]} */
import { Icon16Dropdown, Icon20UserSquareOnSquareOutline } from '@vkontakte/icons';
import { useLang } from '../../../../../hooks/useLang';
import { CallsDropdown } from '../../../../../components/CallsDropdown/CallsDropdown';
import { useState } from 'react';
import { shift } from '@floating-ui/core';
import styles from './RoomStatusAdmin.module.css';
const customMiddlewares = [shift({ mainAxis: true, padding: 10 })];
/** компонент для показа статуса cессионных залов */
export function RoomStatusAdmin({ actions, room, timer }) {
    const { getLang } = useLang();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const roomName = (_jsxs("div", { className: styles.roomName, children: [_jsx(Icon20UserSquareOnSquareOutline, { className: styles.roomIcon }), room ? room.name : getLang('calls_rooms_main_title'), timer] }));
    return (_jsx(CallsDropdown, { className: "Participant__Dropdown", items: actions, open: isDropdownOpen, setOpen: setIsDropdownOpen, placement: "bottom-end", customMiddlewares: customMiddlewares, children: _jsxs("div", { className: styles.room, "data-testid": "calls_rooms_header_menu", children: [roomName, _jsx(Icon16Dropdown, { "aria-label": getLang('calls_actions') })] }) }));
}
//# sourceMappingURL=RoomStatusAdmin.js.map