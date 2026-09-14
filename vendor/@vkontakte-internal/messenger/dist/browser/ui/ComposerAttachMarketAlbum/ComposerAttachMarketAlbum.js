import React from 'react';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { Icon20MarketOutline, Icon24MarketOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
export const ComposerAttachMarketAlbum = ({ marketAlbum, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20MarketOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24MarketOutline, null) })), main: marketAlbum.title, secondary: lang.use('me_attaches_market_album_goods', {
            num: marketAlbum.count,
        }) }));
};
//# sourceMappingURL=ComposerAttachMarketAlbum.js.map