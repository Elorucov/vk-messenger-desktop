import React from 'react';
import cx from 'classnames';
import { useFeatureFlags } from '../../hooks/misc';
// Компонент-враппер для компонентов, визуально иммитирующих ConvoMessage,
// где не должно быть логики - только бабл
export const ConvoMessageLightBubble = ({ isOut, isWithoutBubblesTheme, className, children, }) => {
    const featureFlags = useFeatureFlags();
    return (React.createElement("div", { className: cx(className, ...(isWithoutBubblesTheme
            ? ['ConvoMessageWithoutBubble']
            : [
                'ConvoMessage',
                {
                    'ConvoMessage--out': isOut,
                    'ConvoMessage--in': !isOut,
                    'ConvoMessage--withNativeBackground': !featureFlags.vkm_posts_fast_reactions,
                },
            ])) },
        featureFlags.vkm_posts_fast_reactions && (React.createElement("div", { className: "ConvoMessage__background" })),
        children));
};
//# sourceMappingURL=ConvoMessageLightBubble.js.map