import './GroupUnbanUserModal.css';
import React from 'react';
import { Button } from '@vkontakte/vkui';
import { Placeholder } from '@vkontakte-internal/vkcom-kit';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv } from '../../hooks/misc';
export const GroupUnbanUserModal = ({ onClose, onSubmit, peer }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), contextClass: "MEConfig GroupUnbanUserModal", title: lang.use('me_convo_group_unban_confirmation_modal_title'), buttons: React.createElement(React.Fragment, null,
            React.createElement(Button, { mode: "secondary", onClick: onClose, size: "m" }, lang.use('global_cancel')),
            React.createElement(Button, { onClick: onSubmit, size: "m" }, lang.use('me_convo_group_unban_confirmation_modal_submit'))) },
        React.createElement(Placeholder, { noPadding: true, className: "GroupUnbanUserModal__placeholder" }, lang.use('me_convo_group_unban_confirmation_modal_text', {
            values: { fullname: Peer.name(peer) },
        }))));
};
//# sourceMappingURL=GroupUnbanUserModal.js.map