import { jsx as _jsx } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { CollapsedCall, CallVideoWidget } from '../features/miniView/collapsed';
export const CollapsedWaitingHallContainer = () => {
    const state = useSelector((state) => state);
    const localDevice = state.localDevice;
    const externalId = state.externalId;
    const participant = state.participants[state.me];
    return (_jsx(CollapsedCall, { children: externalId && (_jsx(CallVideoWidget, { isMe: true, isLocalAudioEnabled: !!localDevice.mediaSettings?.isAudioEnabled, isLocalAudioAllowed: true, isLocalScreenSharing: false, isLocalVmoji: false, photo: participant.photo, name: participant.name, participantId: externalId, status: localDevice.status })) }));
};
//# sourceMappingURL=CollapsedWaitingHallContainer.js.map