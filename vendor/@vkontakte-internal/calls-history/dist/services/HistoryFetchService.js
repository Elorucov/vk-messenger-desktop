import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { isParticipantGroup, peerIdToVkId } from '@vkontakte-internal/calls-core';
import { CallsApi } from '@vkontakte-internal/plugins';
import { userFields } from '../constants';
/**
 * Используется в других сервисах для получения истории звонков.
 */
let HistoryFetchService = class HistoryFetchService {
    constructor(callsApi) {
        this.callsApi = callsApi;
    }
    async fetchHistory({ groupId = 0, filter = 'all', offset, count, }) {
        const newFilter = filter === 'missed' ? 'only_missed' : 'all';
        const offsetParam = offset > 0 ? { pagination_marker: offset } : {};
        const fields = [userFields, 'last_name_gen'].join(',');
        const response = isParticipantGroup(groupId)
            ? await this.callsApi.getGroupHistory({
                group_id: groupId,
                count,
                filter: newFilter,
                fields,
                ...offsetParam,
            })
            : await this.callsApi.getHistory({
                count,
                filter: newFilter,
                fields,
                ...offsetParam,
            });
        return transformNewHistoryResponseToOldHistoryResponse(response);
    }
};
HistoryFetchService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallsApi])
], HistoryFetchService);
export { HistoryFetchService };
const isMergedHistoryRecord = (item) => item.type === 'merged';
const convertTSInSecondsToMS = (ts) => ts * 1e3;
function transformCallHistoryRecordToMessagesCallHistoryItem(item) {
    const isMergedHistoryRecordItem = isMergedHistoryRecord(item);
    const singleRecord = isMergedHistoryRecordItem ? item.records[0] : item;
    const result = {
        user_ids: singleRecord.participant_ids.map(peerIdToVkId),
        participant_ids: singleRecord.participant_ids,
        participant_count: singleRecord.participant_count,
        call_id: singleRecord.call_id,
        finished_at: convertTSInSecondsToMS(singleRecord.finished_at),
        is_inbound: singleRecord.is_inbound,
        is_missed: singleRecord.is_missed,
        type: item.type,
        started_at: convertTSInSecondsToMS(singleRecord.started_at),
        reach_status: singleRecord.reach_status,
        can_download_call_join_history: singleRecord.can_view_join_history,
        join_link: singleRecord.active_call?.ok_join_link,
        id: isMergedHistoryRecordItem ? item.records[0].record_id : item.record_id,
        items: isMergedHistoryRecordItem
            ? item.records.map(transformCallHistoryRecordToMessagesCallHistoryItem)
            : undefined,
        broadcast_recording_ids: singleRecord?.broadcast_recording_ids,
        record_title: singleRecord.record_title,
        record_photo: singleRecord.record_photo_base,
    };
    if (singleRecord.chat) {
        const chat = singleRecord.chat;
        const photoBase = singleRecord.chat.photo_base;
        result.chat = {
            id: singleRecord.peer?.local_id ?? singleRecord.chat.peer_id,
            title: singleRecord.chat.title,
            photo_50: photoBase + '&cs=50x50',
            photo_100: photoBase + '&cs=100x100',
            photo_200: photoBase + '&cs=200x200',
            photo_400: photoBase + '&cs=400x400',
            photo_base: photoBase,
            peer_id: singleRecord.peer?.id ?? singleRecord.chat.peer_id,
            left_or_kicked: chat.is_left || chat.is_kicked,
        };
        if (singleRecord.active_call) {
            result.chat.call_in_progress = {
                call_id: singleRecord.active_call.call_id,
                join_link: singleRecord.active_call.ok_join_link,
                participants: [],
            };
        }
    }
    return result;
}
function transformNewHistoryResponseToOldHistoryResponse(response) {
    return {
        has_more: response.has_more,
        next_from: response.next_page_pagination_marker,
        items: response.items.map(transformCallHistoryRecordToMessagesCallHistoryItem),
        profiles: response.profiles,
        groups: response.groups,
        contacts: response.contacts,
    };
}
//# sourceMappingURL=HistoryFetchService.js.map