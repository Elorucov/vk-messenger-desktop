import { jsx as _jsx } from "react/jsx-runtime";
import { ModalCardBase, Button } from '@vkontakte-internal/vkcom-kit';
import { Icon56UgcChatStickerOutline } from '@vkontakte/icons';
import { LangPackProvider, useLangPack } from '@vkontakte-internal/langs';
import { LANG_PACK_NAME } from '../constant';
const ModalComponent = ({ onClose }) => {
    const { translate } = useLangPack();
    return (_jsx(ModalCardBase, { onClose: onClose, icon: _jsx(Icon56UgcChatStickerOutline, {}), header: translate('stickers_kit_ugc_chat_restriction_modal_title'), subheader: translate('stickers_kit_ugc_chat_restriction_modal_text'), actions: _jsx(Button, { size: "l", mode: "secondary", stretched: true, onClick: onClose, children: translate('stickers_kit_ugc_chat_restriction_modal_button') }) }));
};
export const ChatRestrictionModal = ({ onClose, ...langPackProps }) => {
    return (_jsx(LangPackProvider, { ...langPackProps, name: LANG_PACK_NAME, children: _jsx(ModalComponent, { onClose: onClose }) }));
};
//# sourceMappingURL=ChatRestrictionModal.js.map