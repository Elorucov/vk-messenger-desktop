import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { getDefaultExternalId, } from '@vkontakte-internal/calls-core';
import { useCallback, useState } from 'react';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { getMemberForUserStack } from '../helpers/user';
import { UnbanMembersModal } from '../components/UnbanMembersModal/UnbanMembersModal';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { useLang } from '../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useCloseModal } from '../hooks/useCloseModal';
import { getCallData, getIsMeAdmin } from '../selectors';
import { useConfig } from '../services/config';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
export const UnbanParticipantContainer = ({ members }) => {
    const SDK = useCallsSDK();
    const { getLang, langNumeric, langSex } = useLang();
    const allowToUnban = useTypedSelector(getIsMeAdmin);
    const closeModal = useCloseModal();
    const [showChatHistory] = useState(false);
    const { enableChatHistoryToggle, enableChatHistoryToggleEdu, sferum } = useConfig();
    const sendStats = useSendStatsService();
    const callData = useTypedSelector(getCallData);
    const onUnbanParticipants = useCallback(() => {
        members?.forEach((member) => {
            const externalId = getDefaultExternalId(String(member.id));
            const shouldHandleChatHistory = sferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle;
            sendStats(ClickHouseEventType.OUTGOING_CALL_ADD_PARTICIPANTS_SENT, {
                group_call_users_count: 1,
                session_id: callData.callId,
                reason: showChatHistory ? 'enabled' : 'skip',
            });
            SDK.addParticipant(externalId, {
                unban: true,
                payload: shouldHandleChatHistory ? JSON.stringify({ show_chat_history: showChatHistory }) : undefined,
            });
        });
        closeModal();
    }, [members]);
    if (!members || members.length === 0) {
        return _jsx(_Fragment, {});
    }
    const membersCount = members?.length;
    const description = langNumeric(membersCount, 'calls_unban_participant_text', getLang('calls_unban_participant_text', 'raw'));
    let subDescription = '';
    let renderedMembers = [];
    if (membersCount === 1) {
        const member = members[0];
        subDescription = langSex(member.sex, 'calls_unban_participant_description_text_one_person', getLang('calls_unban_participant_description_text_one_person', 'raw')).replace('{user}', member.name);
        renderedMembers.push(getMemberForUserStack(member));
    }
    else {
        let names = [members[0].name, members[1].name];
        renderedMembers = members.slice(0, 2).map((member) => {
            return getMemberForUserStack(member);
        });
        const separator = ', ';
        if (membersCount <= 3) {
            if (membersCount === 3) {
                names.push(members[2].name);
                renderedMembers.push(getMemberForUserStack(members[2]));
            }
            subDescription = getLang('calls_unban_participant_description_text_two_persons').replace('{users}', names.join(separator));
        }
        else {
            const leftCount = membersCount - 2;
            const subDescriptionByLeftCount = langNumeric(leftCount, 'calls_unban_participant_description_text_more_persons', getLang('calls_unban_participant_description_text_more_persons', 'raw'));
            subDescription = subDescriptionByLeftCount
                .replace('{users}', names.join(separator))
                .replace('{users_count}', leftCount);
            renderedMembers.push({
                id: leftCount,
                text: '+' + leftCount,
            });
        }
    }
    const actionButtons = allowToUnban
        ? [
            _jsx(Button, { size: "m", onClick: closeModal, mode: "secondary", children: getLang('calls_unban_participant_cancel_button_text') }, "cancel"),
            _jsx(Button, { onClick: onUnbanParticipants, mode: "primary", size: "m", children: getLang('calls_unban_participant_ok_button_text') }, "stop"),
        ]
        : [
            _jsx(Button, { size: "m", mode: "primary", onClick: closeModal, children: getLang('calls_unban_participant_disallowed_button_text') }, "cancel"),
        ];
    return (_jsx(UnbanMembersModal, { onClose: closeModal, description: description, subDescription: subDescription, actionButtons: actionButtons, avatarsItems: renderedMembers }));
};
//# sourceMappingURL=UnbanParticipantContainer.js.map