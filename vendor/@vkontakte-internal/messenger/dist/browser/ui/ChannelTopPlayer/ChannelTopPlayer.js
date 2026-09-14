import React from 'react';
import { ConvoAudioPlayer } from '../../ui/ConvoAudioPlayer/ConvoAudioPlayer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
export const ChannelTopPlayer = ({ type }) => {
    switch (type) {
        case 'audio': {
            return React.createElement(ConvoAudioPlayer, { onDescriptionClick: () => { } });
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=ChannelTopPlayer.js.map