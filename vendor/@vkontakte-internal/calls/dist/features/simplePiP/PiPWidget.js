import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { PiPVideo } from './PiPVideo/PiPVideo';
import { PiPViewModelProvider, usePiPViewModel } from './PiPViewModel';
const PiPView = observer(function PiPView() {
    const { shouldMirrorMainVideo, streamData, videoSuspendReason, visibleParticipantData, localOverlayStream, onToggleAudio, isLocalAudioEnabled, isLocalVideoEnabled, onToggleVideo, shouldMirrorOverlayVideo, targetElement, pipIsRunning, closePiP, enablePiP, hangup, } = usePiPViewModel();
    return (_jsx(PiPVideo, { localOverlayStream: localOverlayStream, onHangup: hangup, onClosePiP: closePiP, onToggleAudio: onToggleAudio, onToggleVideo: onToggleVideo, isLocalAudioEnabled: isLocalAudioEnabled, isLocalVideoEnabled: isLocalVideoEnabled, shouldMirrorMainVideo: shouldMirrorMainVideo, enabledPiP: pipIsRunning, enablePiP: enablePiP, targetElement: targetElement, shouldMirrorOverlayVideo: shouldMirrorOverlayVideo, streamData: streamData, videoSuspendReason: videoSuspendReason, isWithVideo: visibleParticipantData.isWithVideo, photo: visibleParticipantData.photo, isNFT: visibleParticipantData.isNFT }));
});
export const PiPWidget = createWidget(PiPViewModelProvider, PiPView);
//# sourceMappingURL=PiPWidget.js.map