import { useFeatureFlags } from '../../hooks/misc';
import { useEffect, useLayoutEffect, useReducer } from 'react';
const resolveVirtualizerState = (virtualizerCore) => virtualizerCore.getSliceArea();
/**
 * Если вызываете методы виртуалайзера внутри рендера, то делайте
 * это после вызова данного хука для получения актуальных данных.
 */
export const useVirtualScroll = ({ virtualizerCore, wrapper, content, options, }) => {
    const featureFlags = useFeatureFlags();
    const [contentUpdatesCount, triggerContentUpdate] = useReducer((x) => ++x, 0);
    virtualizerCore.updateExternalProps({
        contentUpdatesCount,
        triggerContentUpdate,
        featureFlags,
        ...options,
    });
    useLayoutEffect(() => {
        if (!wrapper || !content) {
            return;
        }
        return virtualizerCore.createObservers(wrapper, content);
    }, [wrapper, content, virtualizerCore]);
    useLayoutEffect(() => {
        virtualizerCore.afterLayoutUpdate();
    });
    useEffect(() => virtualizerCore.destroy, [virtualizerCore]);
    return {
        triggerContentUpdate,
        virtualizerState: resolveVirtualizerState(virtualizerCore),
    };
};
//# sourceMappingURL=useVirtualScroll.js.map