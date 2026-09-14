import { PortManager } from './PortManager';
import { QueuesManager } from './QueuesManager';
import { Logger } from '../common/Logger';
import { CredentialsManager } from './CredentialsManager';
import { type ICallbackPayload, LongpollManager } from '../common/LongpollManager/LongpollManager';

import type { IClientId, IWorkerIncomingEvents, IWorkerOutcomingEvent, IWorkerState } from '../types/worker';
import { isObjectLike } from '@vkontakte/vkjs';

const state: IWorkerState = { debug: false };
// @ts-expect-error TS7017: Can't declare in d.ts because of eslint no var
globalThis.__workerState__ = state;

const logger = new Logger(false, 'SharedWorker');
const portManager = new PortManager(logger, handlePortDisconnect);
const queuesManager = new QueuesManager();
const credentialsManager = new CredentialsManager(portManager, queuesManager, logger);
const longpollManager = new LongpollManager(createPublishController(), logger);

function createPublishController() {
  const callback: ICallbackPayload = (queueId, payload) => {
    // проверяем запрос на наличие ошибки
    if (isObjectLike(payload) && ('err' in payload || 'failed' in payload)) {
      credentialsManager.request(queueId);
      longpollManager.remove(queueId);
    }

    const clientIds = queuesManager.queryClientsByQueueId(queueId);
    const openedPorts = portManager.getPorts();

    for (const clientId of clientIds) {
      const port = openedPorts.get(clientId);
      if (port) {
        const eventData: IWorkerOutcomingEvent.LongpollEvent = {
          type: 'longpoll-event',
          payload: { clientId, data: payload, queueId },
        };
        port.postMessage(eventData);
      }
    }
  };

  return callback;
}

state.portManager = portManager;
state.queues = queuesManager;
state.credentialsManager = credentialsManager;
state.longpollManager = longpollManager;

onconnect = function (event: MessageEvent) {
  logger.warn('[onconnect]', event.ports);
  const port = event.ports[0];
  port.onmessage = createOnMessageHandler(port);
};

/**
 * обрабатываем отключение порта, которое возникает в двух случаях
 *
 * 1. порт получает событие `disconnect`;
 * 2. порт отключается по таймауту на пинге;
 */
function handlePortDisconnect(clientId: IClientId) {
  // сохраняем подписки были клиента
  const queueIds = queuesManager.getQueuesByClientId(clientId);
  // удаляем порт из менеджеров портов и очередей
  portManager.remove(clientId);
  queuesManager.removeClient(clientId);
  // удаляем подписки из менеджера лонгпулла
  for (const queueId of queueIds) {
    // если не осталось больше клиентов с таким же queueId
    // то так же вычищаем longpollManager
    if (queuesManager.isLast(queueId)) {
      longpollManager.remove(queueId);
    }
  }
}

function createOnMessageHandler(port: MessagePort) {
  return function (e: MessageEvent<IWorkerIncomingEvents>) {
    logger.debug('[event]', e.data);
    switch (e.data.type) {
      case 'pong': {
        // handled in keepAliveCheck
        break;
      }
      case 'set-credentials': {
        credentialsManager.done(e.data.payload.queueId);
        longpollManager.add(e.data.payload.queueId, e.data.payload.params, e.data.payload.withCredentials);
        break;
      }
      case 'connect': {
        portManager.add(e.data.payload, port);
        break;
      }
      case 'disconnect': {
        handlePortDisconnect(e.data.payload);
        break;
      }
      case 'debug': {
        logger.enabled = e.data.payload;
        break;
      }
      case 'add-queue': {
        const clientId = portManager.getClientId(port);
        // проверяем, что порт еще живой и не отвалился на пинге
        if (clientId) {
          // добавляем очередь в сет очередей клиента
          queuesManager.addQueue(clientId, e.data.payload.queueId);
          // если в менеджере нет кредов для получения данных - запросим их
          if (!longpollManager.has(e.data.payload.queueId)) {
            credentialsManager.request(e.data.payload.queueId);
          }
        }
        break;
      }
      case 'remove-queue': {
        const clientId = portManager.getClientId(port);
        // проверяем, что порт еще живой и не отвалился на пинге
        if (clientId) {
          const { queueId } = e.data.payload;
          // удаляем очередь из сета очередей клиента
          queuesManager.removeQueue(clientId, queueId);
          // удаляем очередь из запросов longpoll'a
          if (queuesManager.isLast(queueId)) {
            longpollManager.remove(queueId);
          }
        }
        break;
      }
    }
  };
}
