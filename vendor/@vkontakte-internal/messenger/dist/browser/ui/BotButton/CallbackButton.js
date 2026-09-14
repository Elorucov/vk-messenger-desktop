import { Button } from '@vkontakte-internal/vkcom-kit';
import React, { useState, useEffect } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
export const CallbackButton = ({ onCallbackButtonClick, authorId, cmid, button, ...props }) => {
    const { botKeyboard } = useBrowserEnv();
    const [isLoading, setLoading] = useState(false);
    const [eventId, setEventId] = useState();
    useEffect(() => {
        const unsubscribe = botKeyboard.subscribe((event) => {
            if (event.id === eventId) {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [botKeyboard, eventId]);
    return (React.createElement(Button, { ...props, loading: isLoading, title: button.label, mode: button.mode, appearance: button.appearance, onClick: async () => {
            try {
                setLoading(true);
                const response = await onCallbackButtonClick(button.payload, authorId, cmid);
                setEventId(response);
                botKeyboard.addEventId(response);
            }
            catch {
                setLoading(false);
            }
        } },
        React.createElement(TextWithEmoji, { text: button.label })));
};
//# sourceMappingURL=CallbackButton.js.map