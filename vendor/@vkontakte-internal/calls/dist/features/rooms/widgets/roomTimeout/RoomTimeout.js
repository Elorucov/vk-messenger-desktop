import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { RoomTimeoutProvider, useRoomTimeoutModel } from './RoomTimeoutModel';
import { BaseModal } from '../../../../components/BaseModal/BaseModal';
import { Icon56StopwatchOutline } from '@vkontakte/icons';
import { Button, getColorClass, Spacing, Title, Text, Flex } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../../hooks/useLang';
import styles from './RoomTimeout.module.css';
const RoomTimeoutView = observer(function RoomTimeoutView() {
    const { getLang } = useLang();
    const { canChooseRoomAsAdmin, handleSubmit, modalService } = useRoomTimeoutModel();
    const descriptionText = canChooseRoomAsAdmin
        ? getLang('calls_room_timeout_modal_description_can_leave')
        : getLang('calls_room_timeout_modal_description_cannot_leave');
    const actionButtonText = canChooseRoomAsAdmin
        ? getLang('calls_room_timeout_leave_action')
        : getLang('calls_room_control_cancel_submit');
    return (_jsx(BaseModal, { className: styles.modal, onClose: () => modalService.closeModal(), enableCrossButton: true, disableBodyScroll: true, children: _jsxs(Flex, { direction: "column", align: "center", className: styles.wrap, children: [_jsx(Icon56StopwatchOutline, { className: getColorClass('color_icon_accent') }), _jsx(Spacing, { size: 26 }), _jsx(Title, { level: "2", weight: "2", children: getLang('calls_room_control_timer_finished_admin') }), _jsx(Spacing, { size: 14 }), _jsx(Text, { weight: "3", className: getColorClass('color_text_subhead'), children: descriptionText }), _jsx(Spacing, { size: 32 }), _jsx(Button, { size: "m", onClick: handleSubmit, children: actionButtonText })] }) }));
});
export const RoomTimeoutWidget = createWidget(RoomTimeoutProvider, RoomTimeoutView);
//# sourceMappingURL=RoomTimeout.js.map