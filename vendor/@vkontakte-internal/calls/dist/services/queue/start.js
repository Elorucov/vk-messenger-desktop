import { queueSubscribe } from '../backend';
import { QueueManager } from '@vkontakte-internal/queue-manager';
import { ECallLongpollType, CallsAppId, isLongpollErrorResponse, } from '@vkontakte-internal/calls-core';
/**
 * Если 1, значит если обновить ts, то можно данные еще раз получить
 */
const PARTIAL_FAILED_QUEUE = 1;
export function startQueueManager({ id, loadModule, credentialCache, debug, regularTransport, appId = CallsAppId.WEB, withCredentials, queueService, }) {
    const init = () => {
        const qm = new QueueManager({
            debug: debug,
            noSharedWorker: regularTransport,
            withCredentials,
        });
        // https://confluence.mvk.com/pages/viewpage.action?pageId=159342880
        const queueId = `calls_${id}_${appId}_1`;
        const credentialsGetter = async () => {
            const cachedParams = credentialCache.get();
            if (cachedParams) {
                return cachedParams;
            }
            const response = await queueSubscribe({ queue_ids: queueId });
            const { base_url, queues } = response;
            const { key, timestamp } = queues[0];
            const params = {
                id,
                key,
                ts: timestamp,
                url: base_url,
            };
            credentialCache.put(params);
            return params;
        };
        qm.addQueue(queueId, credentialsGetter);
        qm.subscribe(async (_, payload) => {
            if (isLongpollErrorResponse(payload)) {
                if (payload.failed !== PARTIAL_FAILED_QUEUE) {
                    credentialCache.drop();
                }
                return;
            }
            credentialCache.update(Number(payload.ts));
            // Иницианизируем только на входящий звонок
            if (!window.Calls?.handleQueueEvent &&
                payload.events.some((event) => event.data.type === ECallLongpollType.IncomingCall)) {
                await loadModule();
            }
            if (window.Calls?.handleQueueEvent) {
                payload.events.forEach((event) => {
                    window.Calls?.handleQueueEvent(event);
                    queueService?.publish(event);
                });
            }
        }, () => {
            if (debug) {
                console.log('reset');
            }
            qm.destroy();
            init();
        });
        return () => {
            qm.destroy();
            queueService?.destroy();
        };
    };
    return init();
}
//# sourceMappingURL=start.js.map