import { jsx as _jsx } from "react/jsx-runtime";
import { Skeleton } from '../../Skeleton/Skeleton';
import { VoiceRoomParticipant, } from '../VoiceRoomParticipant/VoiceRoomParticipant';
const TITLE_WIDTH_PERCENT = 0.96;
export const VoiceRoomParticipantSkeleton = ({ size, cellSize, }) => {
    return (_jsx(VoiceRoomParticipant, { cellSize: cellSize, size: size, userName: _jsx(Skeleton, { width: size * TITLE_WIDTH_PERCENT, height: 12 }), children: _jsx(Skeleton, { width: size, height: size, circle: true }) }));
};
//# sourceMappingURL=VoiceRoomParticipantSkeleton.js.map