import React from 'react';
import { Button, Flex } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv } from '../../hooks/misc';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import './TagRemoveConfirmModal.css';
export function TagRemoveConfirmModal({ onClose, onSubmit, tag, }) {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalInterface, { buttons: [
            React.createElement(Button, { appearance: "accent", key: "cancel", mode: "secondary", onClick: onClose, size: "m" }, lang.use('me_cancel')),
            React.createElement(Button, { appearance: "accent", key: "submit", mode: "primary", onClick: onSubmit, size: "m" }, lang.use('me_remove')),
        ], closeLabel: lang.use('me_close'), onClose: onClose, panelClass: "TagRemoveConfirmModal", title: lang.use('me_tag_remove_confirm_modal_title') },
        React.createElement(Flex, { className: "TagRemoveConfirmModal__content", justify: "center" }, lang.use('me_tag_remove_confirm_modal_message', {
            num: tag.uses,
            values: { tag_name: tag.name },
        }))));
}
//# sourceMappingURL=TagRemoveConfirmModal.js.map