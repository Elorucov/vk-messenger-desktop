import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"dangerouslySetInnerHTML":1}],"div":["global",{"className":1,"dangerouslySetInnerHTML":1}]} */
import { useMemo } from 'react';
import { ClickHouseEventType, modalHasType, ModalType } from '@vkontakte-internal/calls-core';
import { RoomStatusUser } from './RoomStatusUser/RoomStatusUser';
import { RoomStatusAdmin } from './RoomStatusAdmin/RoomStatusAdmin';
import { useTypedDispatch } from '../../../../hooks/useTypedDispatch';
import { DialogConfirm } from '../../../../components/DialogConfirm/DialogConfirm';
import { useLang } from '../../../../hooks/useLang';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { useDratCount } from '../../../../hooks/useDratCount';
import { toggleModal } from '../../../../actions';
import { getCallId, getModal } from '../../../../selectors';
import { RoomStatusTimer } from '../../shared';
import { RoomStatusProvider, useRoomStatusModel } from './RoomStatusModel';
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import styles from './RoomStatus.module.css';
const RoomStatusView = observer(function RoomStatusView() {
    const { getLang } = useLang();
    const dispatch = useTypedDispatch();
    const { myRoom, roomIdToReturn, canChooseRoomAsAdmin, timeLeft, timerWarning, timerFinishedDialog, closeTimerFinishedDialog, sendStats, modalService, onEnterRoom, onRoomRequestHelp, handleCloseRooms, chooseRoom, } = useRoomStatusModel();
    const callId = useTypedSelector(getCallId);
    const dratCount = useDratCount();
    const modal = useTypedSelector(getModal);
    const actions = useMemo(() => {
        const actions = [];
        if (!canChooseRoomAsAdmin) {
            return actions;
        }
        if (dratCount) {
            actions.push({
                text: `${getLang('calls_rooms_admin_requests_for_help')} (${dratCount})`,
                onClick: chooseRoom,
                dataTestId: 'calls_rooms_header_menu_help_requests',
            });
        }
        actions.push({
            text: getLang('calls_rooms_admin_control'),
            onClick: () => {
                dispatch(toggleModal(ModalType.ROOM_CONTROL));
            },
            dataTestId: 'calls_rooms_header_menu_control',
        });
        actions.push({ separator: true });
        actions.push({
            text: getLang('calls_rooms_admin_close_rooms'),
            onClick: () => {
                dispatch(toggleModal(ModalType.ROOM_CONTROL_CLOSE));
            },
            dataTestId: 'calls_rooms_header_menu_close_rooms',
        });
        return actions;
    }, [canChooseRoomAsAdmin, dratCount, getLang]);
    const timerComponent = !!timeLeft && _jsx(RoomStatusTimer, { timeLeft: timeLeft, warning: timerWarning, divider: true });
    return canChooseRoomAsAdmin ? (_jsxs(_Fragment, { children: [modalHasType(modal, ModalType.ROOM_CONTROL_CLOSE) && (_jsx(DialogConfirm, { title: getLang('calls_room_control_close_title'), description: _jsx("span", { dangerouslySetInnerHTML: { __html: getLang('calls_room_control_close_desc') } }), cancelTitle: getLang('calls_room_control_retry_cancel'), submitTitle: getLang('calls_room_control_cancel_submit'), cancelDataTestId: "calls_rooms_close_cancel", submitDataTestId: "calls_rooms_close_submit", submitAppearance: "negative", onClose: modalService.closeModal, onSubmit: handleCloseRooms })), _jsx(RoomStatusAdmin, { room: myRoom, actions: actions, timer: timerComponent }), timerFinishedDialog && (_jsx(DialogConfirm, { onClose: closeTimerFinishedDialog, title: getLang('calls_room_control_timer_finished_admin'), description: _jsx("div", { className: styles.timerFinished, dangerouslySetInnerHTML: {
                        __html: getLang('calls_room_control_timer_finished_admin_description'),
                    } }), cancelTitle: getLang('calls_room_control_retry_cancel'), submitTitle: getLang('calls_rooms_admin_close_rooms'), cancelDataTestId: "calls_rooms_close_cancel", submitDataTestId: "calls_rooms_close_submit", onSubmit: () => {
                    sendStats(ClickHouseEventType.SESSION_ROOMS_CLOSED_USING_TIMER, { session_id: callId });
                    handleCloseRooms();
                }, submitAppearance: "negative" }))] })) : (_jsx(RoomStatusUser, { room: myRoom, roomIdToEnter: roomIdToReturn, onRoomRequestHelp: onRoomRequestHelp, onEnterRoom: onEnterRoom, timer: timerComponent }));
});
export const RoomStatusWidget = createWidget(RoomStatusProvider, RoomStatusView);
//# sourceMappingURL=RoomStatus.js.map