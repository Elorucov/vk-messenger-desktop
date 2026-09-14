import '../../ui/AttachMarket/AttachMarket.css';
import React from 'react';
import { AttachCard } from '../../ui/AttachCard/AttachCard';
import { Icon24MarketOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
export const AttachMarket = ({ market, isInBubble, isOut, }) => {
    const { router, lang } = useBrowserEnv();
    // Для изолированного режима закрываем интерактивный еком
    const url = router.checkIsolation()
        ? null
        : router.toUrl({ kind: 'AttachProxyRoute', attach: market });
    const attachType = market.isService
        ? lang.use('me_attaches_service')
        : lang.use('me_attaches_market');
    const price = (React.createElement(React.Fragment, null,
        `${attachType} · ${market.price}`,
        market.priceOld && (React.createElement(React.Fragment, null,
            "\u00A0",
            React.createElement("span", { className: "AttachMarket__priceOld" }, market.priceOld)))));
    return (React.createElement(AttachCard, { href: url, title: market.title, subtitle: price, picture: market.photo, picturePlaceholder: React.createElement(Icon24MarketOutline, null), alt: market.title, isInBubble: isInBubble, isOut: isOut }));
};
//# sourceMappingURL=AttachMarket.js.map