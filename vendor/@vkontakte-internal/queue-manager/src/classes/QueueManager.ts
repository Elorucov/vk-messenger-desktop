import type { ICallbackPublish, ICredentialsGetter, Transport } from '../types/Transport';

import { SharedWorkerTransport } from './SharedWorkerTransport';
import { RegularTransport } from './RegularTransport';

import type { IQueueId } from '../types/queue';

/**
 * @todo
 * - пересоздавать транспорт, если отвалился по пингу
 *
 * @example
 * ```
 * const userId = window.vk?.id || 0;
 * const queueIds = [`onlfriends_${userId}`, `calls_${userId}_6287487_0`];
 * const credentialsGetter = (queueId: IQueueId) => {
 * return (): Promise<IQueueParams> => {
 *    return queueSubscribe({ queue_ids: queueId }).then((data) => {
 *      const url = data.base_url;
 *      const { key, timestamp } = data.queues[0];
 *      return { id: userId, key, ts: timestamp, url };
 *    });
 *  };
 * };
 *
 * const initQueueManager = () => {
 * const qm = new QueueManager();
 *
 * const onMessage: ICallbackPublish = (queueId, payload) => {
 *   console.log({ queueId, payload });
 * };
 *
 * const onReset = () => {
 *   qm.destroy();
 *   initQueueManager();
 * };
 *
 * qm.addQueue(queueIds[0], credentialsGetter(queueIds[0]))
 *   .addQueue(queueIds[1], credentialsGetter(queueIds[1]))
 *   .subscribe(onMessage, onReset);
 * };
 *
 * initQueueManager();
 * ```
 */
export class QueueManager {
  private readonly _transport: Transport;

  /**
   *
   * @param debug - включает логирование
   * @param noSharedWorker - принудительно работает без SharedWorker
   * @param withCredentials - включает добавление кук к запросу @see ME-74604
   */
  public constructor({
    debug,
    noSharedWorker,
    withCredentials,
  }: { debug?: boolean; noSharedWorker?: boolean; withCredentials?: boolean } = {}) {
    if (typeof SharedWorker === 'undefined' || noSharedWorker) {
      this._transport = new RegularTransport(withCredentials);
    } else {
      this._transport = new SharedWorkerTransport(withCredentials);
    }

    this.toggleDebug(debug);
  }

  public addQueue(queueId: IQueueId, credentialsGetter: ICredentialsGetter) {
    this._transport?.addQueue(queueId, credentialsGetter);
    return this;
  }

  public removeQueue(queueId: IQueueId) {
    this._transport?.removeQueue(queueId);
    return this;
  }

  /**
   * @param onMessage подписка на сообщения из очереди
   * @param onReset подписка на сообщение о том, что нужно пересоздать `QueueManager`
   */
  public subscribe<T = unknown>(onMessage: ICallbackPublish<T>, onReset?: VoidFunction) {
    this._transport?.subscribe<T>(onMessage, onReset);
    return this;
  }

  /** обязательно вызвать если `QueueManager` больше не нужен */
  public destroy() {
    this._transport?.destroy();
  }

  /**
   * Включает логирование воркера
   * @param enabled
   */
  private toggleDebug(enabled?: boolean) {
    this._transport?.toggleDebug(enabled);
  }
}
