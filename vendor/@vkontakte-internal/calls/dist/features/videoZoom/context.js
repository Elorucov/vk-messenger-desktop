import { createContext, useContext } from 'react';
import { noop } from '@vkontakte/vkjs';
import { MediaType } from '@vkontakte/calls-sdk';
const zoomContext = createContext({
    enabled: false,
    setAPI: noop,
    currentScale: 1,
    updateScale: noop,
    maxZoom: 3,
    minZoom: 1,
    zoomStep: 0.25,
    streamMode: MediaType.CAMERA,
});
export const useZoomContext = () => useContext(zoomContext);
export const ZoomProvider = zoomContext.Provider;
//# sourceMappingURL=context.js.map