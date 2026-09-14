import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon24ChainOutline, Icon24Hand2SlashOutline, Icon24MegaphoneOutline, Icon24Microphone2SlashOutline, Icon24PhoneCrossOutline, Icon24UserAddOutline, Icon24Videocam2SlashOutline, } from '@vkontakte/icons';
import { ButtonGroup, Div, Flex, Interpolate } from '@vkontakte-internal/vkcom-kit';
import { ModalType, participantIsAdmin, CallStatScreen } from '@vkontakte-internal/calls-core';
import { useIsGroupCall } from '../../../hooks/useIsGroupCall';
import { useLang } from '../../../hooks/useLang';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getMyDevice } from '../../../selectors';
import { ToolbarButton } from './ToolbarButton';
import { toggleModal } from '../../../actions';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { CallManagementToolbarProvider, useCallManagementToolbarModel } from './CallManagementToolbarModel';
const CallManagementToolbarView = observer(function CallManagementToolbarView() {
    const { isMeCanMuteParticipants, isSomeHandRaised, isSomeUserMicrophoneEnabled, isSomeUserCameraEnabled, canFinishCall, hasOtherParticipants, isAllowedAddMembers, addUserClick, onLinkBlockClick, muteCameras, muteMicrophones, putAllHandsDown, unmuteAll, } = useCallManagementToolbarModel();
    const dispatch = useTypedDispatch();
    const participantMe = useTypedSelector(getMyDevice);
    const isAdmin = participantIsAdmin(participantMe);
    const isGroupCall = useIsGroupCall();
    const { getLang } = useLang();
    const handleOpenLeaveBox = () => dispatch(toggleModal(ModalType.EXIT, {
        additionalStatsData: { screen: CallStatScreen.ParticipantsManager },
        isLeaveCallButtonHidden: true,
    }));
    /** Максимальная ширина текста кнопки тулбара в режиме администратора */
    const buttonTextMaxWidth = 75;
    if (!isAdmin) {
        return (_jsx(Div, { paddingBottom: 0, children: _jsx(Flex, { justify: "center", children: _jsxs(ButtonGroup, { gap: "space", children: [_jsx(ToolbarButton, { ariaLabel: getLang('calls_add_to_call'), dataTestId: "call_management_toolbar_button_add_to_call", Icon: Icon24UserAddOutline, onClick: addUserClick.action, disabled: addUserClick.fetching, loading: addUserClick.fetching, children: getLang('calls_add_to_call') }), _jsx(ToolbarButton, { ariaLabel: getLang('calls_menu_link'), dataTestId: "call_management_toolbar_button_link", disabled: !isAllowedAddMembers, Icon: Icon24ChainOutline, onClick: onLinkBlockClick, tooltip: !isAllowedAddMembers ? getLang('calls_participant_management_link_blocked_hint') : undefined, children: getLang('calls_menu_link') })] }) }) }));
    }
    const unmute = (_jsx(ToolbarButton, { ariaLabel: getLang('calls_participant_management_ask_to_unmute_all'), dataTestId: "call_management_toolbar_button_ask_to_unmute_all", disabled: !isGroupCall || !isMeCanMuteParticipants || !hasOtherParticipants, Icon: Icon24MegaphoneOutline, isIconOnly: true, onClick: unmuteAll, tooltip: getLang('calls_participant_management_ask_to_unmute_all') }));
    return (_jsx(Div, { paddingBottom: 0, children: _jsxs(Flex, { justify: "space-between", children: [_jsxs(ButtonGroup, { gap: "space", children: [_jsx(ToolbarButton, { ariaLabel: getLang('calls_add_to_call'), dataTestId: "call_management_toolbar_button_add_to_call", Icon: Icon24UserAddOutline, isIconOnly: true, onClick: addUserClick.action, disabled: addUserClick.fetching, loading: addUserClick.fetching, tooltip: getLang('calls_add_to_call') }), _jsx(ToolbarButton, { ariaLabel: getLang('calls_menu_link'), dataTestId: "call_management_toolbar_button_link", disabled: !isAllowedAddMembers, Icon: Icon24ChainOutline, isIconOnly: true, onClick: onLinkBlockClick, tooltip: !isAllowedAddMembers
                                ? getLang('calls_participant_management_link_blocked_hint')
                                : getLang('calls_menu_link') })] }), _jsxs(ButtonGroup, { gap: "space", children: [_jsx(ToolbarButton, { ariaLabel: getLang('calls_participant_management_mute_microphones'), dataTestId: "call_management_toolbar_button_mute_microphones", disabled: !isSomeUserMicrophoneEnabled, Icon: Icon24Microphone2SlashOutline, maxWidth: buttonTextMaxWidth, onClick: muteMicrophones, tooltip: !isSomeUserMicrophoneEnabled
                                ? getLang('calls_participant_management_mute_microphones_disabled_hint')
                                : undefined, children: _jsx(Interpolate, { children: getLang('calls_participant_management_mute_microphones') }) }), _jsx(ToolbarButton, { ariaLabel: getLang('calls_participant_management_mute_cameras'), dataTestId: "call_management_toolbar_button_mute_cameras", disabled: !isSomeUserCameraEnabled, Icon: Icon24Videocam2SlashOutline, maxWidth: buttonTextMaxWidth, onClick: muteCameras, tooltip: !isSomeUserCameraEnabled
                                ? getLang('calls_participant_management_mute_cameras_disabled_hint')
                                : undefined, children: _jsx(Interpolate, { children: getLang('calls_participant_management_mute_cameras') }) }), _jsx(ToolbarButton, { ariaLabel: getLang('calls_participant_management_put_all_hands_down'), dataTestId: "call_management_toolbar_button_put_all_hands_down", disabled: !isSomeHandRaised, Icon: Icon24Hand2SlashOutline, isIconOnly: true, onClick: putAllHandsDown, tooltip: isSomeHandRaised
                                ? getLang('calls_participant_management_put_all_hands_down')
                                : getLang('calls_participant_management_put_all_hands_down_disabled_hint') }), canFinishCall && unmute] }), canFinishCall ? (_jsx(ToolbarButton, { ariaLabel: getLang('calls_force_call_finish'), dataTestId: "call_management_toolbar_button_force_call_finish", Icon: Icon24PhoneCrossOutline, iconMode: "negative", isIconOnly: true, onClick: handleOpenLeaveBox, tooltip: getLang('calls_force_call_finish') })) : (unmute)] }) }));
});
export const CallManagementToolbarWidget = createWidget(CallManagementToolbarProvider, CallManagementToolbarView);
//# sourceMappingURL=CallManagementToolbar.js.map