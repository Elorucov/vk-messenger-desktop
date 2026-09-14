import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":4}],"Icon16MoreVertical":["@vkontakte/icons",{"className":1}]} */
import { memo, useState } from 'react';
import { DropdownActionSheet, TextTooltip, IconButton, Link, Cell, Counter, } from '@vkontakte-internal/vkcom-kit';
import { ROOM_MAIN_ID } from '@vkontakte-internal/calls-core';
import { Icon16MoreVertical } from '@vkontakte/icons';
import { TOOLTIP_DELAY } from '../../../../../../constants';
import { useLang } from '../../../../../../hooks/useLang';
import styles from './RoomsListItem.module.css';
const RoomsListItemComponent = ({ roomId, roomName, countInRoom, isRoomsActivated, actionsMore, onRoomChoose, onSwitchRoom, setRoomIdOfDropdown, }) => {
    const { getLang } = useLang();
    const [showOptions, setShowOptions] = useState(false);
    const counter = !!countInRoom && (_jsx("div", { className: styles.counter, "data-testid": "calls_rooms_control_room_counter", children: _jsx(Counter, { size: "s", children: countInRoom }) }));
    const renderAfter = () => {
        const items = [];
        if (isRoomsActivated) {
            items.push(_jsx(Link, { onClick: () => onSwitchRoom(roomId), "data-testid": "calls_rooms_control_room_enter", children: getLang('calls_room_control_rooms_enter') }, `room_${roomId}_enter`));
        }
        else {
            items.push(_jsx(DropdownActionSheet, { trigger: "click", placement: "bottom-end", offsetByMainAxis: -5, content: _jsx(_Fragment, { children: actionsMore
                        .filter((action) => !action.option || showOptions)
                        .map((action, i) => (_jsx(DropdownActionSheet.Item, { "data-testid": action.dataTestId, before: action.before, keepOpen: action.autoCloseDisabled, onClick: (e) => {
                            e.stopPropagation();
                            action?.handleClick?.(roomId, roomName);
                            if (action.autoCloseDisabled) {
                                setShowOptions(!showOptions);
                            }
                        }, after: action.after, children: action.text }, `room_${roomId}_act_${i}`))) }), children: _jsx(IconButton, { hasHover: false, hasActive: false, "data-testid": "calls_rooms_control_room_menu", onClick: (e) => {
                        e.stopPropagation();
                        roomId && setRoomIdOfDropdown?.(roomId);
                    }, children: _jsx(TextTooltip, { text: getLang('calls_room_control_rooms_tooltip_more'), placement: "top", usePortal: true, offsetByMainAxis: -5, hoverDelay: TOOLTIP_DELAY, children: _jsx(Icon16MoreVertical, { className: styles.icon }) }) }) }));
        }
        return (_jsxs(_Fragment, { children: [counter, items] }));
    };
    return (_jsx("div", { className: styles.roomItem, "data-testid": `calls_rooms_control_room_${roomId}`, children: _jsx(Cell, { onClick: () => onRoomChoose(roomId), after: roomId !== ROOM_MAIN_ID ? renderAfter() : counter, children: _jsx("div", { className: styles.nameWrapper, children: _jsx("div", { className: styles.roomName, children: roomName }) }) }, `room_item_${roomId}`) }));
};
export const RoomsListItem = memo(RoomsListItemComponent);
//# sourceMappingURL=RoomsListItem.js.map