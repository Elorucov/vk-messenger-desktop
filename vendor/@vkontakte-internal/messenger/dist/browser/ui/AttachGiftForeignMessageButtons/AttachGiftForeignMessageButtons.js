import React from 'react';
import { Button } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { createGiftReplyReferrer } from '../../ui/AttachGift/helpers';
import { AttachGiftStatusPackButton } from '../../ui/AttachGiftButtons/AttachGiftStatusPackButton';
import { AttachGiftStatusButton } from '../../ui/AttachGiftButtons/AttachGiftStatusButton';
export const AttachGiftForeignMessageButtons = ({ gift, isContrastTheme, }) => {
    const { lang } = useBrowserEnv();
    const { navigate } = useRouter();
    if (gift.type === 'image_status_pack') {
        return React.createElement(AttachGiftStatusPackButton, { gift: gift });
    }
    if (gift.type === 'image_status') {
        return React.createElement(AttachGiftStatusButton, { gift: gift });
    }
    const buttonAppearance = isContrastTheme ? 'overlay' : undefined;
    const handleOpenGiftsCatalog = (event) => {
        event.stopPropagation();
        navigate({
            kind: 'GiftsCatalogProxyRoute',
            ref: createGiftReplyReferrer(gift.id),
        });
    };
    return (React.createElement(Button, { appearance: buttonAppearance, size: "s", stretched: true, onClick: handleOpenGiftsCatalog }, lang.use('me_gift_snippet_button_gift')));
};
//# sourceMappingURL=AttachGiftForeignMessageButtons.js.map