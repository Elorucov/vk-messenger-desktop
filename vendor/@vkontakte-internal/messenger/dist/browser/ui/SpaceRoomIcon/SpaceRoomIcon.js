import React from 'react';
import { Icon20AdvertisingOutline, Icon20MessagesOutline, Icon20VoiceOutline, Icon20VolumeOutline, } from '@vkontakte/icons';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import cx from 'classnames';
export const SpaceRoomIcon = ({ kind, className }) => {
    switch (kind) {
        case 'RoomChat':
            return React.createElement(Icon20MessagesOutline, { className: cx(className) });
        case 'RoomChannel':
            return React.createElement(Icon20AdvertisingOutline, { className: cx(className) });
        case 'RoomCall':
            return React.createElement(Icon20VolumeOutline, { className: cx(className) });
        case 'RoomTribune':
            return React.createElement(Icon20VoiceOutline, { className: cx(className) });
        default:
            exhaustivenessCheck(kind);
    }
};
//# sourceMappingURL=SpaceRoomIcon.js.map