import React from 'react';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { Icon72VkPayLogo } from '@vkontakte-internal/icons-private';
import { useBrowserEnv } from '../../hooks/misc';
export const VKPayButton = ({ button, ...other }) => {
    const { botKeyboard, lang } = useBrowserEnv();
    const [beforeLogoLabel, afterLogoLabel] = lang
        .use('me_keyboard_label_pay_with_vkpay', {
        values: {
            vkpay: 'logo',
        },
    })
        .split('logo');
    function onClick() {
        botKeyboard.openApp(button.appId, button.hash, button.type === 'open_app' ? button.ownerId : undefined);
    }
    return (React.createElement(Button, { mode: "primary", ...other, onClick: onClick },
        React.createElement("div", { className: "BotButton__vkpay" },
            beforeLogoLabel,
            React.createElement(Icon72VkPayLogo, { height: 16, width: 55 }),
            afterLogoLabel)));
};
//# sourceMappingURL=VKPayButton.js.map