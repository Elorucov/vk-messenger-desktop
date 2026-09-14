import { jsx as _jsx } from "react/jsx-runtime";
import { useCloseModal } from '../../../../hooks/useCloseModal';
import { roomHelpRequestedNotification } from '../../../../actions/room';
import { RoomRequestHelpModal } from './RoomRequestHelpModal';
import { useTypedDispatch } from '../../../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { getMyDevice } from '../../../../selectors';
import { ClickHouseEventType, useSendStatsService } from '../../../../stats/clickHouse';
import { createSdkParticipantState } from '../../../../helpers/participant';
import { setLocalDratState } from '../../../../actions';
import { changeParticipantState } from '@vkontakte/calls-sdk';
export const RoomRequestHelp = () => {
    const sendStats = useSendStatsService();
    const dispatch = useTypedDispatch();
    const onCloseModal = useCloseModal();
    const { statusData } = useTypedSelector(getMyDevice);
    const handleRequestHelp = () => {
        changeParticipantState(createSdkParticipantState(statusData, {
            drat: true,
        }));
        dispatch(setLocalDratState(statusData, true));
        roomHelpRequestedNotification(dispatch);
        onCloseModal();
        sendStats(ClickHouseEventType.SESSION_ROOMS_ASK_FOR_HELP);
    };
    return _jsx(RoomRequestHelpModal, { onClick: handleRequestHelp });
};
//# sourceMappingURL=RoomRequestHelp.js.map