import './ChannelFirstEntryModal.css';
import React, { useId } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { Button, Cell, Spacing, Title } from '@vkontakte/vkui';
import { Icon120IllustrationChannel } from '@vkontakte-internal/icons-private';
import { ModalCloseButton } from '../../ui/ModalCloseButton/ModalCloseButton';
export const ChannelFirstEntryModal = ({ handleModalClose, }) => {
    const { lang } = useBrowserEnv();
    const modalTitleId = useId();
    return (React.createElement(ModalView, { onEscape: handleModalClose, contextClass: "MEConfig vkui__root" },
        React.createElement(ModalBackdrop, { onClick: handleModalClose },
            React.createElement(ModalPanel, { className: "ChannelFirstEntryModal__panel", topRight: React.createElement(ModalCloseButton, { closeLabel: lang.use('me_close'), onClose: handleModalClose, mode: "modalPanel" }), ariaLabelledby: modalTitleId },
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "ChannelFirstEntryModal" },
                        React.createElement(Icon120IllustrationChannel, null),
                        React.createElement("div", { className: "ChannelFirstEntryModal__title", id: modalTitleId },
                            React.createElement(Cell, { subtitle: lang.use('me_channel_first_visit_modal_subtitle'), hasActive: false, hasHover: false, multiline: true },
                                React.createElement(Title, { level: '2' }, lang.use('me_channel_first_visit_modal_title')))),
                        React.createElement(Spacing, { size: 20 }),
                        React.createElement(Button, { size: "l", mode: "primary", appearance: "accent", onClick: handleModalClose }, lang.use('me_channel_ban_info_okay'))))))));
};
//# sourceMappingURL=ChannelFirstEntryModal.js.map