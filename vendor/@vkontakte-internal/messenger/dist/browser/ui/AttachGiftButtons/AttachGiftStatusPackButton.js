import { Button } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import React from 'react';
import { useRouter } from '../../ui/Router/Router';
import * as Attach from '../../../core/model/Attach';
import { STATUSES_APP_ID } from '../../../core/config/config';
export const AttachGiftStatusPackButton = ({ gift, message }) => {
    const { lang } = useBrowserEnv();
    const { navigate } = useRouter();
    const handleOpenStatusesCatalog = (event) => {
        if (!gift.statusPack?.url) {
            return;
        }
        event.stopPropagation();
        navigate({
            kind: 'MiniAppModal',
            miniAppId: Attach.resolveMiniAppId(STATUSES_APP_ID),
            webviewUrl: gift.statusPack.url,
        });
    };
    return (React.createElement(Button, { size: "s", stretched: true, onClick: handleOpenStatusesCatalog }, message && message.kind !== 'Foreign' && !message.isOut
        ? lang.use('me_attaches_gift_snippet_image_status_pack_open')
        : lang.use('me_attaches_gift_snippet_image_status_pack_show')));
};
//# sourceMappingURL=AttachGiftStatusPackButton.js.map