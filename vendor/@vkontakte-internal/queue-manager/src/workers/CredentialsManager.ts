import type { PortManager } from './PortManager';
import type { QueuesManager } from './QueuesManager';

import type { IQueueId } from '../types/queue';
import type { IClientId, IWorkerOutcomingEvent } from '../types/worker';
import type { Logger } from '../common/Logger';

export const CREDENTIALS_INTERVAL = 3000;

export class CredentialsManager {
  private readonly _portManager: PortManager;
  private readonly _queuesManager: QueuesManager;
  private readonly _queueIds: Set<IQueueId>;
  private readonly _lastUsedClient: Map<IQueueId, IClientId>;
  private readonly _logger: Logger;
  private _timeout: ReturnType<typeof setTimeout> | null;

  public constructor(portManager: PortManager, queuesManager: QueuesManager, logger: Logger) {
    this._portManager = portManager;
    this._queuesManager = queuesManager;
    this._queueIds = new Set();
    this._lastUsedClient = new Map();
    this._timeout = null;
    this._logger = logger;
  }

  public request(queueId: IQueueId) {
    this._queueIds.add(queueId);
    this._startProcess();
  }

  public done(queueId: IQueueId) {
    this._queueIds.delete(queueId);
    this._lastUsedClient.delete(queueId);

    if (!this._queueIds.size) {
      this._stopProcess();
    }
  }

  private _processCredentials() {
    this._stopProcess();
    const toRemoveQueueIds: IQueueId[] = [];

    for (const queueId of this._queueIds) {
      const clientIds = this._queuesManager.queryClientsByQueueId(queueId);
      // пока прошло время, клиенты, которые были подписаны на очередь, могли отключиться
      if (!clientIds.length) {
        this._logger.warn(`Client lookup for queueId: ${queueId} returned zero results`);
        toRemoveQueueIds.push(queueId);
        continue;
      }
      // проверяем, сохранился ли с прошлого раза сохраненный клиент
      // тк порядок добавления клиентов сохраняется, тут мы уверены, что
      // опрашиваем их по очереди
      const prevUserClientId = this._lastUsedClient.get(queueId);
      const prevUserClientIndex = clientIds.findIndex((clientId) => clientId === prevUserClientId);
      const nextClientId = clientIds[(prevUserClientIndex + 1) % clientIds.length];

      this._lastUsedClient.set(queueId, nextClientId);
      // получаем порт следующего клиента в очереди запросов
      const port = this._portManager.getPorts().get(nextClientId);
      if (!port) {
        this._logger.warn(`Port for clientId: ${nextClientId} is already closed`);
        continue;
      }
      // опросим порт следующего клиента в очереди
      const eventData: IWorkerOutcomingEvent.RequestCredentials = {
        type: 'request-credentials',
        payload: { queueId, clientId: nextClientId },
      };
      port.postMessage(eventData);
    }

    for (const queueId of toRemoveQueueIds) {
      this.done(queueId);
    }

    if (this._queueIds.size) {
      this._startProcess();
    }
  }

  private _startProcess() {
    if (this._timeout) {
      return;
    }

    this._timeout = setTimeout(() => this._processCredentials(), CREDENTIALS_INTERVAL);
  }

  private _stopProcess() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
  }
}
