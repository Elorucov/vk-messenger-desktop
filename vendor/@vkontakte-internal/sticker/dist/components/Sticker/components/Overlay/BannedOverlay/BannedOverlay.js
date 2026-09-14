import { jsx as _jsx } from "react/jsx-runtime";
import { Icon24BlockOutline } from '@vkontakte/icons';
import { useLangPack } from '@vkontakte-internal/langs';
import { Overlay } from '../Overlay';
export function BannedOverlay() {
    const { translate } = useLangPack();
    return _jsx(Overlay, { icon: _jsx(Icon24BlockOutline, {}), description: translate('stickers_kit_sticker_banned') });
}
//# sourceMappingURL=BannedOverlay.js.map