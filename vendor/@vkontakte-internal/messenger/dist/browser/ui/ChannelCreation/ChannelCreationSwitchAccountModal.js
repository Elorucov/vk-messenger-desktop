import React, { useId } from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import './ChannelCreationSwitchAccountModal.css';
import { Icon56ErrorTriangleOutline } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { ModalCloseButton } from '../../ui/ModalCloseButton/ModalCloseButton';
export const ChannelCreationSwitchAccountModal = ({ handleClose, onSetAccount, onRegisterAccount }) => {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    const modalTitleId = useId();
    const setMainAccount = () => {
        const mainAccount = viewer.accounts.find((account) => account.profileType === 'normal');
        if (mainAccount) {
            onSetAccount(mainAccount.id);
        }
        else {
            onRegisterAccount('normal');
        }
    };
    return (React.createElement(ModalView, { onEscape: handleClose, contextClass: "MEConfig vkui__root" },
        React.createElement(ModalBackdrop, { onClick: handleClose },
            React.createElement(ModalPanel, { className: "ChannelCreationSwitchAccountModal__panel", topRight: React.createElement(ModalCloseButton, { closeLabel: lang.use('me_close'), onClose: handleClose, mode: "modalPanel" }), ariaLabelledby: modalTitleId },
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "ChannelCreationSwitchAccountModal" },
                        React.createElement(Icon56ErrorTriangleOutline, { fill: "var(--vkui--color_text_accent)" }),
                        React.createElement("div", { className: "ChannelCreationSwitchAccountModal__title", id: modalTitleId }, lang.use('me_channel_creation_switch_account_title')),
                        React.createElement("div", { className: "ChannelCreationSwitchAccountModal__description" }, lang.use('me_channel_creation_switch_account_description')),
                        React.createElement("div", { className: "ChannelCreationSwitchAccountModal__buttonWrapper" },
                            React.createElement(Button, { stretched: true, appearance: "accent", mode: "primary", size: "l", onClick: setMainAccount }, lang.use('me_channel_creation_switch_account')))))))));
};
//# sourceMappingURL=ChannelCreationSwitchAccountModal.js.map