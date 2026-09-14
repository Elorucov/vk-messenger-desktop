import { jsx as _jsx } from "react/jsx-runtime";
import { useLangPack } from '@vkontakte-internal/langs';
import { Icon2418CircleOutline } from '@vkontakte/icons';
import { Overlay } from '../Overlay';
export function AgeRestrictedOverlay() {
    const { translate } = useLangPack();
    return (_jsx(Overlay, { icon: _jsx(Icon2418CircleOutline, {}), description: translate('stickers_kit_sticker_age_restricted') }));
}
//# sourceMappingURL=AgeRestrictedOverlay.js.map