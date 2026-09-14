import '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistControlButton.css';
import React from 'react';
import cx from 'classnames';
export const AttachAudioPlaylistControlButton = ({ mode, ariaLabel, children, ...rest }) => {
    return (React.createElement("button", { className: cx('AttachAudioPlaylistControlButton', {
            [`AttachAudioPlaylistControlButton--mode-${mode}`]: !!mode,
        }), "aria-label": ariaLabel, ...rest }, children));
};
//# sourceMappingURL=AttachAudioPlaylistControlButton.js.map