import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { E_ACTION } from '../constants';
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { getParticipantExternalId, isParticipantGroup } from '../helpers/participant';
import { getGroupById, loadUsers } from '../services/backend';
import { AssignAdminModal } from '../components/AssignAdminModal/AssignAdminModal';
import { UserRole } from '@vkontakte/calls-sdk';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { useLang } from '../hooks/useLang';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useCloseModal } from '../hooks/useCloseModal';
import { setShowLoader } from '../actions';
/**
 * Управляет диалогом назначения юзера как администратора звонка
 */
export const AssignAdminContainer = ({ onClose, peerId }) => {
    const sendStats = useSendStatsService();
    const SDK = useCallsSDK();
    const participant = useSelector((state) => state.participants[peerId]);
    const dispatch = useTypedDispatch();
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const { getLang } = useLang();
    const closeModal = useCloseModal(onClose);
    /**
     * Запрашивают юзера для имени в нужном падеже
     */
    useEffect(() => {
        dispatch(setShowLoader(true));
        new Promise((resolve, reject) => {
            const groupId = participant && isParticipantGroup(participant.peerId) ? -peerIdToVkId(participant.peerId) : undefined;
            if (groupId) {
                getGroupById(groupId)
                    .then(({ groups }) => {
                    resolve(groups && groups.length > 0 ? groups[0]?.name || '' : '');
                })
                    .catch((e) => reject(e));
            }
            else {
                loadUsers({
                    user_ids: participant?.peerId,
                    name_case: 'Dat',
                })
                    .then(([user]) => {
                    resolve(`${user?.first_name} ${user?.last_name}`);
                })
                    .catch((e) => reject(e));
            }
        })
            .then((name) => {
            setName(name);
            setLoading(false);
            dispatch(setShowLoader(false));
        })
            .catch(console.log);
    }, [participant]);
    /**
     * Назначить администратора
     */
    const assignAdmin = useCallback(() => {
        const externalId = getParticipantExternalId(participant);
        if (!externalId) {
            closeModal();
            return;
        }
        SDK.grantRoles(externalId, [UserRole.ADMIN], false)
            .then(() => {
            // Инициатору действия не прилетает апдейт `onRolesChanged`.
            // Поэтому допушиваем измененные роли к изменяемому юзеру чтобы интерфейс среагировал.
            participant &&
                dispatch({
                    type: E_ACTION.CHANGE_PARTICIPANT_ROLES,
                    participantId: participant.peerId,
                    data: participant.roles ? [...participant.roles, UserRole.ADMIN] : [UserRole.ADMIN],
                });
        })
            .catch(console.log);
        sendStats(ClickHouseEventType.ASSIGN_ADMIN);
        closeModal();
    }, [sendStats]);
    if (loading) {
        return _jsx(_Fragment, {});
    }
    return (_jsx(AssignAdminModal, { onClose: closeModal, title: getLang('calls_dialog_assign_admin_role_title'), description: getLang('calls_dialog_assign_admin_role_description').replace('{name}', name), actionButtons: [
            _jsx(Button, { size: "m", onClick: closeModal, mode: "secondary", children: getLang('calls_dialog_assign_admin_role_action_later') }, "cancel"),
            _jsx(Button, { "data-focus-first": true, size: "m", mode: "primary", onClick: assignAdmin, children: getLang('calls_dialog_assign_admin_role_action_primary') }, "primary"),
        ] }));
};
//# sourceMappingURL=AssignAdminContainer.js.map