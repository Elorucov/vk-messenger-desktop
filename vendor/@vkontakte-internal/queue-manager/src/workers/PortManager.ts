import type { IClientId, IPortStatus, IWorkerIncomingEvents, IWorkerOutcomingEvent } from '../types/worker';
import { TO_PORT_PING_INTERVAL, TO_PORT_PING_REPLY_WAIT } from './constants';
import type { Logger } from '../common/Logger';

type IOnPortDelete = (clientId: IClientId) => void;

/**
 * Отвечает за работу с портами в SharedWorker.
 * Нужен, следит за актуальными портами на клиенте.
 */
export class PortManager {
  private readonly _ports: Map<IClientId, MessagePort>;
  private _keepAliveTimer: ReturnType<typeof setTimeout> | null;
  private _keepAlivePrevTs: number;

  private readonly _logger: Logger | null;
  private readonly _onPortDisconnect: IOnPortDelete | null;

  public constructor(logger?: Logger, handlePortDisconnect?: IOnPortDelete) {
    this._ports = new Map();
    this._keepAliveTimer = null;
    this._keepAlivePrevTs = 0;
    this._logger = logger || null;
    this._onPortDisconnect = handlePortDisconnect || null;
  }

  public add(clientId: IClientId, port: MessagePort) {
    this._ports.set(clientId, port);
    this._keepAliveCheck();
  }

  public remove(clientId: IClientId) {
    const port = this._ports.get(clientId);
    if (port) {
      port.close();
      port.onmessage = null;
      this._ports.delete(clientId);
    }
  }

  public getPorts() {
    return this._ports;
  }

  public getClientId(port: MessagePort) {
    for (const [clientId, _port] of this._ports.entries()) {
      if (port === _port) {
        return clientId;
      }
    }
    return null;
  }

  private _keepAliveCheck() {
    if (this._keepAliveTimer || /* тут воркер должен умереть */ !this._ports.size) {
      return;
    }

    const start = Date.now();
    this._keepAlivePrevTs = start;
    this._keepAliveTimer = setTimeout(() => {
      const promises: Array<Promise<IPortStatus>> = [];
      this._logger?.log('[ports]', (Date.now() - this._keepAlivePrevTs) / 1000, [...this._ports.entries()]);
      for (const [id, port] of this._ports.entries()) {
        promises.push(
          new Promise((res) => {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            const to = setTimeout(() => {
              port.removeEventListener('message', onMessage);
              res({ id, open: false });
            }, TO_PORT_PING_REPLY_WAIT);
            function onMessage(ev: MessageEvent<IWorkerIncomingEvents>) {
              self._logger?.log('[onMessage]', ev.data);
              if (ev.data.type === 'pong') {
                clearTimeout(to);
                port.removeEventListener('message', onMessage);
                res({ id, open: true });
              }
            }
            const data: IWorkerOutcomingEvent.Ping = { type: 'ping', payload: id };
            port.addEventListener('message', onMessage);
            port.postMessage(data);
          }),
        );
      }
      Promise.all(promises)
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        .then((results) => {
          this._logger?.log('results', results);
          for (const result of results) {
            if (!result.open) {
              this.remove(result.id);
              this._onPortDisconnect?.(result.id);
            }
          }
          this._logger?.log('size', this.getPorts().size);
        })
        .finally(() => {
          this._keepAliveTimer = null;
          this._keepAliveCheck();
        });
    }, TO_PORT_PING_INTERVAL);
  }
}
