import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { TransformComponent, TransformWrapper, } from 'react-zoom-pan-pinch';
import { useCallback, useEffect, useRef } from 'react';
import { useZoomContext } from '../context';
import { debounce } from '@vkontakte/vkjs';
import { ClickHouseEventType, useSendStatsService } from '../../../stats/clickHouse';
import { MediaType } from '@vkontakte/calls-sdk';
export const VideoZoomWrapper = ({ children }) => {
    const zoomContext = useZoomContext();
    const zoomRef = useRef(null);
    useEffect(() => {
        const current = zoomRef.current;
        if (!zoomContext.enabled || !current) {
            return;
        }
        zoomContext.setAPI({
            zoomIn: (step) => {
                if (!current)
                    return;
                let currentZoom = current.instance.transformState.scale * 100;
                let value = step * 100;
                let nextZoom = (value - (currentZoom % value)) / 100;
                current.zoomIn(nextZoom, 0);
            },
            zoomOut: (step) => {
                if (!current)
                    return;
                let currentZoom = current.instance.transformState.scale * 100;
                let value = step * 100;
                let nextZoom = (currentZoom % value === 0 ? value : currentZoom % value) / 100;
                current.zoomOut(nextZoom, 0);
            },
            reset: () => {
                if (!current)
                    return;
                current.resetTransform();
                zoomContext.updateScale(current.instance.transformState.scale);
            },
        });
        return () => {
            zoomContext.setAPI(undefined);
        };
    }, []);
    // Отправляем стату о зуме
    const sendStats = useSendStatsService();
    const sendZoomStats = useCallback(debounce((scale) => {
        sendStats(ClickHouseEventType.SCREEN_ZOOMED, {
            reason: zoomContext.streamMode === MediaType.SCREEN ? 'screenshare' : 'video',
            event_param: scale * 100,
        });
    }, 1e3), [sendStats, zoomContext.streamMode]);
    /**
     * Кеширую значение, так как onTransformed вызывается на каждый чих.
     * Есть событие onZoom, но оно не вызывается когда нажимаешь на кнопки
     */
    const prevScale = useRef(1);
    const handleUpdateState = useCallback((ref) => {
        const newScale = ref.state.scale;
        if (prevScale.current !== newScale) {
            zoomContext.updateScale(newScale);
            sendZoomStats(newScale);
            prevScale.current = newScale;
        }
    }, [sendZoomStats]);
    if (!zoomContext.enabled) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(TransformWrapper, { disablePadding: true, smooth: false, wheel: { wheelDisabled: true, step: 0.1 }, panning: { wheelPanning: true }, doubleClick: { disabled: true }, onTransformed: handleUpdateState, maxScale: zoomContext.maxZoom, ref: zoomRef, children: _jsx(TransformComponent, { wrapperClass: "VideoZoomWrapper", contentClass: "VideoZoomWrapper__content", children: children }) }));
};
//# sourceMappingURL=VideoZoomWrapper.js.map