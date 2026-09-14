import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { E_ACTION } from '../../constants';
import { CallManagementModal } from '../../components/CallManagementModal/CallManagementModal';
import { AddParticipantsWidget } from '../../components/AddParticipants/AddParticipantsWidget';
import { AddParticipantsLegacy } from '../../components/AddParticipants/AddParticipantsLegacy';
import { ETabName, useTabs } from '../../components/AddParticipants/hooks/useTabs';
import { CallManagementModalActionButtons } from '../../components/CallManagementModalActionButtons/CallManagementModalActionButtons';
import { convertClientData } from '../../helpers/helpers';
import { useCallsSDK } from '../../providers/CallsSdkProvider';
import { useLang } from '../../hooks/useLang';
import { toggleModal } from '../../actions';
import { ModalType, getDefaultExternalId, peerIdToVkId, vkIdToPeerId, ROOM_MAIN_ID, } from '@vkontakte-internal/calls-core';
import { ClickHouseEventType, useSendStatsService } from '../../stats/clickHouse';
import { getCallData, getCallDataShowChatHistory, getChatData, getChatMembers, getChatMembersCount, getFriends, getFriendsCount, getGroupMembers, getGroupMembersCount, getIsMeAdmin, getIsMeCommunity, getMyExternalId, getParticipants, getPreselectedIds, } from '../../selectors';
import { useConfig } from '../../services/config';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { GroupCallSetupProvider, useGroupCallSetupModel } from './GroupCallSetupModel';
import { createConversationDataObject, getMembersByIds, getModalHint } from './helpers';
import { useFormCheckboxesValues } from '../../hooks/useFormCheckboxesValues';
import { Checkbox } from '@vkontakte-internal/vkcom-kit';
export const GroupCallSetupView = observer(function GroupCallSetupView() {
    const sendStats = useSendStatsService();
    const SDK = useCallsSDK();
    const { isCommunityCallingMe, membersCount, updateRoomParticipants, isWithBackButton, onBackClick, callMembers, } = useGroupCallSetupModel();
    // TODO CALL-21471 REMOVE TEMPORARY CONTACTS debugCallsToContacts
    const { debugCallsToContacts, enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum, enableChatHistoryToggle, enableChatHistoryToggleEdu, } = useConfig();
    const myExternalId = useTypedSelector(getMyExternalId);
    const stateParticipants = useTypedSelector(getParticipants);
    const friends = useTypedSelector(getFriends);
    const chatMembers = useTypedSelector(getChatMembers);
    const groupMembers = useTypedSelector(getGroupMembers);
    const preselectedIds = useTypedSelector(getPreselectedIds);
    const callData = useTypedSelector(getCallData);
    const showChatHistory = useTypedSelector(getCallDataShowChatHistory);
    const chatData = useTypedSelector(getChatData);
    const hasNewViewOfMuteActions = isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const [selected, setSelected] = useState(() => preselectedIds ? preselectedIds.map(vkIdToPeerId) : []);
    const storeChatMembers = useTypedSelector(getChatMembers);
    const someSelectedNotChatMembers = useMemo(() => selected.some((id) => !storeChatMembers.find((member) => vkIdToPeerId(member.id) === id)), [storeChatMembers, selected]);
    /** количество участников чата (включая не активных) */
    const chatMembersLength = useTypedSelector(getChatMembersCount) || 0;
    /** количество друзей */
    const friendsCount = useTypedSelector(getFriendsCount) || 0;
    /** количество участников сообщества */
    const groupMembersCount = useTypedSelector(getGroupMembersCount);
    /** звоню ли я от лица сообщества */
    const isMeCommunity = useTypedSelector(getIsMeCommunity);
    /** количество участников звонка + выбранных юзером в списке */
    const tokensLength = membersCount + selected.length;
    /** какие табы отображаем */
    const displayTabs = useMemo(() => {
        const tabs = [
            !isMeCommunity && !isCommunityCallingMe && ETabName.Participants,
            !isMeCommunity ? ETabName.Friends : ETabName.Community,
        ];
        if (debugCallsToContacts) {
            tabs.push(ETabName.Contacts);
        }
        return tabs;
    }, [isMeCommunity, debugCallsToContacts]);
    /**
     * контроллер выбранного таба AddParticipants, вынесен
     * сюда из за того, что нужно отображать разный контент
     * в футере модалки, в зависимости от выбранного таба
     */
    const { onChangeTab, tab, tabs } = useTabs({
        membersCount,
        friendsCount,
        groupMembersCount,
        displayTabs,
        defaultTab: isMeCommunity
            ? ETabName.Community
            : isCommunityCallingMe
                ? ETabName.Friends
                : chatMembersLength > 1
                    ? ETabName.Participants
                    : ETabName.Friends,
    });
    const hideGroupCallSetup = () => {
        dispatch({
            type: E_ACTION.GROUP_CALL_SETUP,
            open: false,
            preselectedIds: null,
        });
    };
    // Button params
    const isAddSubmitDisabled = selected.length === 0;
    const chatHistoryCheckbox = useFormCheckboxesValues({
        initialValue: showChatHistory !== undefined ? showChatHistory : isSferum,
    });
    const addToCall = (participants) => {
        hideGroupCallSetup();
        dispatch({
            type: E_ACTION.MANUAL_ADD_PARTICIPANTS,
            participants,
        });
        const requests = participants.map((participantId) => {
            const shouldHandleChatHistory = tab === ETabName.Friends && (isSferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle);
            const params = shouldHandleChatHistory
                ? { payload: JSON.stringify({ show_chat_history: chatHistoryCheckbox.checked }) }
                : undefined;
            return new Promise((resolve) => {
                const externalId = getDefaultExternalId(participantId);
                SDK.addParticipant(externalId, params)
                    .then(() => {
                    updateRoomParticipants({
                        roomId: ROOM_MAIN_ID,
                        addedParticipantIds: [externalId],
                        myExternalId,
                    });
                    resolve(undefined);
                })
                    .catch((e) => {
                    if (e.message === 'auth.banned') {
                        resolve(peerIdToVkId(participantId));
                    }
                    else if (e.message === 'vk-participant-is-rejected-error' ||
                        e.message === 'call_chat_privacy_settings') {
                        dispatch({
                            type: E_ACTION.ERROR,
                            text: getLang('calls_error_cant_add_because_of_privacy'),
                        });
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        });
        Promise.all(requests).then((bannedParticipants) => {
            const isVkId = (id) => id !== undefined;
            const ids = bannedParticipants.filter(isVkId);
            if (ids.length) {
                const membersForUnban = getMembersByIds({
                    friends,
                    chatMembers,
                    groupMembers,
                    bannedParticipants: ids,
                });
                dispatch(toggleModal(ModalType.MEMBERS_UNBAN, {
                    members: membersForUnban,
                    showChatHistory: chatHistoryCheckbox.checked,
                }));
            }
        });
        const [conversation, members] = convertClientData(createConversationDataObject({
            callData,
            participants: stateParticipants,
            chatMembers,
            friends,
            selected: participants,
            chatData,
        }));
        dispatch({
            type: E_ACTION.LOAD_PEERS,
            conversation,
            members,
        });
        sendStats(ClickHouseEventType.OUTGOING_CALL_ADD_PARTICIPANTS_SENT, {
            group_call_users_count: selected.length,
            ...(tab === ETabName.Friends &&
                (isSferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle) && {
                reason: tab !== ETabName.Friends
                    ? ''
                    : showChatHistory && chatHistoryCheckbox
                        ? 'call'
                        : chatHistoryCheckbox
                            ? 'enabled'
                            : 'skip',
            }),
            session_id: callData.callId,
        });
    };
    const onAdd = () => {
        addToCall(selected);
    };
    const onAddChatMembers = () => {
        addToCall(callMembers);
    };
    const isMeAdmin = useTypedSelector(getIsMeAdmin);
    return (_jsx(CallManagementModal, { title: hasNewViewOfMuteActions ? getLang('calls_add_to_call') : getLang('calls_add_participants_to_call'), onCloseModal: hideGroupCallSetup, actionButtons: _jsx(CallManagementModalActionButtons, { isAddSubmitDisabled: isAddSubmitDisabled, onAdd: onAdd, onAddAll: onAddChatMembers, tab: tab, showCallAll: chatMembersLength > membersCount }), hint: tab !== ETabName.Participants ? getModalHint(tokensLength, getLang) : undefined, isWithBackButton: isWithBackButton, onBackClick: isWithBackButton ? onBackClick : () => { }, footerBefore: tab === ETabName.Friends &&
            selected.length &&
            isMeAdmin &&
            !showChatHistory &&
            someSelectedNotChatMembers &&
            (isSferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle) ? (_jsx(Checkbox, { ...chatHistoryCheckbox, children: getLang('calls_enable_last_chat_messages') })) : undefined, children: hasNewViewOfMuteActions ? (_jsx(AddParticipantsWidget, { onChange: setSelected, tab: tab, tabs: tabs, onChangeTab: onChangeTab, selected: selected })) : (_jsx(AddParticipantsLegacy, { onChange: setSelected, tab: tab, tabs: tabs, onChangeTab: onChangeTab, selected: selected })) }));
});
export const GroupCallSetupWidget = createWidget(GroupCallSetupProvider, GroupCallSetupView);
//# sourceMappingURL=GroupCallSetupContainer.js.map