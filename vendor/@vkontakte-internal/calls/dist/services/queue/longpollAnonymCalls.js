import { fetchCallsAnonymQueue, fetchUrl, makeCallsAnonymQueueUrl } from '../backend';
import { pause } from '@vkontakte-internal/vkjs/lib/PromiseUtils';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { isLongpollErrorResponse, isLongpollSuccessResponse, } from '@vkontakte-internal/calls-core';
export class CallsLongpollAnonym {
    constructor(props) {
        this.props = props;
        this.userId = props.getUserId();
        this.onResponse = props.onResponse;
        this.onUpdateSecret = props.onUpdateSecret;
        this.retryCount = 0;
        this.urlData = null;
        this.apiQueueSubscribe = props.apiQueueSubscribe || fetchCallsAnonymQueue;
    }
    async init() {
        try {
            const urlData = await this.apiQueueSubscribe(this.userId, this.props.getAnonymSecret() || '', 'anyId');
            this.urlData = urlData;
            if (urlData.secret && this.onUpdateSecret) {
                this.onUpdateSecret(urlData.secret);
            }
        }
        catch (error) {
            debugMessage(DebugMessageType.ERROR, {
                type: 'request',
                method: 'calls.subscribeToQueue',
                error,
                text: 'could not subscribe to Calls event queue',
            });
        }
    }
    /** запускает опрос событий от `calls longpoll` */
    async wait() {
        if (this.closed) {
            return;
        }
        try {
            if (!this.urlData) {
                await this.init();
            }
            if (!this.urlData) {
                throw new Error('no urlData!');
            }
            const url = makeCallsAnonymQueueUrl(this.urlData, this.userId);
            const res = await this.fetchCallsLongpoll(url);
            if (!this.closed) {
                this.onResponse(res);
            }
            this.urlData = {
                ...this.urlData,
                queue_subscription_info: {
                    ...this.urlData.queue_subscription_info,
                    queues: [
                        {
                            ...this.urlData.queue_subscription_info.queues[0],
                            timestamp: Number(res.ts),
                        },
                    ],
                },
            };
        }
        catch (err) {
            const count = this.retryCount;
            if (count > 100) {
                return;
            }
            await pause(count * count, null);
            this.retryCount += 1;
            this.urlData = null;
        }
        finally {
            this.wait();
        }
    }
    fetchCallsLongpoll(url) {
        return fetchUrl(url).then((res) => {
            if (isLongpollErrorResponse(res)) {
                debugMessage(DebugMessageType.ERROR, {
                    type: 'response.(error|failed)',
                    method: url,
                    data: { error: res.err, failed: res.failed },
                });
                throw new Error('re-init subscription');
            }
            else if (isLongpollSuccessResponse(res) &&
                Number(res.ts) === this.urlData?.queue_subscription_info?.queues[0]?.timestamp) {
                debugMessage(DebugMessageType.ERROR, {
                    type: 'response.ts',
                    method: url,
                    data: res,
                });
                throw new Error('re-init subscription');
            }
            return res;
        });
    }
    /** останавливает опрос событий с бекенда в текущем инстансе */
    destroy() {
        this.closed = true;
    }
}
//# sourceMappingURL=longpollAnonymCalls.js.map