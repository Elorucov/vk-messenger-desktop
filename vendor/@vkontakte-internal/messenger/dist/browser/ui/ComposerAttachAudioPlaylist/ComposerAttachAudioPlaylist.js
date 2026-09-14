import { Icon20PlayCircle, Icon24Playlist } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import React from 'react';
export const ComposerAttachAudioPlaylist = ({ playList, isCompactView }) => {
    const { lang } = useBrowserEnv();
    let playlistType;
    switch (playList.type) {
        case 'album':
            playlistType = lang.use('me_attaches_audio_playlist_album');
            break;
        case 'playlist':
            playlistType = lang.use('me_attaches_audio_playlist_playlist');
            break;
        default:
            exhaustivenessCheck(playList.type);
    }
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20PlayCircle, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24Playlist, null) })), main: playList.title, secondary: playlistType }));
};
//# sourceMappingURL=ComposerAttachAudioPlaylist.js.map