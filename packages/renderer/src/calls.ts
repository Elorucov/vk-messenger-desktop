import { MouseEvent as ReactMouseEvent } from 'react'
import {
  IApi,
  ICalls,
  IStats,
  createSnackbar,
} from '@vkontakte-internal/messenger'
import {
  ConversationOption,
  HangupType,
  MediaOption,
  MuteState,
} from '@vkontakte/calls-sdk'
import {
  type IInitParams,
  init as initCalls,
} from '@vkontakte-internal/calls/index'
import { ApiConfig } from '@vkontakte-internal/api-client'
import { langUtils } from './lang'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import {
  CallsAppId,
  CallsEventType,
  CallStatSource,
  ClientStatsPlatform,
  Mode,
  type InitializeParams as InitializeCallParams,
  type ITranslation,
  type IVkId,
  type StartCallOptions,
  type Bridge,
  type CallsEventPayload,
  type CallsQueueServiceSubscribe,
  type CallsQueueServiceUnsubscribe,
  type ICallLongpollEvent,
  type QueueService,
  type INavigateToConvo,
  type INavigateToProfile,
  type OnFatalErrorParams,
  type VKMEConfig,
  type HistoryScreenSections,
  type OnOpenHistoryModalParams,
} from '@vkontakte-internal/calls-core'
import { noop } from '@vkontakte/vkjs'
import { setApiWrappers } from '@vkontakte-internal/calls/helpers/apiGetter'
import { executeGetCallsSettings } from '@vkontakte-internal/calls/services/backend'
import { fetchCallTokenWithApiBaseUrl } from '@vkontakte-internal/calls/services/fetchCallTokenWithApiBaseUrl'
import { Ranges } from '@vkontakte-internal/shared'
import {
  CLIENT_ID,
  CallSubscribers,
  DeviceAccessStatus,
  FeatureFlags,
  IDesktopCalls,
  Translations,
  VKME_VKCALL_CONTAINER_ID,
} from 'vkme-common'
import { mediaSharing } from './libs/mediaSharing'
import { SnackbarProps } from '@vkontakte-internal/messenger/dist/data/store/snackbarStore'
import { commonLogger } from './libs/logger'
import { ElectronRouter } from './env/ElectronRouter'
import { basePath, vkDomain } from './utils/api'
import { userMedia } from './utils/userMedia'
import { startQueueManager } from '@vkontakte-internal/calls/services/queue/start'
import { CredentialCache } from '@vkontakte-internal/calls/services/queue/CredentialCache'
import { IQueueParams } from '@vkontakte-internal/queue-manager/src'
import { getCallStartErrorText } from '@vkontakte-internal/calls/services/sdk/utils'
import { BrowserLangs } from './libs/diImplementations/BrowserLangs'
import { Root } from 'react-dom/client'
import ReactDOM from 'react-dom'
import { renderCallHistory } from './callsHistory'
import { createAPIClientImplementation } from './libs/diImplementations/BrowserAPIClient'

const scope = 'calls'

const DOMAINS = {
  VKID: 'id',
  API: 'api',
  LOGIN: 'login',
} as const

const callSounds = {
  end: 'https://vk.com/mp3/call_end.mp3',
  incoming: 'https://vk.com/mp3/call_incoming.mp3',
  outgoing: 'https://vk.com/mp3/call_outgoing.mp3',
  connected: 'https://vk.com/mp3/call_connected.mp3',
  connecting: 'https://vk.com/mp3/call_connecting.mp3',
}

const requestPermissions = async (isWithVideo: boolean) => {
  const [microphoneAccess, cameraAccess] = await Promise.all([
    window._device?.checkMicrophoneAccess(),
    window._device?.checkCameraAccess(),
  ]).catch((error) => {
    commonLogger.error('renderer', scope, error)
    return [DeviceAccessStatus.DENIED, DeviceAccessStatus.DENIED]
  })

  commonLogger.info(
    'renderer',
    scope,
    'microphoneAccess, cameraAccess',
    microphoneAccess,
    cameraAccess,
  )

  if (microphoneAccess !== DeviceAccessStatus.GRANTED) {
    await window._device?.requestMicrophoneAccess()
  }

  if (cameraAccess !== DeviceAccessStatus.GRANTED && !!isWithVideo) {
    await window._device?.requestCameraAccess()
  }
}

