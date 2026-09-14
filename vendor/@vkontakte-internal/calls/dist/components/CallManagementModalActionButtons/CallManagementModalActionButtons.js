import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useLang } from '../../hooks/useLang';
import { ETabName } from '../AddParticipants/interfaces';
import { Icon16Phone } from '@vkontakte/icons';
import { Button } from '@vkontakte-internal/vkcom-kit';
export const CallManagementModalActionButtons = ({ isAddSubmitDisabled, onAdd, onAddAll, tab, showCallAll, }) => {
    const { getLang } = useLang();
    return (_jsxs(_Fragment, { children: [tab === ETabName.Participants && showCallAll && (_jsx(Button, { before: _jsx(Icon16Phone, {}), size: "m", mode: "secondary", onClick: onAddAll, children: getLang('calls_call_all') })), _jsx(Button, { mode: "primary", size: "m", disabled: isAddSubmitDisabled, onClick: onAdd, children: getLang('calls_add') })] }));
};
//# sourceMappingURL=CallManagementModalActionButtons.js.map