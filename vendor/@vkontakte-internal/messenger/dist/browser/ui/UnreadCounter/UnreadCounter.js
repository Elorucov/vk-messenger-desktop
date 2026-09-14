import '../../ui/UnreadCounter/UnreadCounter.css';
import React from 'react';
import cx from 'classnames';
import { useBrowserEnv } from '../../hooks/misc';
export const UnreadCounter = ({ getRootRef, count, isMuted, isThemed, className, size = 20, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { role: "img", "aria-label": lang.use('me_convo_has_unread'), className: cx(className, 'UnreadCounter', `UnreadCounter--size-${size}`, {
            'UnreadCounter--muted': isMuted,
            'UnreadCounter--themed': !isMuted && isThemed,
        }), 
        // Необходим для компонента OnboardingMarkedTooltip
        ref: getRootRef }, count ? lang.formatNumber(count, 'short') : ''));
};
//# sourceMappingURL=UnreadCounter.js.map