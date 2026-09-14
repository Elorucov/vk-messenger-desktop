import { Icon16Place } from '@vkontakte/icons';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv } from '../../hooks/misc';
import React, { useState } from 'react';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
export const LocationButton = ({ onClick, ...other }) => {
    const { geoLocation, lang } = useBrowserEnv();
    const [isLoading, setLoading] = useState(false);
    const label = lang.use('me_keyboard_label_location');
    return (React.createElement(Button, { ...other, loading: isLoading, before: React.createElement(Icon16Place, null), title: label, onClick: async () => {
            try {
                setLoading(true);
                const [lat, long] = await geoLocation.get();
                onClick(lat, long);
            }
            catch {
                // Игнорим ошибку, но можно добавить и ее вывод в модалку с ошибкой
            }
            finally {
                setLoading(false);
            }
        } },
        React.createElement(TextWithEmoji, { text: label })));
};
//# sourceMappingURL=LocationButton.js.map