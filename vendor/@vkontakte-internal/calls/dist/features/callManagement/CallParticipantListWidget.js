import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Icon16ChainOutline, Icon16UserAdd, Icon56UserAddOutline, Icon24Add } from '@vkontakte/icons';
import { noop } from '@vkontakte/vkjs';
import { Button, ButtonGroup, getColorClass, IconButton, Placeholder, Spinner, TextTooltip, RoundedGroup, Flex, Link, SimpleCell, Text, } from '@vkontakte-internal/vkcom-kit';
import { isSameExternalId, externalIdToString, participantIsAdmin, } from '@vkontakte-internal/calls-core';
import { CallParticipantList } from './components/CallParticipantList';
import ListItem from '../../palette/ListItem/ListItem';
import { canMuteParticipants, getIsHandRaised, isParticipantAnonymOrContact, } from '../../helpers/participant';
import { WaitingHallListContainer } from '../../containers/WaitingHallListContainter';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { CallParticipantListRowWidget } from './components/CallParticipantListRow';
import { useLang } from '../../hooks/useLang';
import { getCallConversation, getMyDevice, getMyExternalId } from '../../selectors';
import { useConfig } from '../../services/config';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { CALL_PARTICIPANTS_PAGE_SIZE, useParticipantListModel, ParticipantListProvider, } from './CallParticipantListModel';
const CallParticipantListView = observer(function CallParticipantListView() {
    const model = useParticipantListModel();
    const { devicesInRoom, roomId, activeDevicesCount, searchParticipants, onLinkBlockClick, onShowMoreWaitingHall, addUserClick, currentLimit, searchQuery, setSearchQuery, increaseLimit, putAllHandsDown, putHandDown, unmuteDevice, } = model;
    const { participants, isLoading } = searchParticipants;
    const localDevice = useSelector((state) => state.localDevice);
    const me = useSelector((state) => state.me);
    const devices = useSelector((state) => state.devices);
    const waitingHall = useSelector((state) => state.waitingHall);
    const conversation = useTypedSelector(getCallConversation);
    const { enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum } = useConfig();
    const { getLang } = useLang();
    const canMute = canMuteParticipants(localDevice);
    const isAdmin = participantIsAdmin(useTypedSelector(getMyDevice));
    const externalId = useTypedSelector(getMyExternalId);
    // Если своя рука поднята, тоже показываем, бэк опускает все руки в зале
    const isPutHandsDownShown = useMemo(() => isAdmin && devicesInRoom.some(getIsHandRaised), [isAdmin, devices]);
    const hasOneUserOnly = useMemo(() => !devicesInRoom.some((item) => item.externalId && !isSameExternalId(item.externalId, externalId)), [devicesInRoom, externalId]);
    const isAllowedAddMembers = !!conversation?.canAddMembers;
    const hasNewViewOfMuteActions = isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    const onSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);
    const isAddControlShown = !isParticipantAnonymOrContact(me) && !roomId;
    return (_jsxs(CallParticipantList, { searchQuery: searchQuery, onSearchChange: onSearchChange, length: activeDevicesCount, waitingHallList: waitingHall && _jsx(WaitingHallListContainer, { isModal: false, onMore: onShowMoreWaitingHall }), children: [!hasNewViewOfMuteActions && !searchQuery && isAddControlShown && (_jsx(ListItem, { selectable: false, border: false, "data-testid": "calls_participant_list_add", onClick: addUserClick.fetching ? noop : addUserClick.action, children: _jsxs(Flex, { gap: "xl", children: [_jsx(RoundedGroup.Item, { mode: "secondary", children: _jsx(IconButton, { label: getLang('calls_add_participants'), "data-testid": "calls_participant_list_add", disabled: addUserClick.fetching, hasHover: false, hasActive: false, size: 40, children: addUserClick.fetching ? _jsx(Spinner, { size: "small" }) : _jsx(Icon24Add, {}) }) }), _jsx(Link, { disabled: addUserClick.fetching, children: _jsx(Text, { weight: "2", children: getLang('calls_add_participants') }) })] }) }, "add")), !hasNewViewOfMuteActions && isPutHandsDownShown && (_jsx("div", { className: "CallParticipantList__putHandsDown", children: _jsx(Button, { appearance: "accent", mode: "secondary", onClick: putAllHandsDown, size: "m", stretched: true, "data-testid": "calls_button_put_all_hands_down", children: getLang('calls_put_all_hands_down') }) })), !!participants.length &&
                participants.slice(0, currentLimit).map((device, index, slicedParticipants) => {
                    const deviceId = externalIdToString(device.externalId);
                    const isCreatorOrAdmin = (dev) => Boolean(dev.isAdmin || dev.isCreator);
                    const nextDevice = index + 1 < slicedParticipants.length ? slicedParticipants[index + 1] : null;
                    const isLastAdminRow = Boolean(isCreatorOrAdmin(device) && nextDevice && !isCreatorOrAdmin(nextDevice));
                    return (_jsx(CallParticipantListRowWidget, { isSpeaking: !!model.speakers[deviceId], deviceId: deviceId, canMute: canMute, device: device, withDivider: isLastAdminRow, onClickHandRaised: putHandDown, onUnmuteDevice: unmuteDevice }, deviceId));
                }), isLoading && _jsx(Spinner, { className: getColorClass('color_icon_accent') }), !searchQuery && !isLoading && activeDevicesCount > currentLimit && (_jsx(SimpleCell, { "data-testid": "call_participant_list_button_more", multiline: true, onClick: increaseLimit, children: _jsx(Flex, { className: getColorClass('color_text_link'), justify: "center", children: getLang('calls_participants_show_more').replace('{n}', String(CALL_PARTICIPANTS_PAGE_SIZE)) }) })), searchQuery && !participants.length && (_jsx(Placeholder, { children: getLang('calls_participants_not_found') })), hasNewViewOfMuteActions && hasOneUserOnly && (_jsx(Placeholder, { action: _jsxs(ButtonGroup, { gap: "s", children: [_jsx(Button, { before: _jsx(Icon16UserAdd, {}), "data-testid": "call_participant_list_button_add_to_call", mode: "secondary", onClick: addUserClick.action, disabled: addUserClick.fetching, loading: addUserClick.fetching, children: getLang('calls_add_to_call') }), _jsx(TextTooltip, { placement: "top", text: !isAllowedAddMembers ? getLang('calls_participant_management_link_blocked_hint') : undefined, textAlign: "center", children: _jsx(Button, { before: _jsx(Icon16ChainOutline, {}), "data-testid": "call_participant_list_button_link", disabled: !isAllowedAddMembers, mode: "secondary", onClick: onLinkBlockClick, children: getLang('calls_participant_management_invite_by_link') }) })] }), icon: _jsx(Icon56UserAddOutline, {}), children: getLang('calls_participant_management_invite_description') }))] }));
});
export const CallParticipantListWidget = createWidget(ParticipantListProvider, CallParticipantListView);
//# sourceMappingURL=CallParticipantListWidget.js.map