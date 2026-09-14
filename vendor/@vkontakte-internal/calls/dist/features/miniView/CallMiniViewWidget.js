import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"Icon16RecordingCircleFill":["@vkontakte/icons",{"className":1}]} */
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { MediaType, ParticipantStatus } from '@vkontakte/calls-sdk';
import { useCallback, useEffect, useState } from 'react';
import { EVideoOptionType, useVideoOptions } from '../../hooks/useVideoOptions';
import { Video } from '../../components/Video/Video';
import { Icon16RecordingCircleFill } from '@vkontakte/icons';
import { Participant, ParticipantAppearance } from '../../components/Participant';
import { classNames as cn } from '@vkontakte/vkjs';
import { AppearanceProvider, AppRootProvider } from '@vkontakte-internal/vkcom-kit';
import { getTypeSizeOfStream } from '../simplePiP/utils';
import { GridButtons } from './components/GridButtons';
import { useControls } from './hooks/useControls';
import { useRestoreCall } from '../../hooks/useRestoreCall';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { Provider, useModel } from './CallMiniViewModel';
export const CallMiniView = observer(function CallMiniView() {
    const { props, visibleDevicesStreamData, isAudioAllowed, isScreenSharingAllowed, isVideoAllowed } = useModel();
    const { localVideoStreamData, participantId, isLocalScreenSharing, name, isRecord, photo, isNFT, children, widgetClass, status = ParticipantStatus.CONNECTED, isMe = false, isMiniApp = false, redesign = false, controlsTopLeft, controlsTopRight, controlsBottomLeft, controlsBottomRight, targetElementId, } = props;
    const [isLocalVideoVisible, setLocalVideoVisibility] = useState(false);
    const { storedVideoOptions } = useVideoOptions();
    const displayMode = getTypeSizeOfStream(visibleDevicesStreamData?.type ?? MediaType.CAMERA);
    useEffect(() => {
        if (!localVideoStreamData?.data) {
            setLocalVideoVisibility(false);
        }
    }, [localVideoStreamData, isLocalVideoVisible]);
    const handleRestoreCall = useRestoreCall();
    const handleDblClick = useCallback((e) => {
        if (isMiniApp || e.target.closest?.('.CallBaseWidget__buttons')) {
            return;
        }
        handleRestoreCall();
        e.stopPropagation();
    }, []);
    const buttons = useControls({
        controls: { controlsTopLeft, controlsTopRight, controlsBottomLeft, controlsBottomRight },
        redesign,
        isAudioAllowed,
        isScreenSharingAllowed,
        isVideoAllowed,
    });
    return (_jsx(AppRootProvider, { children: _jsx(AppearanceProvider, { value: "dark", children: _jsxs("div", { className: cn('CallBaseWidget', widgetClass, {
                    'CallBaseWidget--wideMode': displayMode === 'wide',
                    'CallsBaseWidget--redesign': redesign,
                }), onDoubleClick: handleDblClick, children: [!targetElementId && localVideoStreamData && localVideoStreamData.data && (_jsx(Video, { className: "CallBaseWidget__local", participantId: externalIdToString(participantId), stream: localVideoStreamData.data, isMirrored: !isLocalScreenSharing && storedVideoOptions[EVideoOptionType.IS_VIDEO_MIRRORED], isLocalSchreenShare: isLocalScreenSharing, isContained: displayMode === 'wide', mediaType: localVideoStreamData.type, isStartWithVisible: true })), isRecord && _jsx(Icon16RecordingCircleFill, { className: "CallBaseWidget__is-record-icon" }), targetElementId ? (_jsx("div", { id: targetElementId, className: "CallBaseWidget__pip-container" })) : (_jsx(Participant, { appearance: ParticipantAppearance.MINI, externalId: participantId, isMe: isMe, photo: photo, name: name, status: status, isNFT: isNFT, isMiniApp: isMiniApp, photoSize: 100 })), children, _jsx(GridButtons, { ...buttons, redesign: redesign })] }) }) }));
});
export const CallMiniViewWidget = createWidget(Provider, CallMiniView);
//# sourceMappingURL=CallMiniViewWidget.js.map