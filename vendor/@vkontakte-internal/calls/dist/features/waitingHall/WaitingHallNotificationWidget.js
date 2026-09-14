import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useWaitingHallNotificationModel, WaitingHallNotificationProvider, } from './WaitingHallNotificationModel';
import { WaitingHallBanner } from './components';
const WaitingHallNotification = observer(function WaitingHallNotification() {
    const { forbidSingle, namesList, promoteSingle, resetWaitingHallHasNew, showParticipants, totalCount } = useWaitingHallNotificationModel();
    return (_jsx(WaitingHallBanner, { onClickForbid: forbidSingle, onClickPromote: promoteSingle, onClickShowParticipants: showParticipants, onClose: resetWaitingHallHasNew, names: namesList, totalCount: totalCount }));
});
export const WaitingHallNotificationWidget = createWidget(WaitingHallNotificationProvider, WaitingHallNotification);
//# sourceMappingURL=WaitingHallNotificationWidget.js.map