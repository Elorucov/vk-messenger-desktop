import '../../ui/ConvoProfileUGCStickersToggle/ConvoProfileUGCStickersToggle.css';
import React, { useId } from 'react';
import { Switch } from '@vkontakte/vkui';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { Icon20UgcStickerOutline } from '@vkontakte-internal/icons-private';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import cx from 'classnames';
export const ConvoProfileUGCStickersToggle = ({ className, peerId, stickersParams, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const cellId = useId();
    return (React.createElement(InfoCell, { id: cellId, className: cx('ConvoProfileUGCStickersToggle', className), left: React.createElement("div", { className: "ConvoProfileUGCStickersToggle__icon" },
            React.createElement(Icon20UgcStickerOutline, null)), right: React.createElement(Switch, { checked: !stickersParams.isKeyboardHidden, "aria-labelledby": cellId, onChange: () => dispatch({
                type: 'UserChangedChatStickersDisplay',
                peerId,
                showChatStickers: Boolean(stickersParams.isKeyboardHidden),
            }) }) }, lang.use('me_convo_profile_show_ugc_stickers')));
};
//# sourceMappingURL=ConvoProfileUGCStickersToggle.js.map