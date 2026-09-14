import React, { useMemo } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { AlertInterface, } from '../../ui/AlertInterface/AlertInterface';
export const EditingNotAvailableModal = ({ handleClose, }) => {
    const { lang } = useBrowserEnv();
    const actions = useMemo(() => [
        {
            title: lang.use('me_editing_not_available_modal_action'),
            autoClose: true,
            mode: 'cancel',
        },
    ], [lang]);
    return (React.createElement(AlertInterface, { contextClass: "MEConfig", title: lang.use('me_editing_not_available_modal_title'), description: React.createElement(React.Fragment, null, lang.use('me_editing_not_available_modal_text')), actions: actions, onClose: handleClose }));
};
//# sourceMappingURL=EditingNotAvailableModal.js.map