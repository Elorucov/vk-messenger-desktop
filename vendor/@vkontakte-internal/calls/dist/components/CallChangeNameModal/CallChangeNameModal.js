import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}]} */
import { createRef, useEffect, useMemo } from 'react';
import { CallByNameProfileType } from '../../constants';
import { Icon24CheckCircleOn, Icon28IncognitoOutline } from '@vkontakte/icons';
import { AppRootProvider, Avatar, Button, ButtonGroup, Group, ModalFooter, SimpleCell, FocusTrap, } from '@vkontakte-internal/vkcom-kit';
import { ChangeParticipantName } from '../ChangeParticipantNameModal/ChangeParticipantName';
import { BaseModal } from '../BaseModal/BaseModal';
import { useLang } from '../../hooks/useLang';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { ModalHeader } from '../CallsModal';
import { useConfig } from '../../services/config';
export const CallChangeNameModal = ({ items, onListItemClick, selectedId, onClose, onNameChange, onSaveClick, onClearName, changedName, error, disabled, participantMe, }) => {
    const { getLang } = useLang();
    const inputRef = createRef();
    const selectedProfile = useMemo(() => items.find((item) => item.id === selectedId), [selectedId]);
    const { sferum } = useConfig();
    const actionButtons = (_jsxs(ButtonGroup, { stretched: true, children: [_jsx(Button, { stretched: true, onClick: onClose, size: "l", mode: "secondary", children: getLang('calls_cancel') }, "changeNameCancel"), _jsx(Button, { stretched: true, onClick: onSaveClick, size: "l", disabled: !changedName.length || error, children: getLang('calls_save') }, "changeNameSave")] }));
    useEffect(() => {
        !selectedId && inputRef.current?.focus();
    }, [selectedId]);
    const getListItemSubtitleByType = (type) => {
        switch (type) {
            case CallByNameProfileType.PROFILE: {
                // Ваш профиль
                return getLang('calls_your_profile');
            }
            case CallByNameProfileType.GROUP: {
                // Ваше сообщество
                return getLang('calls_your_group');
            }
            case CallByNameProfileType.ANONYM: {
                // Ваш профиль будет скрыт
                return getLang('calls_your_profile_will_hidden');
            }
            default: {
                return '';
            }
        }
    };
    const getListItem = (item, selectedId) => {
        const aside = selectedId === item.id ? _jsx(Icon24CheckCircleOn, {}) : null;
        return (_jsx("div", { children: _jsx(SimpleCell, { onClick: () => onListItemClick(item.id), after: aside, "data-focus-first": selectedId === item.id, before: item.id && item.photo ? (
                // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                _jsx(Avatar, { src: item.photo })) : (_jsx(Avatar, { children: _jsx(Icon28IncognitoOutline, {}) })), subtitle: getListItemSubtitleByType(item.type), children: decodeHTMLEntities(item.name || '') }, item.id) }));
    };
    return (_jsx(BaseModal, { disableBodyScroll: true, className: "CallChangeNameModal", onClose: onClose, children: _jsx(FocusTrap, { hasFirstFocusableElement: true, children: _jsxs(AppRootProvider, { children: [_jsx(ModalHeader, { title: getLang('calls_join_as'), onClose: onClose }), _jsxs("div", { className: sferum ? '' : 'CallChangeNameModal__content', children: [items.length !== 0 && (_jsx(Group, { mode: "plain", separator: sferum ? 'hide' : 'show', children: _jsx("div", { className: "CallChangeNameModal__items", children: items.map((item) => getListItem(item, selectedId)) }) })), !sferum && (_jsx("div", { className: "CallChangeNameModal__name", children: _jsx(ChangeParticipantName, { onClearName: onClearName, disabled: disabled, changedName: changedName, onNameChange: onNameChange, onSubmit: onSaveClick, placeholder: selectedProfile?.name, error: error, 
                                    // Имя, которое увидят в звонке
                                    top: getLang('calls_name_that_will_be_seen_in_calls'), participantRealName: selectedProfile?.name || participantMe.name, isMyNameChanging: true }) }))] }), _jsx(ModalFooter, { children: actionButtons })] }) }) }));
};
//# sourceMappingURL=CallChangeNameModal.js.map