import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BaseModal } from '../BaseModal/BaseModal';
import { ModalHeader, ModalFooter } from '../CallsModal';
import { Icon20CheckAlt } from '@vkontakte/icons';
import { AppRootProvider, Placeholder, Search, Cell, RichAvatar, Group, Panel, Headline, View, SplitLayout, SplitCol, Spacing, Div, } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import styles from './CallByNameModal.module.css';
export const CallByNameModal = ({ items, actionButtons, onListItemClick, selectedId, onClose, onSearchChange, }) => {
    const { getLang } = useLang();
    const getListItem = (item, selectedId) => {
        return (_jsx(Cell, { onClick: () => onListItemClick(item.id), after: selectedId === item.id && _jsx(Icon20CheckAlt, {}), before: _jsx(RichAvatar, { src: item.photo, alt: item.name || '', nft: item.isNFT, size: 40 }), "data-testid": `calls_call_by_name_item_${item.id}`, children: item.name }, item.id));
    };
    return (_jsx(BaseModal, { className: styles.callByNameModal, onClose: onClose, children: _jsxs(AppRootProvider, { children: [_jsx(ModalHeader, { title: getLang('calls_call_by_name_title'), onClose: onClose }), _jsx(SplitLayout, { children: _jsx(SplitCol, { width: 560, children: _jsxs(Div, { children: [_jsx(Search, { placeholder: getLang('calls_call_by_name_search_placeholder'), onChange: onSearchChange, onInput: onSearchChange, onPaste: onSearchChange, "data-testid": "calls_call_by_name_search" }), _jsx(View, { activePanel: "list", children: _jsx(Panel, { id: "list", mode: "plain", children: _jsxs(Group, { mode: "plain", children: [_jsx(Cell, { children: _jsx(Headline, { level: "1", children: `${getLang('calls_call_by_name_list_header')} ${items.length || ''}` }) }), items.length !== 0 && items.map((item) => getListItem(item, selectedId)), items.length === 0 && (_jsx(Placeholder, { children: getLang('calls_call_by_name_not_found') }))] }) }) }), _jsx(Spacing, { size: 16 })] }) }) }), _jsx(ModalFooter, { actionButtons: actionButtons })] }) }));
};
//# sourceMappingURL=CallByNameModal.js.map