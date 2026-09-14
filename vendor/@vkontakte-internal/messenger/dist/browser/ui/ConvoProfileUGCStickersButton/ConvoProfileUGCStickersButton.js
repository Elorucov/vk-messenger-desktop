import '../../ui/ConvoProfileUGCStickersButton/ConvoProfileUGCStickersButton.css';
import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import cx from 'classnames';
import { Link } from '../../ui/Link/Link';
import { UGC_STICKERS_MINI_APP_ID } from '../../../core/config/config';
import { Icon20UgcStickerOutline } from '@vkontakte-internal/icons-private';
import * as Attach from '../../../core/model/Attach';
import { Icon20ChevronRightOutline } from '@vkontakte/icons';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
export const ConvoProfileUGCStickersButton = ({ peerId, className, }) => {
    const { lang, stats } = useBrowserEnv();
    return (React.createElement(Link, { className: "ConvoProfileUGCStickersButton", to: {
            kind: 'MiniAppModal',
            miniAppId: Attach.resolveMiniAppId(UGC_STICKERS_MINI_APP_ID),
            hash: `peer_id=${peerId}`,
        } },
        React.createElement(InfoCell, { className: cx('ConvoProfileUGCStickersButton__cell', className), left: React.createElement("div", { className: "ConvoProfileUGCStickersButton__leftIcon" },
                React.createElement(Icon20UgcStickerOutline, null)), onClick: () => {
                stats.logEvent({
                    type: 'type_action',
                    type_action: {
                        type: 'type_messaging_action_item',
                        type_messaging_action_item: {
                            action_type: 'show_all_sticker_chat',
                            label: getLogEventLabel(),
                        },
                    },
                });
            }, right: React.createElement("div", { className: "ConvoProfileUGCStickersButton__rightIcon" },
                React.createElement(Icon20ChevronRightOutline, null)) }, lang.use('me_convo_profile_ugc_stickers'))));
};
//# sourceMappingURL=ConvoProfileUGCStickersButton.js.map