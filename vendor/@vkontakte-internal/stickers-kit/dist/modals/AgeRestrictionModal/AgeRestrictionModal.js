import { jsx as _jsx } from "react/jsx-runtime";
import { Icon5618CircleOutline } from '@vkontakte/icons';
import { ModalCardBase, Button } from '@vkontakte-internal/vkcom-kit';
import { LangPackProvider, useLangPack } from '@vkontakte-internal/langs';
import { LANG_PACK_NAME } from '../constant';
const ModalComponent = ({ onClose }) => {
    const { translate } = useLangPack();
    return (_jsx(ModalCardBase, { onClose: onClose, icon: _jsx(Icon5618CircleOutline, {}), header: translate('stickers_kit_ugc_age_restriction_modal_title'), subheader: translate('stickers_kit_ugc_age_restriction_modal_text'), actions: _jsx(Button, { size: "l", mode: "secondary", stretched: true, onClick: onClose, children: translate('stickers_kit_ugc_age_restriction_modal_button') }) }));
};
export const AgeRestrictionModal = ({ onClose, ...langPackProps }) => {
    return (_jsx(LangPackProvider, { ...langPackProps, name: LANG_PACK_NAME, children: _jsx(ModalComponent, { onClose: onClose }) }));
};
//# sourceMappingURL=AgeRestrictionModal.js.map