import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { useCallback, useState } from 'react';
import { CallsModal } from '../../components/CallsModal';
import { Checkbox } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
export const KickParticipantModal = ({ onClose, actionButtons, onAllowReconnectChange, description, allowBan, banText, isKickFromCall = true, }) => {
    const { getLang } = useLang();
    const [allow, setAllow] = useState(true);
    const onBanSettingChange = useCallback((event) => {
        const { checked } = event.target;
        if (onAllowReconnectChange) {
            onAllowReconnectChange(checked);
        }
        setAllow(checked);
    }, []);
    return (_jsx(CallsModal, { className: "KickParticipantModal", dataTestId: `calls${isKickFromCall ? '_call' : '_waiting_hall'}_kick_modal`, title: getLang('calls_kick_participant_title'), actionButtons: actionButtons, onClose: onClose, description: description, children: _jsxs("div", { className: "KickParticipantModal__content", "data-testid": `calls${isKickFromCall ? '_call' : '_waiting_hall'}_kick_content`, children: [description, allowBan && (_jsx("div", { className: "KickParticipantModal__checkbox", "data-testid": `calls${isKickFromCall ? '_call' : '_waiting_hall'}_kick_checkbox`, children: _jsx(Checkbox, { onChange: onBanSettingChange, checked: allow, children: banText }) }))] }) }));
};
//# sourceMappingURL=KickParticipantModal.js.map