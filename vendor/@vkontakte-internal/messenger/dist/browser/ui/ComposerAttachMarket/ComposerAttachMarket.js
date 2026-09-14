import React from 'react';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { Icon20MarketOutline, Icon24MarketOutline } from '@vkontakte/icons';
export const ComposerAttachMarket = ({ market, isCompactView, }) => {
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20MarketOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24MarketOutline, null) })), main: market.title, secondary: market.price }));
};
//# sourceMappingURL=ComposerAttachMarket.js.map