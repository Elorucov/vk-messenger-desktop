import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":1}],"div":["global",{"className":1}]} */
import { Icon16Add, Icon16Minus } from '@vkontakte/icons';
import { Button, TextTooltip, ButtonGroup } from '@vkontakte-internal/vkcom-kit';
import { classNames as cn } from '@vkontakte/vkjs';
import { useZoomContext } from '../context';
import { useLang } from '../../../hooks/useLang';
export const VideoZoomControls = ({ className }) => {
    const { api, enabled, currentScale, maxZoom, minZoom, zoomStep } = useZoomContext();
    const { getLang } = useLang();
    if (!enabled || !api) {
        return _jsx(_Fragment, {});
    }
    const zoomScale = Math.floor(currentScale * 100);
    const zoomStepText = zoomStep * 100;
    const canResetZoom = currentScale !== 1;
    const replaceZoomScaleText = (str, zoom) => str.replace('{zoomScale}', zoom.toString(10));
    const resetButton = (_jsx(Button, { mode: "tertiary", "aria-label": replaceZoomScaleText(getLang('calls_video_zoom_button_reset'), zoomScale), hasHover: canResetZoom, hasActive: canResetZoom, onClick: () => {
            if (canResetZoom) {
                api.reset();
            }
        }, "data-testid": "calls_orator_zoom_reset", children: _jsxs("span", { className: "VideoZoomControls__zoomScale", children: [zoomScale, "%"] }) }));
    return (_jsx("div", { className: cn('VideoZoomControls', className), onDoubleClick: (event) => {
            // Чтоб двойной клик по кнопкам зума не вызывал переход в фуллскрин
            event.stopPropagation();
        }, children: _jsxs(ButtonGroup, { mode: "horizontal", gap: "space", children: [_jsx(Button, { mode: "tertiary", before: _jsx(Icon16Add, {}), disabled: currentScale >= maxZoom, "aria-label": replaceZoomScaleText(getLang('calls_video_zoom_button_in'), zoomStepText), onClick: () => {
                        api.zoomIn(zoomStep);
                    }, "data-testid": "calls_orator_zoom_in" }), _jsx(Button, { mode: "tertiary", before: _jsx(Icon16Minus, {}), disabled: currentScale <= minZoom, "aria-label": replaceZoomScaleText(getLang('calls_video_zoom_button_out'), zoomStepText), onClick: () => {
                        api.zoomOut(zoomStep);
                    }, "data-testid": "calls_orator_zoom_out" }), canResetZoom ? (_jsx(TextTooltip, { appearance: "white", text: getLang('calls_video_zoom_button_reset_tooltip'), children: resetButton })) : (resetButton)] }) }));
};
//# sourceMappingURL=VideoZoomControls.js.map