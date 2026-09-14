import { Button } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv } from '../../hooks/misc';
import React from 'react';
import { Icon16Services } from '@vkontakte/icons';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
export const OpenAppButton = ({ button, ...other }) => {
    const { botKeyboard } = useBrowserEnv();
    return (React.createElement(Button, { ...other, mode: button.mode, appearance: button.appearance, title: button.label, onClick: () => {
            botKeyboard.openApp(button.appId, button.hash, button.ownerId);
        }, before: React.createElement(Icon16Services, null) },
        React.createElement(TextWithEmoji, { text: button.label })));
};
//# sourceMappingURL=OpenAppButton.js.map