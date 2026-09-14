import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import React from 'react';
import { useInView } from 'react-intersection-observer';
/**
 * Комопнент, который будет трекать показ постов/репостов каналов СМИ
 * удалять совместно с vkm_mediascope_press
 */
export const MediascopeTracker = ({ children, urls, surface, events }) => {
    const featureFlags = useFeatureFlags();
    /**
     * Если нет urls для отправки в медиаскоп, то и трекать нечего
     */
    if (!urls || !featureFlags.vkm_mediascope_press) {
        return children;
    }
    return (React.createElement(ViewObserver, { urls: urls, surface: surface, events: events }, children));
};
function ViewObserver(props) {
    const { vkcom_me } = useBrowserEnv();
    const { ref } = useInView({
        delay: 300, // чтобы при быстром скролле не тригерить показ
        onChange: (inView) => {
            if (inView) {
                vkcom_me?.onSendMediascopeResearchEvent?.(props.urls, props.surface, props.events);
            }
        },
    });
    return React.createElement("div", { ref: ref }, props.children);
}
//# sourceMappingURL=MediascopeTracker.js.map