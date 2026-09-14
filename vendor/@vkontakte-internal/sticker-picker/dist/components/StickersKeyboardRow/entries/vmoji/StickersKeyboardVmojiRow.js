import { jsx as _jsx } from "react/jsx-runtime";
import { useLangPack } from '@vkontakte-internal/langs';
import { Button, Appearance, useAppearance } from '@vkontakte-internal/vkcom-kit';
import { HelpHintId, KeyboardStickersVmojiResourceKey, useHelpHintResource, } from '@vkontakte-internal/help-hints';
import { StickersKeyboardRowCard, } from '../../StickersKeyboardRowCard/StickersKeyboardRowCard';
import { useStickersKeyboard } from '../../../../hooks/stickersKeyboard';
import { useAPI } from '../../../../hooks/api';
export function StickersKeyboardVmojiRow(props) {
    const appearance = useAppearance();
    const { translate } = useLangPack();
    const { onVmojiCreateClick } = useStickersKeyboard();
    const api = useAPI();
    const reloadCache = () => api.cache.reload();
    const image = useHelpHintResource(HelpHintId.KEYBOARD_STICKERS_VMOJI, appearance === Appearance.LIGHT
        ? KeyboardStickersVmojiResourceKey.VMOJI_ON_BOARDING_LIGHT
        : KeyboardStickersVmojiResourceKey.VMOJI_ON_BOARDING_DARK);
    return (_jsx(StickersKeyboardRowCard, { image: {
            src: image,
            width: 221,
            height: 130,
        }, action: onVmojiCreateClick && (_jsx(Button, { size: "s", mode: "outline", appearance: "accent", onClick: (event) => onVmojiCreateClick?.(event, reloadCache), children: translate('stickers_picker_vmoji_create_character') })), ...props }));
}
//# sourceMappingURL=StickersKeyboardVmojiRow.js.map