import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { useState } from 'react';
import { Button, Spinner, Group, Header, getColorClass, RichAvatar, Spacing, Separator, SimpleCell, Search, Text, CellButton, EllipsisText, } from '@vkontakte-internal/vkcom-kit';
import { KeyboardCodes } from '@vkontakte-internal/calls-core';
import { useLang } from '../../hooks/useLang';
import { CallManagementModal } from '../CallManagementModal/CallManagementModal';
export const TransferAdminRightsModal = ({ participants, participantsCount, selected, onSelect, onClose, onCallForceFinish, onRightsTransfer, onSearch, isCreator, isRepeatedCall, loading, loadingList, getNextPage, isNextPage, }) => {
    const { getLang } = useLang();
    const [hoveredPeerId, setHoveredPeerId] = useState(null);
    return (_jsx(CallManagementModal, { title: getLang('calls_dialog_creator_exit_title'), onCloseModal: onClose, dataTestId: "calls_transfer_admin_rights_modal_root", actionButtons: _jsxs(_Fragment, { children: [isCreator && (_jsx(Button, { size: "m", "data-testid": "calls_exit_call_button_force_finish", mode: "secondary", onClick: onCallForceFinish, children: isRepeatedCall
                        ? getLang('calls_exit_call_disconnect_all')
                        : getLang('calls_force_call_finish') }, "force")), _jsx(Button, { size: "m", "data-testid": selected === null
                        ? 'calls_exit_call_button_exit'
                        : 'calls_transfer_admin_rights_modal_button__transfer_exit', "data-focus-first": true, onClick: onRightsTransfer, children: selected === null ? getLang('calls_leave_call') : getLang('calls_dialog_creator_exit_action') }, "action")] }), children: _jsxs("div", { className: "TransferAdminRightsModal__content", children: [loadingList && (_jsx("div", { className: "TransferAdminRightsModal__content__spinner", children: _jsx(Spinner, { size: "large" }) })), _jsx(Spacing, { size: 8 }), _jsx(Search, { "data-testid": "calls_transfer_admin_rights_modal_search", onChange: (e) => onSearch(e.target.value), placeholder: getLang('calls_search_participants_placeholder') }), _jsxs(Group, { mode: "plain", "aria-label": getLang('calls_call_participants'), header: !!participantsCount && (_jsx(Header, { indicator: participantsCount, children: getLang('calls_call_participants') })), children: [participants.map((member, index) => (_jsxs(_Fragment, { children: [_jsx(SimpleCell, { 
                                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                                    before: _jsx(RichAvatar, { nft: member.is_nft, src: member.photo, size: 40 }), after: (hoveredPeerId === member.peerId || selected === member.peerId) && (_jsx(Text, { className: getColorClass('color_text_secondary'), children: selected === member.peerId
                                            ? getLang('calls_dialog_creator_exit_selected')
                                            : getLang('calls_dialog_creator_exit_select') })), role: "option", "aria-selected": selected === member.peerId, "aria-label": member.name, "data-testid": "calls_transfer_admin_rights_modal_item", hasActive: false, onClick: () => onSelect(selected !== member.peerId ? member : null), onKeyDown: (e) => {
                                        // Обрабатываем нажатие Space так как с role="option" по-умолчанию не работает
                                        if (e.code === KeyboardCodes.Space) {
                                            onSelect(selected !== member.peerId ? member : null);
                                            e.preventDefault();
                                        }
                                    }, onPointerEnter: () => setHoveredPeerId(member.peerId), onPointerLeave: () => setHoveredPeerId(null), children: _jsx(EllipsisText, { className: getColorClass('color_text_link'), children: member.name }) }, member.peerId), index + 1 < participants.length && (_jsx(Spacing, { size: 16, children: _jsx(Separator, {}) }, `separator-${index}`))] }))), isNextPage && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 16, children: _jsx(Separator, {}) }), _jsx(CellButton, { onClick: getNextPage, centered: true, disabled: loading, children: loading ? (_jsx(Spinner, { size: "small" })) : (_jsxs(_Fragment, { children: [!!participants.length && getLang('calls_waiting_hall_more_text'), !participants.length && getLang('calls_waiting_hall_reload_text')] })) })] }))] })] }) }));
};
//# sourceMappingURL=TransferAdminRightsModal.js.map