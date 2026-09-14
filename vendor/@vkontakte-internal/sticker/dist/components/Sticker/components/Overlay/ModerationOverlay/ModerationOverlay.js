import { jsx as _jsx } from "react/jsx-runtime";
import { Icon24ClockOutline } from '@vkontakte/icons';
import { useLangPack } from '@vkontakte-internal/langs';
import { Overlay } from '../Overlay';
export function ModerationOverlay() {
    const { translate } = useLangPack();
    return (_jsx(Overlay, { icon: _jsx(Icon24ClockOutline, {}), description: translate('stickers_kit_ugc_sticker_in_moderation') }));
}
//# sourceMappingURL=ModerationOverlay.js.map