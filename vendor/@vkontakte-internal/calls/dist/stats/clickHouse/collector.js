/**
 * Сбор продуктовой статистики в ClickHouse.
 * Используется для вывода в SuperSet
 *
 * Описание: https://confluence.mvk.com/display/VKA/calls
 */
import { isParticipantGroup } from '../../helpers/participant';
import { peerIdToVkId, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { actionProductionStatCallEventType } from './constants';
import { getCurrentTime } from '../../helpers/time';
class CallItemStatCollector {
    constructor() {
        this.actionStatCollector = undefined;
        this.eventCommonData = {};
    }
    setActionStatCollector(actionStatCollector) {
        this.actionStatCollector = actionStatCollector;
    }
    setEventCommonData(eventCommonData = {}) {
        this.eventCommonData = eventCommonData;
    }
    logEvent(eventRawData) {
        const userId = eventRawData.peer_id;
        const vkId = typeof userId === 'string' ? peerIdToVkId(userId) : userId;
        const peerId = typeof userId === 'number' ? vkIdToPeerId(userId) : userId;
        const groupId = eventRawData.group_id || (isParticipantGroup(vkId) ? vkId : 0);
        const eventData = {
            ...eventRawData,
            peer_id: peerId,
            event_client_microsec: getCurrentTime(),
            session_id: eventRawData.session_id || '',
            lib_version: 'calls_v2',
            group_id: groupId,
            device_id: eventRawData.device_id || '',
            ...this.eventCommonData,
        };
        if (this.actionStatCollector) {
            this.actionStatCollector.logEvent({
                type: actionProductionStatCallEventType,
                [actionProductionStatCallEventType]: eventData,
            });
        }
    }
}
export const callStats = new CallItemStatCollector();
//# sourceMappingURL=collector.js.map