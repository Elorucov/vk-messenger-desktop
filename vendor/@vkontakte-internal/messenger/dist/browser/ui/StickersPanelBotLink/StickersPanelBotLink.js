import '../../ui/StickersPanelBotLink/StickersPanelBotLink.css';
import React, { useMemo } from 'react';
import { useColorScheme, Image } from '@vkontakte/vkui';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
const POSSIBLE_IMAGE_SIZES = [64, 128, 256];
const MAX_IMAGE_SIZE = 256;
export const StickersPanelBotLink = function StickersPanelBotLink({ size, onOpenStickersSuggestionsBot, }) {
    const { lang, vkDomain } = useBrowserEnv();
    const { vas_suggests_bot_link: isEnabled } = useFeatureFlags();
    const theme = useColorScheme();
    const imageSize = useMemo(() => {
        const imageSizeIncludesRetina = (window.devicePixelRatio ?? 1) * size;
        return (POSSIBLE_IMAGE_SIZES.find((size) => size >= imageSizeIncludesRetina) ??
            MAX_IMAGE_SIZE);
    }, [size]);
    return isEnabled ? (React.createElement("div", { className: "StickersPanelBotLink", onClick: onOpenStickersSuggestionsBot },
        React.createElement(Image, { size: size, src: `https://${vkDomain}/images/stickers_suggestions_bot_${theme}_${imageSize}.png`, alt: lang.use('me_suggestions_bot_link') }))) : null;
};
//# sourceMappingURL=StickersPanelBotLink.js.map