import '../../ui/SpaceRoomUpsert/SpaceRoomUpsertModal.css';
import React from 'react';
import { Button } from '@vkontakte/vkui';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv } from '../../hooks/misc';
export const SpaceRoomUpsertModal = ({ title, isLoadingSubmit, hasFormError, submitText, footerHint, onClose, handleSubmit, isHidden, children, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalInterface, { isHidden: isHidden, contextClass: "MEConfig", title: title, onClose: onClose, closeLabel: lang.use('me_close'), withCustomLayout: true, footerHint: footerHint, buttons: React.createElement(React.Fragment, null,
            React.createElement(Button, { size: "m", mode: "secondary", onClick: onClose, disabled: isLoadingSubmit }, lang.use('me_cancel')),
            React.createElement(Button, { size: "m", mode: "primary", onClick: handleSubmit, disabled: hasFormError, loading: isLoadingSubmit }, submitText)) },
        React.createElement("div", { className: "SpaceRoomUpsertModal__form" }, children)));
};
//# sourceMappingURL=SpaceRoomUpsertModal.js.map