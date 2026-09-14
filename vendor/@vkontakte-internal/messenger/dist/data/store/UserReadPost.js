import { exhaustivenessCheck, sleep } from '../../core/utils/misc';
import * as Organisers from '../../core/model/Organisers';
import * as Channel from '../../core/model/Channel';
const THROTTLE_TIMEOUT = 300;
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserReadPost': {
            const { cmid, channelId } = action;
            const channel = draft.channels.get(channelId);
            if (!channel) {
                return [];
            }
            if (channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (cmid <= channel.inReadCmid) {
                return [];
            }
            Channel.readUntil(channel, cmid);
            Organisers.refreshChannels(draft.organisers, channel);
            const isRequestPending = draft.channelReadQueues.has(channelId);
            /**
             * Обновляем границу, до которой нужно будет прочитать канал
             * в запросе АПИ до новой актуальной.
             */
            draft.channelReadQueues.set(channelId, channel.inReadCmid);
            if (isRequestPending) {
                return [];
            }
            /**
             * Вместо того, чтобы отправлять запрос на бэк
             * при каждом прочитанном посте, мы будем "батчить"
             * такие запросы.
             * Поэтому будем отправлять запрос не бэк не чаще,
             * чем раз в Х мс, с максимальным прочитанным
             * на этот момент постом.
             */
            return [scheduleChannelRead(channelId)];
        }
        case 'UserReadPost_ThrottleTimedOut': {
            const { channelId } = action;
            const cmid = draft.channelReadQueues.get(channelId);
            if (!cmid) {
                return [];
            }
            return [
                async function readChannelUntilMessage({ api }) {
                    try {
                        await api.fetch('channels.markAsRead', {
                            channel_id: channelId,
                            last_read_cmid: cmid,
                        });
                    }
                    catch (err) { }
                    return {
                        type: 'UserReadPost_RequestCompleted',
                        channelId,
                        readUntilCmid: cmid,
                    };
                },
            ];
        }
        case 'UserReadPost_RequestCompleted': {
            const { channelId, readUntilCmid } = action;
            const queuedReadCmid = draft.channelReadQueues.get(channelId);
            if (!queuedReadCmid) {
                return [];
            }
            /**
             * Если пока мы читали, у нас не появилось новых постов
             * в очереди на прочтение, просто чистим очередь.
             */
            if (readUntilCmid >= queuedReadCmid) {
                draft.channelReadQueues.delete(channelId);
                return [];
            }
            return [scheduleChannelRead(channelId)];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
function scheduleChannelRead(channelId) {
    return async function scheduleChannelRead() {
        await sleep(THROTTLE_TIMEOUT);
        return {
            type: 'UserReadPost_ThrottleTimedOut',
            channelId,
        };
    };
}
//# sourceMappingURL=UserReadPost.js.map