import React from 'react';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { Icon20NarrativeOutline, Icon24NarrativeOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
export const ComposerAttachNarrative = ({ narrative, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20NarrativeOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24NarrativeOutline, null) })), main: narrative.title, secondary: lang.use('me_attaches_narratives', { num: 1 }) }));
};
//# sourceMappingURL=ComposerAttachNarrative.js.map