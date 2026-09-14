import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TIMESPENT_EVENT_COUNTER } from '../constants';
import { IS_INCOMPLETE_CONTEXT_KEY, TIMESPENT_SERVICE_COUNTER_IDS, isGroupCallByPeerAndMe, } from '@vkontakte-internal/calls-core';
import { MyTrackerContext } from '../helpers/MyTrackerContext';
import { getActiveParticipantsCount, isParticipantAnonym, useActiveParticipantsCountLegacyStateDeps, } from '../helpers/participant';
import { useTypedSelector } from './useTypedSelector';
import { getCallId, getDevices, getIsSferum, getMyId, getMyMediaSettings, getPeerId } from '../selectors';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
export const SUCCESSFUL_CALL_MEMBER_COUNT = 2;
export const SUCCESSFUL_GROUP_CALL_MEMBER_COUNT = 3;
const getInitToggles = () => ({
    [TIMESPENT_SERVICE_COUNTER_IDS.CALLS_IN_CALL]: false,
    [TIMESPENT_EVENT_COUNTER.SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS]: false,
    [TIMESPENT_EVENT_COUNTER.SUCCESSFUL_GROUP_CALL_OF_AUTHENTICATED_VK_MEMBERS]: false,
    [TIMESPENT_EVENT_COUNTER.SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS_WITH_CAMERA]: false,
});
const validStatuses = [
    ParticipantStatus.CONNECTED,
    ParticipantStatus.CONNECTING,
    ParticipantStatus.RECONNECT,
];
const isValidDevice = (device) => validStatuses.includes(device.status);
/**
 * Получает количество участников звонка (без учета учебных профилей (Сферум))
 */
function useActiveVkCallParticipantsCount() {
    const callId = useTypedSelector(getCallId);
    const isSferum = useTypedSelector(getIsSferum);
    const legacyDeps = useActiveParticipantsCountLegacyStateDeps();
    return useMemo(() => (isSferum || !callId ? 0 : getActiveParticipantsCount(legacyDeps, isValidDevice)), [callId, legacyDeps.devices, isSferum, legacyDeps.me, legacyDeps.participants]);
}
export function useMyTrackerHandler() {
    const { [IS_INCOMPLETE_CONTEXT_KEY]: isIncompleteContext, getServiceTimespentCollector, tmrSendTimespentEvent, } = useContext(MyTrackerContext);
    const serviceTimespentCollector = useMemo(getServiceTimespentCollector, [getServiceTimespentCollector]);
    const activeVkCallParticipantsCount = useActiveVkCallParticipantsCount();
    const me = useTypedSelector(getMyId);
    const peer = useTypedSelector(getPeerId);
    const { isVideoEnabled: isMyVideoEnabled } = useTypedSelector(getMyMediaSettings);
    const devices = useTypedSelector(getDevices);
    const callId = useTypedSelector(getCallId);
    const isAnonymous = useMemo(() => isParticipantAnonym(me), [me]);
    const isGroupCall = useMemo(() => isGroupCallByPeerAndMe(peer, me), [peer, me]);
    const [currentCallId, setCurrentCallId] = useState();
    const toggles = useRef(getInitToggles());
    useEffect(() => {
        if (!isIncompleteContext) {
            if (toggles.current[TIMESPENT_SERVICE_COUNTER_IDS.CALLS_IN_CALL]) {
                serviceTimespentCollector.finish(TIMESPENT_SERVICE_COUNTER_IDS.CALLS_IN_CALL);
            }
            setCurrentCallId(callId);
            toggles.current = getInitToggles();
        }
    }, [callId, isIncompleteContext]);
    useEffect(() => {
        if (!isIncompleteContext && currentCallId && !isAnonymous) {
            if (activeVkCallParticipantsCount >= SUCCESSFUL_CALL_MEMBER_COUNT) {
                if (!toggles.current[TIMESPENT_SERVICE_COUNTER_IDS.CALLS_IN_CALL]) {
                    serviceTimespentCollector.start(TIMESPENT_SERVICE_COUNTER_IDS.CALLS_IN_CALL);
                    toggles.current[TIMESPENT_SERVICE_COUNTER_IDS.CALLS_IN_CALL] = true;
                }
                if (!toggles.current[TIMESPENT_EVENT_COUNTER.SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS] &&
                    !isGroupCall) {
                    tmrSendTimespentEvent(TIMESPENT_EVENT_COUNTER.SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS);
                    toggles.current[TIMESPENT_EVENT_COUNTER.SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS] = true;
                }
                if (!toggles.current[TIMESPENT_EVENT_COUNTER.SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS_WITH_CAMERA]) {
                    const hasCamera = isMyVideoEnabled || Object.values(devices).some((device) => device.mediaSettings.isVideoEnabled);
                    if (hasCamera) {
                        tmrSendTimespentEvent(TIMESPENT_EVENT_COUNTER.SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS_WITH_CAMERA);
                        toggles.current[TIMESPENT_EVENT_COUNTER.SUCCESSFUL_CALL_OF_AUTHENTICATED_VK_MEMBERS_WITH_CAMERA] =
                            true;
                    }
                }
            }
            if (activeVkCallParticipantsCount >= SUCCESSFUL_GROUP_CALL_MEMBER_COUNT) {
                if (!toggles.current[TIMESPENT_EVENT_COUNTER.SUCCESSFUL_GROUP_CALL_OF_AUTHENTICATED_VK_MEMBERS] &&
                    isGroupCall) {
                    tmrSendTimespentEvent(TIMESPENT_EVENT_COUNTER.SUCCESSFUL_GROUP_CALL_OF_AUTHENTICATED_VK_MEMBERS);
                    toggles.current[TIMESPENT_EVENT_COUNTER.SUCCESSFUL_GROUP_CALL_OF_AUTHENTICATED_VK_MEMBERS] = true;
                }
            }
        }
    }, [
        activeVkCallParticipantsCount,
        currentCallId,
        devices,
        isAnonymous,
        isGroupCall,
        isIncompleteContext,
        isMyVideoEnabled,
    ]);
    useEffect(() => {
        return function clear() {
            if (!isIncompleteContext && toggles.current[TIMESPENT_SERVICE_COUNTER_IDS.CALLS_IN_CALL]) {
                serviceTimespentCollector.finish(TIMESPENT_SERVICE_COUNTER_IDS.CALLS_IN_CALL);
            }
        };
    }, []);
}
//# sourceMappingURL=useMyTrackerHandler.js.map