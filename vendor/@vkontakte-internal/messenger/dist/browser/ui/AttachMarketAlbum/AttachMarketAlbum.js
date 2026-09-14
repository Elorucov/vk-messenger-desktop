import '../../ui/AttachMarketAlbum/AttachMarketAlbum.css';
import React from 'react';
import * as Attach from '../../../core/model/Attach';
import { getExpectedAttachPhotoWidth } from '../../ui/AttachCard/AttachCard';
import { useBrowserEnv } from '../../hooks/misc';
import { Link } from '../../ui/Link/Link';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import { Icon24MarketOutline } from '@vkontakte/icons';
export const AttachMarketAlbum = ({ marketAlbum, isInBubble, isOut, }) => {
    const { lang } = useBrowserEnv();
    const picture = Attach.preview(marketAlbum, getExpectedAttachPhotoWidth(), 0);
    return (React.createElement(Link, { to: {
            kind: 'AttachProxyRoute',
            attach: marketAlbum,
        }, className: "AttachMarketAlbum" },
        React.createElement(AttachmentCell, { isInBubble: isInBubble, isOut: isOut, title: marketAlbum.title, subtitle: [
                lang.use('me_attaches_market_album'),
                lang.use('me_attaches_market_album_goods', {
                    num: marketAlbum.count,
                }),
            ], image: picture?.url || React.createElement(Icon24MarketOutline, null) })));
};
//# sourceMappingURL=AttachMarketAlbum.js.map