import { nanoid } from 'nanoid'
import { IDesktopCalls, CallSubscribers } from 'vkme-common'
import type { CallsEventType } from '@vkontakte-internal/calls-core'

const subscribers: CallSubscribers = {}
const unsub = (eventType: CallsEventType, id: string) => {
  subscribers[eventType] = subscribers[eventType]?.filter(
    (sub) => sub.id !== id,
  )
  window._calls.processCallsMethod({
    method: 'unsubscribeProxy',
    args: [eventType, id],
  })
}

// Декоратор для перенаправления вызовов звонков из окна Мессенджера в окно Звонков
export const callsDecorator: IDesktopCalls = {
  env: {
    canOpenDeeplinks: false,
    canNavigateToSeparateSection: false,
    canCreateCall: true,
    canScheduleCall: true,
    canVideoCall: true,
  },
  callPeer: (...args) => {
    window._calls.processCallsMethod({ method: 'callPeer', args })
  },
  joinCall: (...args) => {
    window._calls.processCallsMethod({ method: 'joinCall', args })
  },
  updateConvoCounter: (...args) => {
    window._calls.processCallsMethod({
      method: 'updateConvoCounter',
      args,
    })
  },
  startCall: (...args) => {
    window._calls.processCallsMethod({ method: 'startCall', args })
  },
  openHistory: (...args) => {
    window._calls.processHistory({ method: 'openHistory', args })
  },
  showJoinPopup: (joinLink, entrypoint) => {
    window._calls.processShowJoinPopup({
      method: 'showJoinPopup',
      args: [joinLink, entrypoint],
    })
  },
  // Следующие методы используются только в веб-версии, оставлены для совместимости типов
  startCallViaApp: () => {},
  joinCallViaApp: () => {},
  callPeerViaApp: () => {},
  showIncomingCall: () => {},
  getActiveCall: () => window._callsActiveCall,
  subscribe(eventType, cb) {
    const id = nanoid()
    if (!(eventType in subscribers)) {
      subscribers[eventType as CallsEventType] = []
    }

    subscribers[eventType as CallsEventType]?.push({
      id,
      cb,
    })

    window._calls.processCallsMethod({
      method: 'subscribeProxy',
      args: [eventType, id],
    })

    return () => unsub(eventType as CallsEventType, id)
  },
  subscribeProxy() {
    throw new Error('Not for decorator usage')
  },
  unsubscribeProxy() {
    throw new Error('Not for decorator usage')
  },
  joinRoom() {
    throw new Error('Not implemented')
  },
  dispose: function (): void {},
}

window._calls.onProcessSubscribeCallback((eventType, id) => {
  subscribers[eventType]?.find((item) => item.id === id)?.cb()
})
