import { GeoLocation } from '@vkontakte-internal/messenger/dist/browser/env/GeoLocation'
import {
  AvatarAreaSelector,
  MEAppMediaMediator,
  MEAppPlayer,
  MEAppVoicePlayer,
  MEAppVideoMessagePlayer,
  Idle,
  Modals,
  Uploader,
  type IStats,
  Storage,
} from '@vkontakte-internal/messenger'
import { rendererApi, vkDomain, webLogger } from './api'
import { FeatureFlags } from 'vkme-common'
import { VoiceRecorder } from '../env/VoiceRecorder'
import { ElectronStats } from '../env/ElectronStats'
import { IOverrideBrowserEnv } from '@vkontakte-internal/messenger'
import { NonEmptyArray } from '@vkontakte-internal/messenger/dist/core/utils/misc'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import * as IPlayer from '@vkontakte-internal/messenger/dist/data/env/IPlayer'

const imageAreaSelector = new AvatarAreaSelector()

type Props = Partial<IOverrideBrowserEnv> &
  Pick<
    Required<IOverrideBrowserEnv>,
    | 'lang'
    | 'botKeyboard'
    | 'router'
    | 'externalEvents'
    | 'storage'
    | 'envFeatureFlags'
  >

const modals = {
  stack: new Modals.Stack(),
  dispose(): void {},
}

export const prepareBrowserEnv = (
  featureFlags: FeatureFlags,
  currentUserId: number,
  storageId: Peer.Id,
  props: Props,
): IOverrideBrowserEnv => {
  const mediaMediator = new MEAppMediaMediator(storageId)
  const player = new MEAppPlayer<IPlayer.ConvoAudioTrack>(
    mediaMediator,
    storageId,
  )
  const voicePlayer = new MEAppVoicePlayer<IPlayer.ConvoVoiceTrack>(
    mediaMediator,
    storageId,
  )
  const videoMessagePlayer = new MEAppVideoMessagePlayer(
    mediaMediator,
    props.storage,
  )

  const idle = new Idle(webLogger, rendererApi.api)
  const uploader = new Uploader(rendererApi.api, featureFlags)
  const voiceRecorder = new VoiceRecorder(
    {
      encoderPath: new URL(
        './encoderWorker.min.js',
        import.meta.url.replace('src/', ''),
      ).href,
    },
    mediaMediator,
    webLogger,
  )

  const sendStatsLog = async (
    events: NonEmptyArray<IStats.ReadyEvent>,
  ): Promise<void> => {
    const response = await rendererApi.api.fetch('statEvents.addWebVKME', {
      events: JSON.stringify(events),
    })

    if (response.failed_ids.length) {
      /**
       * Смысла повторно отправлять неверную статистику нет, поэтому обрабатываем
       * как успешную отправку, но оставляем ошибку в консоли, чтобы заметить подобное
       */
      console.error(
        `[Stats]: Неправильный формат отправки статистики. failed_ids: ${response.failed_ids}`,
      )
    }
  }

  const stats = new ElectronStats(
    featureFlags,
    sendStatsLog,
    props.storage as Storage,
  )
  const geoLocation = new GeoLocation()

  return {
    vkDomain,
    api: rendererApi.api,
    player,
    voicePlayer,
    videoMessagePlayer,
    logger: webLogger,
    idle,
    imageAreaSelector,
    stats,
    geoLocation,
    modals,
    uploader,
    voiceRecorder,
    isEduAvailable: true,
    ...props,
  }
}