const isCallSource = (source: string): source is CallStatSource => {
  return Boolean(Object.values(CallStatSource).some((s) => s === source))
}

const getCallSource = (source: string): CallStatSource => {
  if (isCallSource(source)) {
    return source
  }

  return CallStatSource.MESSENGER_UNHANDLED_SOURCE
}

// упрощенные функции из монолита
export function getDomain(path = ''): string {
  const prodHostName = 'vk.com'

  return !path ? prodHostName : `${path}.${prodHostName}`
}

function getAppShortUrl(appId: number): string {
  return `https://${getDomain()}/app${appId}`
}

function getApiUrl(): string {
  return `https://${getDomain(DOMAINS.API)}/method`
}

function getAuthUrl(): string {
  return `https://${getDomain(DOMAINS.VKID)}/mini_app_token`
}

export function getLoginUrl(): string {
  return `https://${getDomain(DOMAINS.LOGIN)}`
}

// Функция для закрытия модаки истории (возвращается из window.Calls.showHistoryScreen)
let closeHistoryScreen: () => void | undefined

/**
 * Версия очереди под реализацию для vkme
 */
class CallsQueueService implements QueueService {
  private subscribers: CallsQueueServiceSubscribe[] = []
  public publish(event: ICallLongpollEvent): void {
    this.subscribers.forEach((subscriber) => {
      subscriber(event)
    })
  }
  public subscribe(
    cb1: CallsQueueServiceSubscribe,
  ): CallsQueueServiceUnsubscribe {
    this.subscribers.push(cb1)
    return () => {
      this.subscribers = this.subscribers.filter((cb2) => cb1 !== cb2)
    }
  }
  public destroy(): void {
    this.subscribers = []
  }
}

export class Calls implements IDesktopCalls {
  private readonly userId: number
  private readonly appPrefix: CallStatSource
  private subscribers: CallSubscribers = {}
  private readonly isSferum: boolean
  public readonly env: ICalls.Environment = {
    canOpenDeeplinks: false,
    canNavigateToSeparateSection: false,
    canCreateCall: true,
    canScheduleCall: true,
    canVideoCall: true,
  }
  private readonly queueService = new CallsQueueService()
  private activeCallId: ICalls.ActiveCall | null = null

  public constructor(
    appPrefix: CallStatSource,
    userId: number,
    isSferum: boolean,
    private readonly api: IApi.IApi,
    private readonly stats: IStats.IStats,
    private readonly translations: Translations,
    private readonly featureFlags: FeatureFlags,
  ) {
    this.appPrefix = appPrefix
    this.isSferum = isSferum
    this.userId = userId

    this.subscribeProxy = this.subscribeProxy.bind(this)
    this.unsubscribeProxy = this.unsubscribeProxy.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.syncActiveCall = this.syncActiveCall.bind(this)

    this.startModule().then(() => {
      window.Calls?.store.subscribe(() => {
        this.syncActiveCall()
      })
    })

    Element.prototype.requestFullscreen = async () => {
      commonLogger.debug(
        'renderer',
        scope,
        'registerFullscreenController',
        'requestFullscreen',
      )

      this.onRequestFullscreen()
    }
  }

  private onEvent = (eventType: CallsEventType) => {
    this.subscribers[eventType]?.forEach((sub) => sub.cb())
  }

  private getStartCallOptions = (
    /**
     * Выключать ли по умолчанию не-админам в сферуме мьют на микро
     */
    enableSferumDefaultMutes?: boolean,
    /**
     * Выключать ли по умолчанию не-админам в сферуме
     * возможность записи/эфира и показа экрана
     */
    enableSferumScreenSharingDefaultMutes?: boolean,
  ): Partial<StartCallOptions> | undefined => {
    const options: Partial<StartCallOptions> = {}
    if (this.isSferum) {
      options.conversationOptions = {
        [ConversationOption.REQUIRE_AUTH_TO_JOIN]: true,
        [ConversationOption.FEEDBACK]: false,
      }
      if (enableSferumDefaultMutes) {
        options.mediaOptions = {
          [MediaOption.AUDIO]: MuteState.MUTE,
        }
      }
      if (enableSferumScreenSharingDefaultMutes) {
        options.mediaOptions = {
          ...(options.mediaOptions || {}),
          [MediaOption.SCREEN_SHARING]: MuteState.MUTE_PERMANENT,
        }
        options.conversationFeatures = {
          onlyAdminCanRecordAndTranslation: true,
        }
      }
    }

    return options
  }

