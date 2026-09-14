import { isObjectLike, noop } from '@vkontakte/vkjs';
import type { ICallbackPublish, ICredentialsGetter, Transport } from '../types/Transport';
import type { IQueueId } from '../types/queue';
import { Logger } from '../common/Logger';
import { type ICallbackPayload, LongpollManager } from '../common/LongpollManager/LongpollManager';

export class RegularTransport implements Transport {
  private readonly credentialsGetters = new Map<IQueueId, ICredentialsGetter>();
  private readonly credentialsProcessing = new Set<IQueueId>();
  private onMessage: ICallbackPublish<any> = noop;
  private onReset: VoidFunction = noop;

  private readonly logger = new Logger(false, 'RegularTransport');

  private readonly longpollManager: LongpollManager;

  private readonly callbackHandler: ICallbackPayload = (queueId, payload) => {
    this.logger.debug(`response for ${queueId}`, payload);
    const isFailedPayload = isObjectLike(payload) && ('err' in payload || 'failed' in payload);
    if (isFailedPayload) {
      this.longpollManager.remove(queueId);
    }
    this.onMessage(queueId, payload);
    if (isFailedPayload) {
      this.onReset();
    }
  };

  public constructor(withCredentials?: boolean) {
    this.longpollManager = new LongpollManager(this.callbackHandler, this.logger, withCredentials);
  }

  public addQueue(queueID: IQueueId, credentialsGetter: ICredentialsGetter): void {
    this.credentialsGetters.set(queueID, credentialsGetter);
    if (!this.longpollManager.has(queueID)) {
      this.requestCredentials(queueID);
    }
  }

  private async requestCredentials(queueId: IQueueId) {
    const credentialsGetter = this.credentialsGetters.get(queueId);
    if (!credentialsGetter || this.credentialsProcessing.has(queueId)) {
      return;
    }
    this.credentialsProcessing.add(queueId);
    try {
      this.logger.debug(`request credentials for ${queueId}`);
      const credentials = await credentialsGetter();
      this.longpollManager.add(queueId, credentials);
    } catch (err) {
      /** @todo */
      this.logger.error('[requestCredentials]', err);
    } finally {
      this.credentialsProcessing.delete(queueId);
    }
  }

  public removeQueue(queueID: IQueueId): void {
    this.credentialsGetters.delete(queueID);
    this.credentialsProcessing.delete(queueID);
    this.longpollManager.remove(queueID);
  }

  public subscribe<T = unknown>(onMessage: ICallbackPublish<T>, onReset?: VoidFunction): void {
    this.onMessage = onMessage;
    if (onReset) {
      this.onReset = onReset;
    }
  }

  public toggleDebug(enable?: boolean) {
    this.logger.enabled = Boolean(enable);
  }

  public destroy() {
    this.onMessage = noop;
    this.onReset = noop;
    for (let [queueId] of this.credentialsGetters) {
      this.longpollManager.remove(queueId);
    }
  }
}
