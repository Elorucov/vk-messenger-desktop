import React from 'react';
import { Icon20StoryOutline, Icon24StoryOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
export const ComposerAttachStory = ({ isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20StoryOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24StoryOutline, null) })), main: lang.use('me_attaches_story') }));
};
//# sourceMappingURL=ComposerAttachStory.js.map