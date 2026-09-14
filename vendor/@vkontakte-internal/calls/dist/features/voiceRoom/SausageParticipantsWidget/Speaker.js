import { jsx as _jsx } from "react/jsx-runtime";
import { VoiceRoomParticipant } from '@vkontakte-internal/vkcom-kit';
import { useParticipantReaction } from '../../../components/Participant/hooks/useParticipantReaction';
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getReactionsIcons } from '../../../selectors';
export const Speaker = ({ externalId, isMe, ...props }) => {
    const icons = useTypedSelector(getReactionsIcons);
    const id = externalIdToString(externalId);
    const reaction = useParticipantReaction(id, isMe);
    const reactionIconLink = reaction?.key ? icons?.[24]?.[reaction.key] : undefined;
    return _jsx(VoiceRoomParticipant, { ...props, reaction: reactionIconLink, cellSize: "dynamic" });
};
//# sourceMappingURL=Speaker.js.map