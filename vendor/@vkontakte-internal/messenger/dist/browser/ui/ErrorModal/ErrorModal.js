import { Button } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import React, { memo } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
export const ErrorModal = memo(({ errorText, onClose }) => {
    const { lang } = useBrowserEnv();
    if (!errorText) {
        return null;
    }
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), onBack: onClose, contextClass: "MEConfig", title: lang.use('me_voice_recording_error_title'), buttons: React.createElement(Button, { onClick: onClose }, lang.use('me_close')) }, errorText));
});
//# sourceMappingURL=ErrorModal.js.map