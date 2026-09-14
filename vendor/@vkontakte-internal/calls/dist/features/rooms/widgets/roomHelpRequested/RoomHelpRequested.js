import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"dangerouslySetInnerHTML":1}]} */
import { escape } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { useCloseModal } from '../../../../hooks/useCloseModal';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { DialogConfirm } from '../../../../components/DialogConfirm/DialogConfirm';
import { findRelatedRoom } from '../../../../features/rooms';
import { useLang } from '../../../../hooks/useLang';
import { getParticipants } from '../../../../selectors';
import { RoomHelpRequestedProvider, useRoomHelpRequestedModel } from './RoomHelpRequestedModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
const RoomHelpRequestedView = observer(function RoomHelpRequestedView() {
    const { getLang, langReplace } = useLang();
    const { rooms, externalId, roomHandlersService } = useRoomHelpRequestedModel();
    const participants = useTypedSelector(getParticipants);
    const participant = participants[externalId.id];
    const room = findRelatedRoom(externalId, rooms);
    const onClose = useCloseModal();
    if (room && participant) {
        const onSubmit = () => {
            roomHandlersService.switchRoom(room.id, false, onClose);
        };
        return (_jsx(DialogConfirm, { title: getLang('calls_room_request_help_title'), description: _jsx("span", { dangerouslySetInnerHTML: {
                    __html: langReplace(getLang('calls_room_request_help_desc'), {
                        name: escape(participant.name),
                        roomName: escape(room.name),
                    }),
                } }), cancelTitle: getLang('calls_room_request_help_cancel'), submitTitle: getLang('calls_room_request_help_submit'), cancelDataTestId: "calls_room_request_help_cancel", submitDataTestId: "calls_room_request_help_submit", onClose: onClose, onSubmit: onSubmit }));
    }
    return _jsx(_Fragment, {});
});
export const RoomHelpRequestedWidget = createWidget(RoomHelpRequestedProvider, RoomHelpRequestedView);
//# sourceMappingURL=RoomHelpRequested.js.map