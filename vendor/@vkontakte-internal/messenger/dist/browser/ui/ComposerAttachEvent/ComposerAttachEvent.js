import React from 'react';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { Icon20CalendarOutline, Icon24CalendarOutline } from '@vkontakte/icons';
import { useBrowserEnv, usePeer } from '../../hooks/misc';
export const ComposerAttachEvent = ({ event, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    const peer = usePeer(event.id, true);
    const main = peer.kind === 'Group' ? peer.name : '';
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20CalendarOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24CalendarOutline, null) })), main: main, secondary: lang.use('me_attaches_event') }));
};
//# sourceMappingURL=ComposerAttachEvent.js.map