  public unsubscribeProxy(eventType: CallsEventType, id: string): void {
    this.subscribers[eventType] = this.subscribers[eventType]?.filter(
      (sub) => sub.id !== id,
    )
  }

  // TODO: удалить после обновления рефа
  //@ts-expect-error
  public subscribe(
    _eventType: CallsEventType,
    _cb: () => void,
  ): undefined | (() => void) {
    throw new Error('Use subscribeProxy for external subscription usage')
  }

  public subscribeProxy(eventType: CallsEventType, id: string): void {
    if (!(eventType in this.subscribers)) {
      this.subscribers[eventType] = []
    }

    const cb = () => {
      window._calls.processSubscribeCallback(eventType, id)
    }

    this.subscribers[eventType]?.push({
      id,
      cb,
    })
  }

  public getActiveCall(): ICalls.ActiveCall | null {
    if (!window.Calls?.isInActiveCall) {
      return null
    }

    const state = window.Calls.store.getState()

    if (!state.callData.callId) {
      return null
    }

    return {
      callId: state.callData.callId,
    }
  }

  /**
   * Синхронизирует состояние в главном окне, если изменилось
   */
  public syncActiveCall(): void {
    const activeCall = this.getActiveCall()
    if (this.activeCallId?.callId !== activeCall?.callId) {
      this.activeCallId = activeCall || null
      window._calls.onActiveCallChange(activeCall)
      commonLogger.debug(
        'renderer',
        scope,
        'syncActiveCall',
        'Active call id changed, new:',
        this.activeCallId?.callId,
      )
    }
  }

  // p2p звонок
  public callPeer = (
    peerId: number,
    entrypoint: ICalls.Entrypoint,
    isWithVideo?: boolean,
    preselectedIds?: IVkId[],
  ): void => {
    const entry = getCallSource(`${this.appPrefix}_${entrypoint}`)
    if (Ranges.isChatOrChannelPeer(peerId) && window.Calls?.startGroupCall) {
      requestPermissions(Boolean(isWithVideo)).then(() => {
        window.Calls?.startGroupCall(
          peerId,
          undefined,
          preselectedIds || null,
          !!isWithVideo,
          entry,
          undefined,
          undefined,
          this.getStartCallOptions(this.isSferum, false),
        )
          .then(() => {})
          .catch(() => {})

        return
      })
    }

    if (window.Calls?.call && !window.Calls.isInActiveCall) {
      requestPermissions(Boolean(isWithVideo)).then(() => {
        window.Calls?.call({
          vkId: peerId,
          entryPoint: entry,
          isWithVideo,
        })
          .then(() => {})
          .catch(() => {})
      })
    }
  }

  // Присоединиться к звонку по ссылке
  public joinCall = (
    joinLink: string,
    entrypoint: ICalls.Entrypoint,
    isWithVideo?: boolean,
    isWithAudio?: boolean,
  ): void => {
    if (window.Calls?.joinCallByLink && !window.Calls.isInActiveCall) {
      requestPermissions(Boolean(isWithVideo)).then(() => {
        const entryPoint = getCallSource(`${this.appPrefix}_${entrypoint}`)
        window.Calls?.joinCallByLink({
          joinLink,
          entryPoint,
          isWithVideo,
          isWithAudio,
        })
          .then(() => {})
          .catch(() => {})
      })
    }
  }

  // Создать звонок по ссылке
  public startCall = (
    entrypoint: ICalls.Entrypoint,
    isWithVideo?: boolean,
  ): void => {
    if (window.Calls?.startCall && !window.Calls.isInActiveCall) {
      requestPermissions(Boolean(isWithVideo)).then(() => {
        const entry = getCallSource(`${this.appPrefix}_${entrypoint}`)
        window.Calls?.startCall(
          !!isWithVideo,
          entry,
          undefined,
          undefined,
          this.getStartCallOptions(this.isSferum, true),
        )
          .then(() => {})
          .catch(() => {})
      })
    }
  }

