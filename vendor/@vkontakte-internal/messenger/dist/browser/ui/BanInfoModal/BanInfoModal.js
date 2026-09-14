import './BanInfoModal.css';
import React, { useId } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { Button, Cell, Spacing } from '@vkontakte/vkui';
import { Icon48BlockOutline } from '@vkontakte/icons';
import { ModalCloseButton } from '../../ui/ModalCloseButton/ModalCloseButton';
import { exhaustivenessCheck } from '../../../core/utils/misc';
export const BanInfoModal = ({ banInfo, handleModalClose, }) => {
    const { lang } = useBrowserEnv();
    const modalTitleId = useId();
    const getTextReason = () => {
        switch (banInfo.reason) {
            case 0 /* BanInfoReason.Other */:
                return lang.use('me_channel_ban_reason_name_other');
            case 1 /* BanInfoReason.Spam */:
                return lang.use('me_channel_ban_reason_name_spam');
            case 2 /* BanInfoReason.VerbalAbuse */:
                return lang.use('me_channel_ban_reason_name_harassment');
            case 3 /* BanInfoReason.StrongLanguage */:
                return lang.use('me_channel_ban_reason_name_profanity');
            case 4 /* BanInfoReason.Flood */:
                return lang.use('me_channel_ban_reason_name_irrelevant_messages');
            default:
                exhaustivenessCheck(banInfo.reason);
        }
    };
    return (React.createElement(ModalView, { onEscape: handleModalClose, contextClass: "MEConfig vkui__root" },
        React.createElement(ModalBackdrop, { onClick: handleModalClose },
            React.createElement(ModalPanel, { className: "BanInfoModal__panel", topRight: React.createElement(ModalCloseButton, { closeLabel: lang.use('me_close'), onClose: handleModalClose, mode: "modalPanel" }), ariaLabelledby: modalTitleId },
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "BanInfoModal" },
                        React.createElement(Icon48BlockOutline, { fill: "var(--vkui--color_text_accent)" }),
                        React.createElement("div", { className: "BanInfoModal__title", id: modalTitleId }, lang.use('me_channel_black_listed')),
                        React.createElement(Spacing, { size: 20 }),
                        React.createElement("div", { className: "BanInfoModal__description" },
                            banInfo.reason !== 0 /* BanInfoReason.Other */ && (React.createElement(Cell, { subtitle: getTextReason(), hasActive: false, hasHover: false }, lang.use('me_channel_ban_reason_title'))),
                            banInfo.comment && (React.createElement(Cell, { subtitle: banInfo.comment, hasActive: false, hasHover: false, multiline: true }, lang.use('me_channel_ban_reason_commentary')))),
                        React.createElement(Spacing, { size: 20 }),
                        React.createElement(Button, { size: 'l', mode: 'primary', appearance: 'accent', stretched: true, onClick: handleModalClose }, lang.use('me_channel_ban_info_okay'))))))));
};
//# sourceMappingURL=BanInfoModal.js.map