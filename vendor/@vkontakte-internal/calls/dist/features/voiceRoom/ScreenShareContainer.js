import { jsx as _jsx } from "react/jsx-runtime";
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { VideoStream } from '@vkontakte-internal/vkcom-kit';
import { getVoiceRoomScreenShare } from './selectors';
export const ScreenShareContainer = () => {
    const screenShare = useTypedSelector(getVoiceRoomScreenShare);
    if (!screenShare || !screenShare.stream || !screenShare.owner) {
        return null;
    }
    return (_jsx(VideoStream, { stream: screenShare.stream, videoId: screenShare.owner.id, width: 636, height: 375, objectFit: "contain" }));
};
//# sourceMappingURL=ScreenShareContainer.js.map