  public createNavigateToConvo = (
    callback: VoidFunction = () => {},
  ): INavigateToConvo => {
    return (peerId: number): void => {
      window._calls.processRouterPush({
        kind: 'ConvoRoute',
        peerId: peerId as Peer.Id,
        entrypoint: 'calls',
      })

      if (window.Calls?.store.getState().mode !== Mode.READY) {
        window.Calls?.collapseCall()
      } else {
        window._calls.window.hide()
      }

      callback()
    }
  }
  public createNavigateToProfile = (
    callback: VoidFunction = () => {},
  ): INavigateToProfile => {
    return (event: ReactMouseEvent, link?: string, peerId?: number): void => {
      if (peerId) {
        window._calls.processRouterPush({
          kind: 'PeerPanel',
          peerId: peerId as Peer.Id,
        })
        window.Calls?.collapseCall()

        callback()
      }
      event.preventDefault()
    }
  }

  public openHistory = (section?: HistoryScreenSections): void => {
    // В VK Me используем стилизованную модалку планирования с историей.
    const rootElement = document.querySelector(`#${VKME_VKCALL_CONTAINER_ID}`)
    const bridge = window.Calls
    if (!rootElement || !bridge || !this.api) {
      return
    }

    // eslint-disable-next-line prefer-const
    let root: Root

    const unmount = () => {
      root?.unmount()
    }

    closeHistoryScreen?.()
    closeHistoryScreen = unmount

    root = renderCallHistory({
      api: this.api,
      rootElement: rootElement,
      bridge,
      navigateToConvo: this.createNavigateToConvo(unmount),
      navigateToProfile: this.createNavigateToProfile(unmount),
      subscribe: this.queueService?.subscribe.bind(this.queueService),
      config: {
        ...window.vkmeConfig.callsInitArgs.historyToggles,
        sferum: this.isSferum,
        enableNewHistoryDeletion: true,
      },
      section,
    })
  }

  private onRequestFullscreen = () => {
    commonLogger.debug('renderer', scope, 'onRequestFullscreen')

    window._calls.window.fullscreen()
  }

  public updateConvoCounter = (
    peerId: number,
    inReadBy: number,
    unreadCount: number,
  ): void => {
    window.Calls?.updateChatCounter?.(peerId, unreadCount, inReadBy)
  }

  public restoreCall = (): void => {
    window.Calls?.restoreCall?.()
  }

  public fullscreenCall = (): void => {
    window.Calls?.fullscreenCall?.()
  }

  public showJoinPopup = async (
    vkJoinLink: string,
    entryPoint: ICalls.Entrypoint,
  ): Promise<void> => {
    await window.Calls?.showJoinPopup(
      vkJoinLink,
      entryPoint as CallStatSource,
      true,
    )

    let unsub: VoidFunction | undefined

    // eslint-disable-next-line prefer-const
    unsub = window.Calls?.store.subscribe(() => {
      const state = window.Calls?.store.getState()

      if (state?.mode !== Mode.JOIN) {
        window._calls?.window.hide()
        unsub?.()
      }
    })
  }

  // Следующие методы используются только в веб-версии, оставлены для совместимости типов
  public startCallViaApp = (): void => {}
  public joinCallViaApp = (): void => {}
  public callPeerViaApp = (): void => {}
  public showIncomingCall = (): void => {}

  // CALLSWRAPPER PART

  /** Api для звонков с возможностью перезаписи параметров конфигурации Api,
   * которой в api reforged нет
   */
  private readonly callsApi = async <
    ReqType extends Record<string, unknown>,
    ResType,
  >(
    method: string,
    methodParams: ReqType,
    overrideApiConfig?: ApiConfig,
  ): Promise<ResType> => {
    const optsCast: IApi.Options<keyof IApi.Request> = {
      retries: overrideApiConfig?.maxRetries,
    }

    return this.api.fetchForExternalLibs
      .bind(this.api)(method, methodParams, optsCast)
      .catch((error) => {
        /** TODO: хак для зала ожидания в методе messages.getConversationsByCall
         * здесь пока не знаем в зале мы или нет, но если мы в зале conversation нам не вернется.
         *
         * @link: после этой задачи пофиксится https://jira.mvk.com/browse/CALL-11821
         */
        if (
          error?.apiError?.error_code === 951 ||
          error?.apiError?.error_code === 8
        ) {
          return 0
        }
        throw error
      })
  }

