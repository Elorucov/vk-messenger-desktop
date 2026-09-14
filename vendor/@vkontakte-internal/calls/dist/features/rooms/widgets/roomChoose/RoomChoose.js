import { jsx as _jsx } from "react/jsx-runtime";
import { Button, Separator, SimpleCell } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../../hooks/useLang';
import { RoomChooseProvider, useRoomChooseModel } from './RoomChooseModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { CallsModal } from '../../../../components/CallsModal';
import styles from './RoomChoose.module.css';
const RoomChooseView = observer(function RoomChooseView() {
    const { getLang } = useLang();
    const { roomsArray, participantIdsByRoomIdMap, switchRoom, roomIdsWithDrat, isHelpMode, modalService } = useRoomChooseModel();
    // todo Кажется компонент всегда работает в режиме isHelpMode, уточнить у Лехи/Андрея
    const title = isHelpMode
        ? getLang('calls_rooms_admin_requests_for_help')
        : getLang('calls_rooms_choose_title');
    const items = [];
    for (let i = 0; i < roomsArray.length; i++) {
        const room = roomsArray[i];
        const count = participantIdsByRoomIdMap[room.id]?.length ?? 0;
        if (!room.active || (isHelpMode && !roomIdsWithDrat.has(room.id))) {
            continue;
        }
        items.push(_jsx(SimpleCell, { hasActive: false, hasHover: false, subtitle: `${count} ${getLang('calls_rooms_members', count)}`, after: _jsx(Button, { size: "m", onClick: () => switchRoom(room.id), mode: "secondary", children: getLang('calls_rooms_return_to_room') }), children: room.name }, `room_${room.id}`));
        if (i !== roomsArray.length - 1) {
            items.push(_jsx(Separator, {}, `sep_room_${room.id}`));
        }
    }
    return (_jsx(CallsModal, { className: styles.modal, onClose: modalService.closeModal, title: title, hasScroll: false, actionButtons: _jsx(Button, { size: "m", onClick: () => modalService.closeModal(), mode: "tertiary", children: getLang('calls_cancel') }), children: items }));
});
export const RoomChooseWidget = createWidget(RoomChooseProvider, RoomChooseView);
//# sourceMappingURL=RoomChoose.js.map