import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { classNames } from '@vkontakte/vkjs';
import { VoiceRoomParticipant, VideoStream, ParticipantActionsButton, DropdownActionSheet, } from '@vkontakte-internal/vkcom-kit';
import { VOICE_ROOM_PINNED_PARTICIPANT_HEIGHT, VOICE_ROOM_PINNED_PARTICIPANT_WIDTH } from '../constants';
import { vou } from '../../../helpers/helpers';
const PINNED_PARTICIPANT_SIZE = 240;
export function PinnedParticipant({ className, stream, participantId, userName, isVideoEnabled, photo, actions, isAudioEnabled, isMe, }) {
    const isVideoShown = isVideoEnabled && stream && participantId;
    return (_jsxs("div", { className: classNames(className, 'VoiceRoomCall_PinnedParticipant'), children: [!isVideoShown && (_jsx(VoiceRoomParticipant, { size: PINNED_PARTICIPANT_SIZE, userName: userName, src: photo, cellSize: "dynamic", hasMicrophoneDisabledled: !isAudioEnabled, gradientColor: vou(!photo, 'blue') })), isVideoShown && (_jsx(VideoStream, { stream: stream, videoId: participantId, width: VOICE_ROOM_PINNED_PARTICIPANT_WIDTH, height: VOICE_ROOM_PINNED_PARTICIPANT_HEIGHT, mirrored: isMe })), _jsx(DropdownActionSheet, { content: actions, children: _jsx("div", { className: "VoiceRoomCall_PinnedParticipant--MoreButton", children: _jsx(ParticipantActionsButton, {}) }) })] }));
}
//# sourceMappingURL=PinnedParticipant.js.map