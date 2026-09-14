import { jsx as _jsx } from "react/jsx-runtime";
import { Icon24DeleteOutline } from '@vkontakte/icons';
import { useLangPack } from '@vkontakte-internal/langs';
import { Overlay } from '../Overlay';
export function DeletedOverlay() {
    const { translate } = useLangPack();
    return _jsx(Overlay, { icon: _jsx(Icon24DeleteOutline, {}), description: translate('stickers_kit_sticker_deleted') });
}
//# sourceMappingURL=DeletedOverlay.js.map