  private readonly startModule = async (): Promise<void> => {
    /**
     * Ничего не делаем, если звонки инициализированы
     */
    if (window.Calls?.initialized) {
      return Promise.resolve()
    }

    if (!window.vkmeConfig) {
      window.vkmeConfig = {} as VKMEConfig
    }

    window.vkmeConfig.callsInitArgs = {
      sferum: this.isSferum,
      vkId: this.userId,
      isVkMePage: true,
    }

    /**
     * Использую apiWrappers чтоб фетчить настройки и токен
     */
    setApiWrappers(
      () => this.callsApi,
      () => this.callsApi,
    )
    const { callsCredentials, toggles, settings } =
      await executeGetCallsSettings(this.userId)
    const { token, apiBaseUrl } = await fetchCallTokenWithApiBaseUrl(
      this.userId,
      callsCredentials.is_dev,
    )

    userMedia.init()
    mediaSharing.init()

    window.lang = Object.assign(
      window.lang || {},
      this.translations?.keys || {},
    )

    const initArgs: InitializeCallParams = {
      callsCredentials,
      sdkToken: token,
      apiBaseUrl,
      onError: console.error,
      onBeforeCallStart: () => {},
      onAfterCallFinish: () => {},
      tabIsMaster: () => true,
      isFriend: () => {},
      toggles: {
        ...toggles,
        videoSlotsCount: settings.video_slots_count,
        browserWarnings: settings.browser_warnings,
        disabledBanners: settings.disabled_banners,
        noiseReductionMode: settings.noise_reduction_mode,
        customScreenSharePacketSize: settings.custom_screen_share_packet_size,
        customScreenShareCongestionControlThreshold:
          settings.custom_screen_share_congestion_control_threshold,
        customExternalDomain: settings.custom_external_domain,
        enableVmoji: true,
        sferum: this.isSferum,
        vkme: true,
        deviceId: settings.device_id,
        temporaryVirtualBackgrounds: settings.temporary_virtual_backgrounds,
        enableSimplePiPVk: false,
        enableSimplePiPSferum: false,
        // В десктопе не требуется
        enableSkipJoinScreenFeature: false,
        customClientStatsPlatform: this.isSferum
          ? ClientStatsPlatform.VK_DESKTOP_MESSENGER_SFERUM
          : ClientStatsPlatform.VK_DESKTOP_MESSENGER,
        customAppId: CallsAppId.DESKTOP_MESSENGER,
        /**
         * в десктопе не работают
         * @see https://jira.mvk.com/browse/ME-71722
         */
        enableMiniViewRedesignSferum: false,
        enableMiniViewRedesignVk: false,
        //
      },
    }

    // принудительно отключаем часть функций для учебных аккаунтов
    if (this.isSferum) {
      initArgs.toggles.enableVmoji = false
      initArgs.toggles.anonymPhoto = false
      initArgs.toggles.debugPersistentLog = true
    }

    // Пока страница для просмотра трансляции не реализована ссылку включаем под ручкой
    const streamUrlExtractor = this.isSferum
      ? ({ ownerId, videoId, link }: ITranslation) => {
          // Идентификаторы помечены как опциональные, поэтому если их не будет, мы не сможем сгенерировать
          // ссылку на трансляцию самостоятельно, и откатываемся к ссылке которую предоставляют звонки
          if (!ownerId || !videoId) {
            // @todo Разобраться с типами в звонках, и понять почему link может не прийти
            return (
              link ?? `${window.location.protocol}//${window.location.host}`
            )
          }

          const router = new ElectronRouter(
            this.featureFlags,
            vkDomain,
            basePath,
          )

          let url = router.toUrl({
            kind: 'MainRoute',
            modal: [
              {
                kind: 'VideoModal',
                ownerId,
                id: videoId,
                accessKey: '',
              },
            ],
          })

          //удаляем хеш из роутера, для ссылки на web.vk.me
          url = url.replace('/#', '')
          // хардкодим ссылку на web.vk.me для трансляций https://jira.mvk.com/browse/ME-52418
          return `https://web.vk.me${url}`
        }
      : undefined

    const notifierGetter: IInitParams['notifierGetter'] = () => {
      return {
        showEvent: (ev) => {
          createSnackbar<SnackbarProps>()({
            message: (ev.title ? ev.title + '\n\n' : '') + ev.text,
            duration: 2000,
            mode: 'dark',
          })
        },
      }
    }

    const mapMonthArrToMonthObject = (months: string[]) =>
      months.reduce<Record<number, string>>((acc, month, i) => {
        acc[i + 1] = month

        return acc
      }, {})

    window.langpack = this.translations.keys

    if (window.langpack) {
      window.langpack['months_of'] = mapMonthArrToMonthObject(
        window.langpack['global_months_of'] || [],
      )
      window.langpack['months_sm_of'] = mapMonthArrToMonthObject(
        window.langpack['global_months_short_of'] || [],
      )

      const globalMonthsCap = window.langpack['global_months_cap']

      if (Array.isArray(globalMonthsCap)) {
        globalMonthsCap.forEach((month, i) => {
          if (window.langpack) {
            window.langpack[`Month${i + 1}`] = month
          }
        })
      }
    }

    const unmount = () => {
      const container = document.getElementById(VKME_VKCALL_CONTAINER_ID)

      if (container) {
        ReactDOM.unmountComponentAtNode(container)
      }
    }

    window.Calls = initCalls({
      // TODO: Заменить Моки на реальные функции - https://jira.mvk.com/browse/ME-55521
      myTrackerUtils: {
        getScreenTimespentCollector: () => ({
          start: () => {},
          finish: () => {},
        }),
        getServiceTimespentCollector: () => ({
          start: () => {},
          finish: () => {},
        }),
        tmrSendTimespentEvent: () => {},
      },
      actionStatCollector: {
        logEvent: (event: IStats.ActionEvent) => {
          this.stats.logEvent({
            type: 'type_action',
            type_action: event,
          })
        },
      },
      saveStatlogEvents: () => {},
      apiWrapper: () => this.callsApi,
      apiWrapperWithAuth: () => this.callsApi,
      navigateToConvo: this.createNavigateToConvo(unmount),
      navigateToProfile: this.createNavigateToProfile(unmount),
      langUtils,
      callSounds,
      streamUrlExtractor,
      removeLeftMenuItemBadge: noop,
      isVkme: true,
      notifierGetter,
      miniAppsBridge: {
        getApiUrl,
        getAppShortUrl,
        getAuthUrl,
        getIsFeatureEnabled: () => false,
        writeAndSendWebStats: () => {},
      },
      vkmeCallContainerId: `#${VKME_VKCALL_CONTAINER_ID}`,
      dependencies: {
        LangsImpl: BrowserLangs,
        APIClientImpl: createAPIClientImplementation(this.api),
      },
    })

    // для того, чтобы тс не ругался
    if (!window.Calls) {
      window.Calls = {} as Bridge
    }
    window.Calls.initArgs = initArgs

    const credentialCache = new CredentialCache<IQueueParams>(
      this.userId,
      CallsAppId.DESKTOP_MESSENGER,
    )
    startQueueManager({
      id: this.userId,
      // Тут звонки загружаются при старте, так что хелпер не нужен
      loadModule: () => Promise.resolve(),
      credentialCache: credentialCache,
      // Принудительно включим, потому что на web.vk.me нет поддержки sharedworker
      regularTransport: true,
      appId: CLIENT_ID,
      withCredentials: true,
      queueService: this.queueService,
    })

    window.Calls.eventBus.on(
      CallsEventType.FATAL_ERROR,
      ({ error }: OnFatalErrorParams) => {
        commonLogger.error('renderer', scope, 'onFatalError', error)
      },
    )

    window.Calls.eventBus.on(
      CallsEventType.OPEN_HISTORY_MODAL,
      ({ section }: OnOpenHistoryModalParams) => {
        this.openHistory(section)
      },
    )

    window.Calls?.eventBus.on(CallsEventType.CALL_STARTED, () => {
      commonLogger.debug('renderer', scope, 'onCallStarted')
      closeHistoryScreen?.()
      window._calls.window.restore()

      this.onEvent(CallsEventType.CALL_STARTED)
    })

    window.Calls?.eventBus.on(CallsEventType.CALL_FINISHED, () => {
      commonLogger.debug('renderer', scope, 'onCallFinished')
      window._calls.window.hide()
      this.onEvent(CallsEventType.CALL_FINISHED)
    })

    window.Calls.eventBus.on(CallsEventType.CALL_FINISHED_LOCALLY, () => {
      commonLogger.debug('renderer', scope, 'onCallFinishedLocally')
      window._calls.window.hide()
      this.onEvent(CallsEventType.CALL_FINISHED_LOCALLY)
    })

    window.Calls.eventBus.on(CallsEventType.CALL_FINISHED_REMOTELY, () => {
      commonLogger.debug('renderer', scope, 'onCallFinishedRemotely')
      window._calls.window.hide()
      this.onEvent(CallsEventType.CALL_FINISHED_REMOTELY)
    })

    window.Calls?.eventBus.on(
      CallsEventType.CALL_ENTERING_ON_ANOTHER_DEVICE,
      () => {
        commonLogger.debug('renderer', scope, 'onCallEnteringOnAnotherDevice')
        window._calls.window.hide()
        window._calls.processHangupModal({
          hangupType: HangupType.ANOTHER_DEVICE,
        })
        this.onEvent(CallsEventType.CALL_ENTERING_ON_ANOTHER_DEVICE)
      },
    )

    window.Calls?.eventBus.on(CallsEventType.OUTGOING_CALL_DECLINED, () => {
      commonLogger.debug('renderer', scope, 'onOutgoingCallDeclined')
      window._calls.window.hide()
      this.onEvent(CallsEventType.OUTGOING_CALL_DECLINED)
    })

    window.Calls?.eventBus.on(CallsEventType.OUTGOING_CALL_CANCELED, () => {
      commonLogger.debug('renderer', scope, 'onOutgoingCallCanceled')
      window._calls.window.hide()
      this.onEvent(CallsEventType.OUTGOING_CALL_CANCELED)
    })

    window.Calls?.eventBus.on(CallsEventType.INCOMING_CALL_STARTED, () => {
      commonLogger.debug('renderer', scope, 'onIncominCallStarted')
      if (!window.Calls?.isInActiveCall) {
        window._calls.window.showIncomingCall()
      }
      this.onEvent(CallsEventType.INCOMING_CALL_STARTED)
    })

    window.Calls?.eventBus.on(CallsEventType.INCOMING_CALL_ACCEPTED, () => {
      commonLogger.debug('renderer', scope, 'onIncomingCallAccepted')
      window._calls.window.restore()
      this.onEvent(CallsEventType.INCOMING_CALL_ACCEPTED)
    })

    window.Calls?.eventBus.on(
      CallsEventType.INCOMING_CALL_ACCEPTED_ON_ANOTHER_DEVICE,
      () => {
        commonLogger.debug(
          'renderer',
          scope,
          'onIncomingCallAcceptedOnAnotherDevice',
        )
        window._calls.window.hide()
        window._calls.processHangupModal({
          hangupType: HangupType.ANOTHER_DEVICE,
        })
        this.onEvent(CallsEventType.INCOMING_CALL_ACCEPTED_ON_ANOTHER_DEVICE)
      },
    )

    window.Calls?.eventBus.on(CallsEventType.INCOMING_CALL_DECLINED, () => {
      commonLogger.debug('renderer', scope, 'onIncomingCallDeclined')
      window._calls.window.hide()
      this.onEvent(CallsEventType.INCOMING_CALL_DECLINED)
    })

    window.Calls?.eventBus.on(CallsEventType.INCOMING_CALL_CANCELED, () => {
      commonLogger.debug('renderer', scope, 'onIncomingCallCanceled')
      window._calls.window.hide()
      this.onEvent(CallsEventType.INCOMING_CALL_CANCELED)
    })

    window.Calls?.eventBus.on<CallsEventPayload<CallsEventType.HANGUP>>(
      CallsEventType.HANGUP,
      ({ hangupReason }) => {
        commonLogger.debug(
          'renderer',
          scope,
          'onHangup',
          hangupReason,
          hangupReason.hangup,
        )

        /**
         * Может дублировать часть логики, что выше
         * https://gitlab.mvk.com/vkcom/vkcom/-/blob/master/static/js/mobile/modules/react_skins/calls/shared/hooks/useSafeDestroy.ts
         */
        if (
          ![
            HangupType.BUSY,
            HangupType.KILLED,
            HangupType.BANNED,
            HangupType.KILLED_WITHOUT_DELETE,
            HangupType.REMOVED,
          ].includes(hangupReason?.hangup)
        ) {
          window._calls.window.hide()
        }

        this.onEvent(CallsEventType.HANGUP)
      },
    )

    window.Calls?.eventBus.on(CallsEventType.SCREEN_SHARING_STARTED, () => {
      commonLogger.debug('renderer', scope, 'onScreenSharingStarted')
      window.Calls?.collapseCall()
      this.onEvent(CallsEventType.SCREEN_SHARING_STARTED)
    })

    window.Calls?.eventBus.on(
      CallsEventType.PARTICIPANT_WAS_KICKED_FROM_CALL,
      () => {
        commonLogger.debug('renderer', scope, 'onParticipantWasKickedFromCall')
        window._calls.window.hide()
        window._calls.processHangupModal({
          hangupType: HangupType.REMOVED,
        })
        this.onEvent(CallsEventType.PARTICIPANT_WAS_KICKED_FROM_CALL)
      },
    )

    window.Calls?.eventBus.on(
      CallsEventType.PARTICIPANT_WAS_BLOCKED_IN_CALL,
      () => {
        commonLogger.debug('renderer', scope, 'onParticipantWasBlockedInCall')
        window._calls.window.hide()
        window._calls.processHangupModal({
          hangupType: HangupType.BANNED,
        })
        this.onEvent(CallsEventType.PARTICIPANT_WAS_BLOCKED_IN_CALL)
      },
    )

    window.Calls?.eventBus.on(CallsEventType.LAYOUT_COLLAPSED, () => {
      commonLogger.debug('renderer', scope, 'onLayoutCollapsed')
      window._calls.window.collapse()
      this.onEvent(CallsEventType.LAYOUT_COLLAPSED)
    })

    window.Calls?.eventBus.on(CallsEventType.LAYOUT_FULLSCREEN, () => {
      commonLogger.debug('renderer', scope, 'onLayoutFullscreen')
      window._calls.window.fullscreen()
      this.onEvent(CallsEventType.LAYOUT_FULLSCREEN)
    })

    window.Calls?.eventBus.on(CallsEventType.LAYOUT_NORMAL, () => {
      commonLogger.debug('renderer', scope, 'onLayoutNormal')
      window._calls.window.restore()
      this.onEvent(CallsEventType.LAYOUT_NORMAL)
    })

    window.Calls?.eventBus.on(CallsEventType.ERROR, (errorMessage: unknown) => {
      commonLogger.error('renderer', scope, 'onError', errorMessage)
      this.onEvent(CallsEventType.ERROR)

      try {
        if (
          typeof errorMessage === 'string' &&
          errorMessage?.indexOf('already in a call')
        ) {
          return
        }

        const customError = getCallStartErrorText(
          errorMessage as Error,
          false,
          langUtils.getLang,
        )

        if (customError) {
          window._calls.processHangupModal({
            customError,
          })
        }
      } catch {}

      window._calls.window.hide()
    })

    window.Calls?.eventBus.on(CallsEventType.HISTORY_MODAL_CLOSED, () => {
      commonLogger.debug('renderer', scope, 'onHistoryModalClosed')
      window._calls.closeHistory()
      this.onEvent(CallsEventType.HISTORY_MODAL_CLOSED)
    })

    await window.Calls?.init(initArgs)
  }
}
