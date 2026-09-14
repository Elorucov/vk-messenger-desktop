import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { ChangeParticipantNameModal } from '../components/ChangeParticipantNameModal/ChangeParticipantNameModal';
import { E_ACTION, MIN_NAME_LENGTH, NAME_REGEX } from '../constants';
import { RenamedUserType, peerIdToVkId } from '@vkontakte-internal/calls-core';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useEffect, useState } from 'react';
import { callsCheckParticipantName, callsDeleteParticipantName, callsEditParticipantName, } from '../services/backend';
import { handlePromiseError } from '../helpers/logger';
import { useFetchData } from '../hooks/useFetchData';
import { isParticipantAnonym } from '../helpers/participant';
import { useCloseModal } from '../hooks/useCloseModal';
import { getAnonymSecret, getCallId, getGroupId } from '../selectors';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
export const ChangeParticipantNameContainer = ({ onClose, peerId, renamedUserType }) => {
    const sendStats = useSendStatsService();
    const [changedName, setChangedName] = useState('');
    const [error, setError] = useState(false);
    const callId = useTypedSelector(getCallId);
    const groupId = useTypedSelector(getGroupId);
    const participant = useTypedSelector((state) => state.participants[peerId]);
    const anonymSecret = useTypedSelector(getAnonymSecret);
    const dispatch = useTypedDispatch();
    const closeModal = useCloseModal(onClose);
    const editParticipantName = useFetchData({ cb: callsEditParticipantName });
    const checkParticipantName = useFetchData({ cb: callsCheckParticipantName });
    const deleteParticipantName = useFetchData({ cb: callsDeleteParticipantName });
    useEffect(() => {
        setError(changedName.length >= MIN_NAME_LENGTH && !NAME_REGEX.test(changedName));
    }, [changedName]);
    const onSave = async () => {
        const isEmptyName = changedName.length === 0;
        let isValid = isEmptyName;
        if (!isEmptyName) {
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
            isValid = await checkParticipantName
                .fetchData({ name: changedName })
                .then((response) => {
                if (!response.is_valid) {
                    setError(true);
                    return false;
                }
                return response.is_valid;
            })
                .catch(handlePromiseError);
        }
        if (!isValid) {
            return;
        }
        const params = {
            call_id: callId ?? '',
            name: changedName,
        };
        let statLabel = ClickHouseEventType.NAME_CHANGED_BY_USER;
        if (groupId) {
            params.group_id = groupId;
        }
        if (renamedUserType !== RenamedUserType.SELF) {
            params.participant_id = peerId;
            statLabel = groupId
                ? ClickHouseEventType.NAME_CHANGED_BY_COMMUNITY
                : ClickHouseEventType.NAME_CHANGED_BY_ADMIN;
        }
        if (renamedUserType === RenamedUserType.SELF && isParticipantAnonym(peerId)) {
            params.anonym_auth_user_id = peerIdToVkId(peerId);
            params.secret = anonymSecret;
            params.device_id = 'anyId';
            statLabel = ClickHouseEventType.NAME_CHANGED_BY_ANONYM;
        }
        if (isEmptyName) {
            const { name, ...deleteParams } = params;
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
            deleteParticipantName
                .fetchData(deleteParams)
                .then((data) => {
                if (data.secret) {
                    // Считаем, что если есть secret, то это был анонимный пользователь
                    dispatch({ type: E_ACTION.UPDATE_ANON_SECRET, secret: data.secret });
                }
                sendStats(statLabel);
                closeModal();
            })
                .catch(handlePromiseError);
        }
        else {
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
            editParticipantName
                .fetchData(params)
                .then((data) => {
                if (data.secret) {
                    // Считаем, что если есть secret, то это был анонимный пользователь
                    dispatch({ type: E_ACTION.UPDATE_ANON_SECRET, secret: data.secret });
                }
                sendStats(statLabel);
                closeModal();
            })
                .catch(handlePromiseError);
        }
    };
    return participant ? (_jsx("div", { children: _jsx(ChangeParticipantNameModal, { changedName: changedName, setChangedName: setChangedName, participant: participant, onClose: closeModal, renamedUserType: renamedUserType, onSaveClick: onSave, error: error, isFetching: editParticipantName.loading || checkParticipantName.loading || deleteParticipantName.loading }) })) : (_jsx(_Fragment, {}));
};
//# sourceMappingURL=ChangeParticipantNameContainer.js.map