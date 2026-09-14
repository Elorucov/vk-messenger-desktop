import type { IQueueId } from '../types/queue';
import type { IClientId } from '../types/worker';

export type IQueuesMap = Map<IClientId, Set<IQueueId>>;

export class QueuesManager {
  private readonly _queues: IQueuesMap;

  public constructor() {
    this._queues = new Map();
  }

  public addQueue(clientId: IClientId, queueId: IQueueId) {
    if (!this._queues.has(clientId)) {
      this._queues.set(clientId, new Set());
    }

    this._queues.get(clientId)?.add(queueId);
  }

  public removeQueue(clientId: IClientId, queueId: IQueueId) {
    const queue = this._queues.get(clientId);
    if (!queue) {
      return;
    }
    queue.delete(queueId);
    if (!queue.size) {
      this.removeClient(clientId);
    }
  }

  public removeClient(clientId: IClientId) {
    this._queues.delete(clientId);
  }

  public isLast(queueId: IQueueId): boolean {
    for (const queueIds of this._queues.values()) {
      if (queueIds.has(queueId)) {
        return false;
      }
    }
    return true;
  }

  /** возвращает копию массива очередей клиента */
  public getQueuesByClientId(clientId: IClientId) {
    const queuesSet = this._queues.get(clientId);
    return queuesSet ? [...queuesSet.values()] : [];
  }

  public queryClientsByQueueId(queueId: IQueueId) {
    const result: IClientId[] = [];
    for (const [clientId, queues] of this._queues.entries()) {
      if (queues.has(queueId)) {
        result.push(clientId);
      }
    }
    return result;
  }
}
