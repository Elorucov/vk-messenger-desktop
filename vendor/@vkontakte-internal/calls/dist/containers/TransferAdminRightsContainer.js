import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useLang } from '../hooks/useLang';
import { isCreator, getParticipantExternalId, objectFilter, hasIn, peerIdToVkId, useIndexer, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { TransferAdminRightsModal } from '../components/TransferAdminRightsModal/TransferAdminRightsModal';
import { getActiveParticipantsCount, isParticipantAnonymOrContact, someDeviceByParticipant, useActiveParticipantsCountLegacyStateDeps, } from '../helpers/participant';
import { onForceCallFinish } from '../actions/call';
import { ConversationOption, debugMessage, DebugMessageType, ParticipantStatus, UserRole, } from '@vkontakte/calls-sdk';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { searchCallParticipants } from '../services/backend';
import { normalizeGroup, normalizeUser } from '../helpers/user';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { handlePromiseError } from '../helpers/logger';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { useCloseModal } from '../hooks/useCloseModal';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
/** поиск участников по пользовательскому вводу */
function useSearchParticipants(state) {
    const callId = state.callData.callId;
    const [loading, setLoading] = useState(false);
    const isMounted = useIsMounted();
    /** последний сохраненный контроллер */
    const abortController = useRef(null);
    const setLoadingOff = () => {
        if (isMounted())
            setLoading(false);
    };
    const fetchParticipants = useCallback((query) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        if (!callId) {
            debugMessage(DebugMessageType.ERROR, { text: 'No callId provided' });
            return Promise.reject();
        }
        const nextAbortController = new AbortController();
        abortController.current = nextAbortController;
        setLoading(true);
        return searchCallParticipants(callId, { search: query }, { signal: nextAbortController.signal })
            .then((data) => {
            const members = [];
            const mapMembers = (profiles, normalizerFn) => {
                for (const profile of profiles) {
                    if (hasIn(profile.id, peerIdToVkId(state.me), -state.groupId))
                        continue; // себя пропускаем
                    members.push(normalizerFn(profile));
                }
            };
            mapMembers(data.profiles || [], normalizeUser);
            mapMembers(data.groups || [], normalizeGroup);
            setLoadingOff();
            return members;
        })
            .catch((error) => {
            if (error?.error?.name === 'AbortError' || error?.error?.code === 20) {
                return undefined;
            }
            debugMessage(DebugMessageType.ERROR, error);
            setLoadingOff();
            throw error;
        });
    }, [callId]);
    /** останавливаем текущий запрос (если он был) */
    const abortCurrentSearch = useCallback(() => {
        if (abortController.current) {
            abortController.current.abort();
        }
        setLoadingOff();
    }, []);
    useEffect(() => {
        return () => abortController.current?.abort();
    }, []);
    return { loading, fetchParticipants, abortCurrentSearch };
}
const useLegacyReduxState = () => useTypedSelector((state) => ({
    callData: state.callData,
    config: state.config,
    conversationOptions: state.conversationOptions,
    devices: state.devices,
    groupId: state.groupId,
    localDevice: state.localDevice,
    maps: state.maps,
    me: state.me,
    participants: state.participants,
    participantsChunk: state.participantsChunk,
    peer: state.peer,
}));
export const TransferAdminRightsContainer = () => {
    const SDK = useCallsSDK();
    const bridge = useCallsBridge();
    const dispatch = useTypedDispatch();
    const state = useLegacyReduxState();
    const { conversationOptions, localDevice, me, participants } = state;
    const { getLang } = useLang();
    const searchParticipants = useSearchParticipants(state);
    const [localParticipants, setLocalParticipants] = useState(() => {
        const result = objectFilter(participants, (participant) => {
            if (participant.peerId === me) {
                return false;
            }
            if (isParticipantAnonymOrContact(participant.peerId)) {
                return false;
            }
            return someDeviceByParticipant(participant, ({ status }) => {
                return status === ParticipantStatus.CONNECTED;
            }, {
                devices: state.devices,
                peerIdToDevices: state.maps.peerIdToDevices,
            });
        });
        return result;
    });
    const [selected, setSelected] = useState(null);
    // Init search index
    const nameGetter = useCallback((member) => member.name, []);
    const idGetter = useCallback((member) => member.peerId, []);
    const searchIndex = useIndexer(localParticipants, nameGetter, idGetter);
    const deps = useActiveParticipantsCountLegacyStateDeps();
    const countParticipants = useMemo(() => getActiveParticipantsCount(deps), [deps.participants, deps.me, deps.devices, deps.maps]);
    const sendStats = useSendStatsService();
    const closeModal = useCloseModal();
    const isRepeatedCall = conversationOptions.some((option) => option === ConversationOption.RECURRING);
    const logHangupEvent = () => {
        sendStats(ClickHouseEventType.CALL_DECLINED_OR_HANGED_LOCALLY, {
            reason: 'none',
            group_call_users_count: countParticipants,
        });
    };
    const isMeACreator = useMemo(() => {
        return isCreator(localDevice);
    }, [localDevice]);
    const search = useCallback((query) => {
        if (query) {
            setLocalParticipants(searchIndex.search(query));
        }
        else {
            setLocalParticipants(searchIndex.list);
        }
        setSelected(null);
    }, [state]);
    const onCallForceFinish = () => {
        closeModal();
        logHangupEvent();
        SDK.hangup();
        onForceCallFinish(SDK, bridge, state.callData.callId || '', state.peer, dispatch, getLang);
    };
    const onCallFinish = () => {
        closeModal();
        logHangupEvent();
        SDK.hangup().catch(handlePromiseError);
    };
    const onRightsTransfer = () => {
        if (selected === null) {
            onCallFinish();
            return;
        }
        let externalId = getParticipantExternalId(participants[selected]);
        if (!externalId) {
            return;
        }
        SDK.grantRoles(externalId, [UserRole.ADMIN], false).then(onCallFinish).catch(handlePromiseError);
        closeModal();
    };
    const onItemClick = useCallback((participant) => {
        setSelected(participant === null ? null : participant.peerId);
    }, []);
    useEffect(() => {
        const participantsList = localParticipants;
        if (selected && !participantsList.find((p) => p.peerId === selected)) {
            setSelected(null);
        }
    }, [selected]);
    return (_jsx(TransferAdminRightsModal, { participants: localParticipants, participantsCount: localParticipants.length, onClose: closeModal, onSelect: onItemClick, selected: selected, onCallForceFinish: onCallForceFinish, onRightsTransfer: onRightsTransfer, onSearch: search, isCreator: isMeACreator, isRepeatedCall: isRepeatedCall, loadingList: searchParticipants.loading }));
};
//# sourceMappingURL=TransferAdminRightsContainer.js.map