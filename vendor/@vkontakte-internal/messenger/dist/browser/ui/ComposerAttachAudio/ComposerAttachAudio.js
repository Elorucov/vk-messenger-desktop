import React from 'react';
import { ComposerAttachCard, ComposerFileAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { Icon20MusicOutline } from '@vkontakte/icons';
export const ComposerAttachAudio = ({ audio, isCompactView, }) => {
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20MusicOutline, null)) : (React.createElement(ComposerFileAttachCardIcon, { ext: "audio" })), main: audio.title, secondary: audio.artist }));
};
//# sourceMappingURL=ComposerAttachAudio.js.map