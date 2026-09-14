import React from 'react';
import { Icon20PodcastOutline, Icon24Podcast } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
export const ComposerAttachPodcast = ({ podcast, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20PodcastOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24Podcast, null) })), main: podcast.title, secondary: lang.use('me_attaches_podcast') }));
};
//# sourceMappingURL=ComposerAttachPodcast.js.map