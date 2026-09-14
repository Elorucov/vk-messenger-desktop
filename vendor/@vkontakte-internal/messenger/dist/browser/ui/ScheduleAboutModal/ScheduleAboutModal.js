import React from 'react';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { Footnote, Text, Title, Button } from '@vkontakte/vkui';
import { Icon180IllustrationNotificationsSferum } from '@vkontakte-internal/icons-private';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon20Cancel } from '@vkontakte/icons';
import '../../ui/ScheduleAboutModal/ScheduleAboutModal.css';
export const ScheduleAboutModal = ({ onClose }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalView, { onEscape: onClose },
        React.createElement(ModalBackdrop, { onClick: onClose },
            React.createElement("div", { className: "ScheduleAboutModal__content" },
                React.createElement("button", { className: "ScheduleAboutModal__closer", "aria-label": lang.use('me_close'), onClick: onClose },
                    React.createElement("span", { className: "ScheduleAboutModal__closerContent" },
                        React.createElement(Icon20Cancel, { color: "#fff" }))),
                React.createElement("div", { className: "ScheduleAboutModal__image" },
                    React.createElement(Icon180IllustrationNotificationsSferum, null)),
                React.createElement("div", null,
                    React.createElement(Title, { level: "2", className: "ScheduleAboutModal__title" }, lang.use('me_schedule_modal_title')),
                    React.createElement("div", { className: "ScheduleAboutModal__cell" },
                        React.createElement(Text, null, lang.use('me_schedule_modal_item_1_title')),
                        React.createElement(Footnote, { className: "ScheduleAboutModal__desc" }, lang.use('me_schedule_modal_item_1_desc'))),
                    React.createElement("div", { className: "ScheduleAboutModal__cell" },
                        React.createElement(Text, null, lang.use('me_schedule_modal_item_2_title')),
                        React.createElement(Footnote, { className: "ScheduleAboutModal__desc" }, lang.use('me_schedule_modal_item_2_desc'))),
                    React.createElement("div", { className: "ScheduleAboutModal__cell" },
                        React.createElement(Text, null, lang.use('me_schedule_modal_item_3_title')),
                        React.createElement(Footnote, { className: "ScheduleAboutModal__desc" }, lang.use('me_schedule_modal_item_3_desc'))),
                    React.createElement("div", { className: "ScheduleAboutModal__cell" },
                        React.createElement(Text, null, lang.use('me_schedule_modal_item_4_title')),
                        React.createElement(Footnote, { className: "ScheduleAboutModal__desc" }, lang.use('me_schedule_modal_item_4_desc'))),
                    React.createElement("div", { className: "ScheduleAboutModal__action" },
                        React.createElement(Button, { size: "m", onClick: onClose }, lang.use('me_schedule_modal_button_text'))))))));
};
//# sourceMappingURL=ScheduleAboutModal.js.map