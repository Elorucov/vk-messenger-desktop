import React from 'react';
import cx from 'classnames';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import { Icon20GiftOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/ConvoProfileSendGiftLink/ConvoProfileSendGiftLink.css';
import { Link } from '../../ui/Link/Link';
/**
 * Ссылка на каталог подарков для отправки подарка конкретному юзеру
 */
export const ConvoProfileSendGiftLink = ({ peerId, className, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(InfoCell, { left: React.createElement("div", { className: "ConvoProfileSendGiftLink__icon" },
            React.createElement(Icon20GiftOutline, null)), className: cx('ConvoProfileSendGiftLink', className) },
        React.createElement(Link, { className: "ConvoProfileSendGiftLink__link", to: {
                kind: 'GiftsCatalogProxyRoute',
                peerId,
                send: true,
                ref: 'msg_profile_direct',
            } }, lang.use('me_profile_send_gift_link'))));
};
//# sourceMappingURL=ConvoProfileSendGiftLink.js.map