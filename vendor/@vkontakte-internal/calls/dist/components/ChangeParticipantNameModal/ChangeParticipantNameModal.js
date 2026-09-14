import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { ChangeParticipantName } from './ChangeParticipantName';
import { RenamedUserType } from '@vkontakte-internal/calls-core';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import { decode } from '../../utils/textUtils';
import { isParticipantAnonymOrContact } from '../../helpers/participant';
import { CallsModal } from '../../components/CallsModal';
import styles from './ChangeParticipantNameModal.module.css';
export const ChangeParticipantNameModal = ({ participant, onClose, renamedUserType, onSaveClick, changedName, setChangedName, error, isFetching, }) => {
    const { getLang, langReplace } = useLang();
    const onClearName = () => setChangedName('');
    const onNameChange = (e) => {
        setChangedName(e.target.value);
    };
    const isMyNameChanging = renamedUserType === RenamedUserType.SELF;
    const title = isMyNameChanging
        ? getLang('calls_change_name') // Изменить имя
        : getLang('calls_rename_participant'); // Переименовать участника
    const top = isMyNameChanging
        ? getLang('calls_your_new_name') // Ваше новое имя
        : langReplace(getLang('calls_new_name_for_particiopant'), {
            name: decode(participant.name), // Новое имя для участника {name}
        });
    const actionButtons = [
        _jsx(Button, { onClick: onClose, size: "m", "data-focus-first": true, mode: "tertiary", children: getLang('calls_cancel') }, "changeNameCancel"),
        _jsx(Button, { onClick: onSaveClick, size: "m", disabled: error || isFetching, children: getLang('calls_rename') }, "changeNameSave"),
    ];
    return (_jsx(CallsModal, { className: "ChangeParticipantNameModal", onClose: onClose, title: title, actionButtons: actionButtons, children: _jsx("div", { className: styles.content, children: _jsx(ChangeParticipantName, { onClearName: onClearName, changedName: changedName, onNameChange: onNameChange, onSubmit: onSaveClick, placeholder: participant.name, error: error, top: top, participantRealName: participant.name, isAnonymous: isParticipantAnonymOrContact(participant.peerId), isMyNameChanging: isMyNameChanging }) }) }));
};
//# sourceMappingURL=ChangeParticipantNameModal.js.map