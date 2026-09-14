import { v4 } from 'uuid';

import type { Transport, ICallbackPublish, ICredentialsGetter } from '../types/Transport';
import type { IClientId, IWorkerIncomingEvents, IWorkerOutcomingEvents } from '../types/worker';
import type { IQueueId, IQueueParams } from '../types/queue';
import { TO_PORT_PING_INTERVAL } from '../workers/constants';

/**
 * @todo
 * - [X] добавить проверку, что порт живой
 * - [ ] добавить возможность конкатенировать запрос кредов
 */
export class SharedWorkerTransport implements Transport {
  private readonly _worker: SharedWorker;
  private readonly _clientId: IClientId;
  private readonly _onBeforeUnloadLink: VoidFunction;
  private readonly _credentialsGetters: Map<IQueueId, ICredentialsGetter>;
  private readonly _credentialsProcessing: Set<IQueueId>;
  private readonly _withCredentials: boolean;

  /** коллбек на случай, если нужно перезапустить воркера */
  private _onReset?: VoidFunction | null = null;
  /** коллбек получения сообщений из очереди */
  private _onMessage: ICallbackPublish<any> | null = null;

  private _keepAliveTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Включает логирование
   * @private
   */
  private _isDebug = false;

  public constructor(withCredentials = false) {
    this._clientId = v4();
    this._worker = new SharedWorker(new URL('../workers/sharedWorkerTransport.worker', import.meta.url));
    this._onBeforeUnloadLink = this._setBeforeUnloadListener();
    this._credentialsGetters = new Map();
    this._credentialsProcessing = new Set();
    this._withCredentials = withCredentials;

    this._worker.onerror = (err) => console.error(err);
    this._worker.port.onmessage = (ev) => this._handleMessage(ev);
    this._postMessage({ type: 'connect', payload: this._clientId });
    this._worker.port.start();

    this._checkKeepAlivePortInterval();
  }

  private _postMessage(message: IWorkerIncomingEvents) {
    this._worker.port.postMessage(message);
  }

  private _handleMessage(ev: MessageEvent<IWorkerOutcomingEvents>) {
    if (this._isDebug && ev.data.type !== 'ping') {
      console.debug('Message received from worker\n', ev.data);
    }

    switch (ev.data.type) {
      case 'ping': {
        if (ev.data.payload === this._clientId) {
          this._postMessage({ type: 'pong' });
          this._checkKeepAlivePortInterval();
        }
        break;
      }
      case 'longpoll-event': {
        if (ev.data.payload.clientId === this._clientId) {
          this._onMessage?.(ev.data.payload.queueId, ev.data.payload.data);
        }
        break;
      }
      case 'request-credentials': {
        if (ev.data.payload.clientId === this._clientId) {
          this._requestCredentials(ev.data.payload.queueId);
        }
        break;
      }
    }
  }

  /**
   * проверяет на входящие пинги. если не получали > N, то считаем что
   * воркер считает порт умершим и сообщаем об этом клиенту
   */
  private _checkKeepAlivePortInterval() {
    if (this._keepAliveTimeout) {
      clearTimeout(this._keepAliveTimeout);
    }

    this._keepAliveTimeout = setTimeout(
      () => this._onReset?.(),
      TO_PORT_PING_INTERVAL + TO_PORT_PING_INTERVAL / 2,
    );
  }

  /**
   * выствляет коллбек на `'beforeunload'` у `window`
   */
  private _setBeforeUnloadListener() {
    const onBeforeUnload = () => this.destroy();
    window.addEventListener('beforeunload', onBeforeUnload);
    return onBeforeUnload;
  }

  /**
   * делает запрос кредов для воркера по переданной `queueId`
   */
  private async _requestCredentials(queueId: IQueueId) {
    const _credentialsGetter = this._credentialsGetters.get(queueId);
    if (!_credentialsGetter || this._credentialsProcessing.has(queueId)) {
      return;
    }

    this._credentialsProcessing.add(queueId);
    try {
      const credentials = await _credentialsGetter();
      this._postMessage({
        type: 'set-credentials',
        payload: { queueId, params: credentials, withCredentials: this._withCredentials },
      });
    } catch (error) {
      /** @todo */
      console.error('[SharedWorkerTransport][_requestCredentials]', error);
    } finally {
      this._credentialsProcessing.delete(queueId);
    }
  }

  public destroy() {
    this._postMessage({ type: 'disconnect', payload: this._clientId });
    this._worker.port.close();
    window.removeEventListener('beforeunload', this._onBeforeUnloadLink);
    this._onMessage = null;
    this._onReset = null;
  }

  public addQueue(queueId: IQueueId, credentialsGetter: () => Promise<IQueueParams>) {
    this._credentialsGetters.set(queueId, credentialsGetter);
    this._postMessage({ type: 'add-queue', payload: { queueId } });
  }

  public subscribe<T = unknown>(onMessage: ICallbackPublish<T>, onReset?: VoidFunction) {
    this._onMessage = onMessage;
    this._onReset = onReset;
  }

  public removeQueue(queueId: IQueueId) {
    this._credentialsGetters.delete(queueId);
    this._postMessage({ type: 'remove-queue', payload: { queueId } });
  }

  /**
   * Включает логирование
   * @param enable
   */
  public toggleDebug(enable?: boolean) {
    const bool = Boolean(enable);
    this._isDebug = bool;
    this._postMessage({ type: 'debug', payload: bool });
  }
}
