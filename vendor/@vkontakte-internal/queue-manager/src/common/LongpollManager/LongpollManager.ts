import { isObject, isUndefined } from '@vkontakte/vkjs';

import { createUrl } from './utils';

import type { ILongpollResponse } from '../../types/longpoll';
import type { IQueueId, IQueueParams } from '../../types/queue';
import type { Logger } from '../Logger';

export type ICallbackPayload<T = unknown> = (queueId: IQueueId, payload: ILongpollResponse<T>) => void;

export const REQUEST_TIMEOUT_IN_SECONDS = 2;
export const REQUEST_MIN_TIMEOUT_IN_MS = 4;
export const RETRY_COUNT_MIN = 1;
export const RETRY_COUNT_MAX = 20;

export class LongpollManager<T = unknown> {
  private readonly _queues: Map<IQueueId, IQueueParams>;
  private readonly _processing: Map<IQueueParams['url'], ReturnType<typeof setTimeout>>;
  private readonly _publish: ICallbackPayload<T>;
  private readonly _logger?: Logger;
  private readonly _retryCount: Map<IQueueParams['url'], number>;
  private _withCredentials: boolean;

  public constructor(callback: ICallbackPayload<T>, logger?: Logger, withCredentials = false) {
    this._queues = new Map();
    this._processing = new Map();
    this._publish = callback;
    this._logger = logger;
    this._withCredentials = withCredentials;
    this._retryCount = new Map();
  }

  public add(queueId: IQueueId, next: IQueueParams, withCredentials?: boolean) {
    // Возможность прокинуть значение в инстанс, созданный в воркере
    if (withCredentials !== undefined) {
      this._withCredentials = withCredentials;
    }

    const prev = this._queues.get(queueId);
    if ((prev?.ts || 0) < next.ts) {
      this._queues.set(queueId, { ...next });
    }
    this._start();
  }

  public remove(queueId: IQueueId) {
    const params = this._queues.get(queueId);
    if (params) {
      this._retryCount.delete(params?.url);
    }
    this._queues.delete(queueId);
  }

  public has(queueId: IQueueId) {
    return this._queues.has(queueId);
  }

  /** запускает рекурсивную обработку очереди */
  private _start() {
    for (const params of this._queues.values()) {
      if (!this._processing.has(params.url)) {
        this._processing.set(
          params.url,
          setTimeout(() => this._processUrl(params.url), this._getTimeoutValue(params.url)),
        );
      }
    }
  }

  private _getTimeoutValue(url: IQueueParams['url']) {
    const retryCount = this._getRetryCount(url);
    if (retryCount === RETRY_COUNT_MIN) {
      return REQUEST_MIN_TIMEOUT_IN_MS;
    }

    return retryCount * REQUEST_TIMEOUT_IN_SECONDS * 1000;
  }

  private _getRetryCount(url: IQueueParams['url']) {
    return this._retryCount.get(url) ?? RETRY_COUNT_MIN;
  }

  private _increaseRetryCount(url: IQueueParams['url']) {
    const next = this._getRetryCount(url) + 1;
    this._retryCount.set(url, next);
    return next;
  }

  private _resetRetryCount(url: IQueueParams['url']) {
    this._retryCount.set(url, RETRY_COUNT_MIN);
  }

  /** ходим за данными в лонгполл */
  private async _processUrl(url: IQueueParams['url']) {
    const queueIds: IQueueId[] = [];
    const params: IQueueParams[] = [];

    for (const [queueId, queueParams] of this._queues.entries()) {
      if (queueParams.url !== url) {
        continue;
      }
      queueIds.push(queueId);
      params.push(queueParams);
    }

    if (!queueIds.length || !params.length) {
      this._processing.delete(url);
      return;
    }

    let data: Array<ILongpollResponse<T>>;
    try {
      const requestUrl = createUrl(params, this._logger);
      const response = await this._request(requestUrl);
      data = Array.isArray(response) ? response : [response];
      this._resetRetryCount(url);
    } catch (_) {
      data = [];
      if (this._increaseRetryCount(url) >= RETRY_COUNT_MAX) {
        // наполняем данные фейковыми фейлами
        queueIds.forEach(() => data.push(this._createFailedResponse()));
      }
    } finally {
      this._processing.delete(url);
    }

    for (let i = 0; i < data.length; ++i) {
      this._publish(queueIds[i], data[i]);
      this._updateTs(queueIds[i], data[i]);
    }

    this._start();
  }

  private _request(url: string) {
    // eslint-disable-next-line no-restricted-globals, @vkontakte-internal/vkcom-plugins/no-then
    return fetch(url, this._withCredentials ? { credentials: 'include', mode: 'cors' } : undefined).then(
      (response) => response.json(),
    );
  }

  private _updateTs(queueId: IQueueId, response: ILongpollResponse<T>) {
    if (!isObject(response) || !('ts' in response)) {
      return; // probably error, so do nothing
    }
    const queue = this._queues.get(queueId);
    const timestamp = Number(response.ts);
    if (!isUndefined(queue) && queue.ts < timestamp) {
      queue.ts = timestamp;
    }
  }

  private _createFailedResponse(): ILongpollResponse.Error {
    return { err: 1, failed: 1 };
  }
}
