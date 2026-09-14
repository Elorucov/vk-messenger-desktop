import { E_ACTION } from '../constants';
import { NotificationType } from '@vkontakte-internal/calls-core';
export function enterToRoomNotification(dispatch, name) {
    dispatch({
        type: E_ACTION.CALL_NOTIFICATION,
        notification: {
            type: NotificationType.ENTER_TO_ROOM,
            data: name,
        },
    });
}
export function exitFromRoomNotification(dispatch) {
    dispatch({
        type: E_ACTION.CALL_NOTIFICATION,
        notification: {
            type: NotificationType.EXIT_FROM_ROOM,
        },
    });
}
export function roomHelpRequestedNotification(dispatch) {
    dispatch({
        type: E_ACTION.CALL_NOTIFICATION,
        notification: {
            type: NotificationType.ROOM_HELP_REQUESTED,
        },
    });
}
export function roomsClosedNotification(dispatch) {
    dispatch({
        type: E_ACTION.CALL_NOTIFICATION,
        notification: {
            type: NotificationType.ROOMS_CLOSED_BY_ADMIN,
        },
    });
}
//# sourceMappingURL=room.js.map