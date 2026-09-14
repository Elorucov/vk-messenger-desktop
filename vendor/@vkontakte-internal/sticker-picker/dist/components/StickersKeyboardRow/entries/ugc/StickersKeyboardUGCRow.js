import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLangPack } from '@vkontakte-internal/langs';
import { HelpHintId, StickersUGCKeyboardOnboardingResourceKey, useHelpHintResource, } from '@vkontakte-internal/help-hints';
import { StickersKeyboardRowCard } from '../../StickersKeyboardRowCard/StickersKeyboardRowCard';
import { hideUGCOnboarding } from '../../../../model/stickers/ugc/hideOnboarding';
import { useStickersKeyboard } from '../../../../hooks/stickersKeyboard';
export function StickersKeyboardUGCRow() {
    const { translate } = useLangPack();
    const { onUGCEditClick } = useStickersKeyboard();
    const image = useHelpHintResource(HelpHintId.STICKERS_UGC_KEYBOARD_ONBOARDING, StickersUGCKeyboardOnboardingResourceKey.IMAGE);
    return (_jsx(StickersKeyboardRowCard, { title: translate('stickers_picker_ugc_create_title'), image: {
            src: image,
            width: 240,
            height: 64,
        }, action: onUGCEditClick && (_jsx(Button, { size: "s", mode: "outline", appearance: "accent", onClick: onUGCEditClick, children: translate('stickers_picker_ugc_create_action') })), onHide: hideUGCOnboarding }));
}
//# sourceMappingURL=StickersKeyboardUGCRow.js.map