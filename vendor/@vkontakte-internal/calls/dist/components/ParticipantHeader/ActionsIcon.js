import { jsx as _jsx } from "react/jsx-runtime";
import { Icon16MoreVertical } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { IconButton } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
export function ActionsIcon({ getRootRef, onClick }) {
    const { getLang } = useLang();
    return (_jsx("div", { className: classNames('Participant__more', 'Participant__more--withAnimation'), ref: getRootRef, children: _jsx(IconButton, { label: getLang('calls_actions'), "data-testid": "calls_participant_list_item_menu_button", onClick: onClick, hasHover: false, hasActive: false, children: _jsx(Icon16MoreVertical, {}) }) }));
}
//# sourceMappingURL=ActionsIcon.js.map