import { useEffect, useRef } from 'react';
export function usePseudoLayer() {
    useEffect(() => {
        document.body.classList.add('layers_shown');
        return () => {
            document.body.classList.remove('layers_shown');
        };
    }, []);
}
export const useFullScreen = (isOn, onCallback, offCallback, deps = []) => {
    const document = window.document;
    const documentElement = document.documentElement;
    const requestFullscreenFn = documentElement.requestFullscreen || documentElement.webkitRequestFullscreen;
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const _onCallback = useRef(undefined);
    _onCallback.current = onCallback;
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const _offCallback = useRef(undefined);
    _offCallback.current = offCallback;
    if (!requestFullscreenFn) {
        return;
    }
    const isFallBacking = !documentElement.requestFullscreen;
    const exitFullscreenFn = isFallBacking ? document.webkitExitFullscreen : document.exitFullscreen;
    const fsEvent = isFallBacking ? 'webkitfullscreenchange' : 'fullscreenchange';
    const fsElementKey = isFallBacking ? 'webkitFullscreenElement' : 'fullscreenElement';
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const onFSToggle = () => {
            if (!document.fullscreenElement) {
                _offCallback.current?.();
            }
            else {
                _onCallback.current?.();
            }
        };
        document.addEventListener(fsEvent, onFSToggle);
        return () => document.removeEventListener(fsEvent, onFSToggle);
    }, []);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (isOn && !document[fsElementKey]) {
            requestFullscreenFn.call(document.documentElement);
        }
        else if (!isOn && document[fsElementKey]) {
            exitFullscreenFn.call(document);
        }
    }, deps);
};
//# sourceMappingURL=hooks.js.map