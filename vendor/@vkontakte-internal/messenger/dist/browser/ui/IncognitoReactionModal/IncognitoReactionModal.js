import React from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv } from '../../hooks/misc';
import { Button } from '@vkontakte/vkui';
export const IncognitoReactionModal = ({ onClose, onSubmit, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), title: lang.use('me_incognito_reaction_title'), buttons: [
            React.createElement(Button, { key: "cancel", onClick: onClose, mode: "secondary" }, lang.use('me_cancel')),
            React.createElement(Button, { key: "submit", onClick: onSubmit, mode: "primary" }, lang.use('me_incognito_reaction_action')),
        ] }, lang.use('me_incognito_reaction_text')));
};
//# sourceMappingURL=IncognitoReactionModal.js.map