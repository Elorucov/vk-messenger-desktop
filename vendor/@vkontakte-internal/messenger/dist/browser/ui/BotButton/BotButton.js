import '../../ui/BotButton/BotButton.css';
import React from 'react';
import { LinkButton } from '../../ui/BotButton/LinkButton';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { LocationButton } from '../../ui/BotButton/LocationButton';
import { VKPayButton } from '../../ui/BotButton/VKPayButton';
import { OpenAppButton } from '../../ui/BotButton/OpenAppButton';
import { CallbackButton } from '../../ui/BotButton/CallbackButton';
import { VK_PAY_APP_ID } from '../../../core/config/config';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
export const BotButton = ({ button, onClick, onCallbackButtonClick, inline, isCompact, cmid, authorId, className, }) => {
    const baseProps = {
        stretched: true,
        size: inline || isCompact ? 's' : 'm',
        role: 'menuitem',
        className,
    };
    if (button.type === 'text') {
        return (React.createElement(Button, { title: button.label, ...baseProps, mode: button.mode, appearance: button.appearance, onClick: () => onClick({
                type: 'text',
                payload: button.payload,
                text: button.label,
            }) },
            React.createElement(TextWithEmoji, { text: button.label })));
    }
    if (button.type === 'open_link' || button.type === 'open_modal_view') {
        return React.createElement(LinkButton, { button: button, authorId: authorId, ...baseProps });
    }
    if (button.type === 'location') {
        return (React.createElement(LocationButton, { ...baseProps, onClick: (lat, long) => {
                onClick({
                    type: 'location',
                    geo: { lat, long },
                    payload: button.payload,
                });
            } }));
    }
    if (button.type === 'vkpay' ||
        (button.type === 'open_app' && button.appId === VK_PAY_APP_ID)) {
        return React.createElement(VKPayButton, { button: button, ...baseProps });
    }
    if (button.type === 'open_app') {
        return React.createElement(OpenAppButton, { button: button, ...baseProps });
    }
    if (button.type === 'callback') {
        return (React.createElement(CallbackButton, { ...baseProps, button: button, cmid: cmid, authorId: authorId, onCallbackButtonClick: onCallbackButtonClick }));
    }
    return null;
};
//# sourceMappingURL=BotButton.js.map