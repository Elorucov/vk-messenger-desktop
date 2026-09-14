import React from 'react';
import { Icon20LinkCircleOutline, Icon24Link } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
export const ComposerAttachDonutLink = ({ donutLink, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20LinkCircleOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24Link, null) })), main: lang.use('me_attaches_link'), secondary: donutLink.text }));
};
//# sourceMappingURL=ComposerAttachDonutLink.js.map