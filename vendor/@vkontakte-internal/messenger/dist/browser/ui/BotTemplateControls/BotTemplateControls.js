import React from 'react';
import { BotButton } from '../../ui/BotButton/BotButton';
import '../../ui/BotTemplateControls/BotTemplateControls.css';
import { Headline, Subhead } from '@vkontakte/vkui';
import { Link, ExternalLink } from '../../ui/Link/Link';
import * as Attach from '../../../core/model/Attach';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
export const BotTemplateControls = ({ template, onClick, onCallbackButtonClick, authorId, cmid, }) => {
    return (React.createElement("div", { className: "BotTemplateControls" },
        React.createElement(BotTemplateWrapper, { template: template },
            template.photo && (React.createElement("div", { className: "BotTemplateControls__photo", style: {
                    backgroundImage: `url(${Attach.preview(template.photo, 260 * window.devicePixelRatio)
                        ?.url}`,
                } })),
            template.title && (React.createElement("div", { className: "BotTemplateControls__title" },
                React.createElement(Headline, { level: "1", weight: "1", Component: "h4", useAccentWeight: true },
                    React.createElement(TextWithEmoji, { text: template.title })))),
            template.description && (React.createElement("div", { className: "BotTemplateControls__description" },
                React.createElement(Subhead, { weight: "3", useAccentWeight: true },
                    React.createElement(TextWithEmoji, { text: template.description }))))),
        React.createElement("div", { className: "BotTemplateControls__buttons", role: "menu" }, template.buttons.map((button, id) => (React.createElement("div", { className: "BotTemplateControls__button", key: id, role: "presentation" },
            React.createElement(BotButton, { button: button, onClick: onClick, onCallbackButtonClick: onCallbackButtonClick, authorId: authorId, cmid: cmid, inline: true })))))));
};
const BotTemplateWrapper = ({ template, children }) => {
    switch (template.kind) {
        case 'Link':
            return (React.createElement(ExternalLink, { className: "BotTemplateControls__link", href: template.link }, children));
        case 'Photo':
            return (React.createElement(Link, { className: "BotTemplateControls__link", to: { kind: 'AttachMediaProxyRoute', attach: template.photo } }, children));
        case 'Simple':
            return React.createElement(React.Fragment, null, children);
        default:
            return exhaustivenessCheck(template);
    }
};
//# sourceMappingURL=BotTemplateControls.js.map