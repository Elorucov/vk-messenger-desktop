import { jsx as _jsx } from "react/jsx-runtime";
import { ZoomProvider } from '../context';
import { useEffect, useState } from 'react';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getUIMode } from '../../../selectors';
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { MediaType } from '@vkontakte/calls-sdk';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useVideoZoomModel, VideoZoomProvider } from '../model';
const VideoZoomView = observer(function VideoZoomView({ children }) {
    const { visibleParticipant, props } = useVideoZoomModel();
    const { maxZoom = 3, minZoom = 1, zoomStep = 0.25, streamMode = MediaType.CAMERA } = props.current;
    const [zoomAPI, setZoomAPI] = useState(undefined);
    const [zoomScale, setZoomScale] = useState(1);
    const uiMode = useTypedSelector(getUIMode);
    // Сбрасываем зум, если вошли/вышли из фуллскрина
    // Сбрасываем зум, если поменялся партисипант
    useEffect(() => {
        zoomAPI?.reset();
    }, [uiMode, zoomAPI, externalIdToString(visibleParticipant.externalId)]);
    return (_jsx(ZoomProvider, { value: {
            enabled: true,
            updateScale: setZoomScale,
            currentScale: zoomScale,
            setAPI: setZoomAPI,
            api: zoomAPI,
            maxZoom,
            minZoom,
            zoomStep,
            streamMode,
        }, children: children }));
});
export const VideoZoomWidget = createWidget(VideoZoomProvider, VideoZoomView);
//# sourceMappingURL=VideoZoomContainer.js.map