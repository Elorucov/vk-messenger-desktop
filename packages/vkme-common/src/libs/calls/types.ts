import { ICalls } from '@vkontakte-internal/messenger'
import { HangupType } from '@vkontakte/calls-sdk'
import { type CallsEventType } from '@vkontakte-internal/calls-core'

export interface IDesktopCalls extends ICalls.ICalls {
  joinCall: (
    joinLink: string,
    entrypoint: ICalls.Entrypoint,
    isWithVideo?: boolean,
    isWithAudio?: boolean,
  ) => Promise<void> | void
  subscribeProxy(event: CallsEventType, id: string): void
  unsubscribeProxy(event: CallsEventType, id: string): void
}

export enum DeviceAccessStatus {
  NOT_DETERMINED = 'not-determined',
  GRANTED = 'granted',
  DENIED = 'denied',
  RESTRICTED = 'restricted',
  UNKNOWN = 'unknown',
}

export type CallsMethodParams = {
  method: keyof Omit<IDesktopCalls, 'env'>
  args: unknown[]
}

export type CallsWindowState =
  | 'normal'
  | 'mini-view'
  | 'full-screen'
  | 'incoming'
  | 'join-popup'
  | 'none'

type CallsWindowToggleEventDetail = {
  state: CallsWindowState
}

export type CallsWindowToggleEventListener = (
  event: CustomEvent<CallsWindowToggleEventDetail>,
) => void

export type JoinCallEventDetail = {
  joinLink: string
  entrypoint: ICalls.Entrypoint
}

export type ShowHangupModalEventDetail = {
  hangupType?: HangupType
  customError?: string
  isMeEndCallForAll?: boolean
  opponentName?: string
}

export type JoinCallEventListener = (
  event: CustomEvent<JoinCallEventDetail>,
) => void

export type CallSubscribers = {
  [K in CallsEventType]?: Array<{
    id: string
    cb: VoidFunction
  }>
}
