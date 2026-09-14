import React from 'react';
import { useBrowserEnv, usePixelDensity } from '../../hooks/misc';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import './NotificationsGuide.css';
export const NotificationsGuide = ({ notificationUnblockPics, onClose }) => {
    const { lang } = useBrowserEnv();
    const isDense = usePixelDensity();
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), withCustomLayout: true, panelClass: "NotificationsGuide", headerClass: "NotificationsGuide__header", title: React.createElement(React.Fragment, null,
            React.createElement("div", { className: "NotificationsGuide__title" }, lang.use('me_settings_notifications_guide_title')),
            React.createElement("div", { className: "NotificationsGuide__subtitle" }, lang.use('me_settings_notifications_guide_subtitle'))) },
        React.createElement("div", { className: "NotificationsGuide__content" },
            React.createElement("ol", { className: "NotificationsGuide__list" },
                React.createElement("li", null,
                    " ",
                    lang.use('me_settings_notifications_guide_step1')),
                React.createElement("li", null, lang.use('me_settings_notifications_guide_step2')),
                React.createElement("li", null, lang.use('me_settings_notifications_guide_step3', {
                    values: { domain: window.location.host },
                }))),
            notificationUnblockPics && (React.createElement("div", { className: "NotificationsGuide__preview" },
                React.createElement("div", { className: "NotificationsGuide__previewText" }, lang.use('me_settings_notifications_guide_another')),
                React.createElement("img", { className: "NotificationsGuide__img", src: isDense
                        ? notificationUnblockPics[1]
                        : notificationUnblockPics[0], alt: lang.use('me_settings_notifications_guide_title') }))))));
};
//# sourceMappingURL=NotificationsGuide.js.map