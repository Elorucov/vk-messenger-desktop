import { Notifications } from '@vkontakte-internal/messenger/dist/browser/env/Notifications'
import { getRoundedAvatarByUrl } from '../utils/getRoundedAvatarByUrl'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import * as Message from '@vkontakte-internal/messenger/dist/core/model/Message'
import {
  exhaustivenessCheck,
  getFirstLetter,
  MIN_INT_32,
} from '@vkontakte-internal/messenger/dist/core/utils/misc'

import type { INotification } from '@vkontakte-internal/messenger/dist/data/env/INotification'
import type { IBrowserEnv } from '@vkontakte-internal/messenger/dist/browser/env/IBrowserEnv'
import { getOwnerGroupId } from '@vkontakte-internal/messenger/dist/data/store/State'
import { BrowserNotifications } from './BrowserNotifications'

// TODO: в репе рефа передалть this.env, this.store, this.noAvatar и this.node на протектед

const MAX_MESSAGE_TEXT_LENGTH = 50

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Из-за доступа к private полям
class ElectronNotifications extends Notifications {
  override playSound(): void {}

  private async getPeerAvatar(peer: Peer.Peer): Promise<string> {
    const peerAvatar = Peer.maxPhotoSizeUrl(peer)

    const getNoAvatar = () =>
      this['noAvatar'].getNoAvatar({
        peerId: peer.id,
        initials: Peer.initials(peer),
      })

    const icon: string = peerAvatar
      ? (await getRoundedAvatarByUrl(peerAvatar)) || getNoAvatar()
      : getNoAvatar()

    return icon
  }

  private getSilentStatus() {
    const notificationSoundOn = (this.env as IBrowserEnv)?.storage?.get(
      'settings-sound-notifications-on',
    )

    if (notificationSoundOn == null) {
      ;(this.env as IBrowserEnv)?.storage?.set(
        'settings-sound-notifications-on',
        true,
      )
    }

    return notificationSoundOn == null ? false : !notificationSoundOn
  }

  override async notify(
    notification: INotification.Notify,
    peerId?: Peer.UserId | Peer.GroupId | Peer.ChatId | Peer.ContactId,
  ): Promise<void> {
    if (!this['env'] || !this['store']) {
      throw new Error('Для работы нотификаций нужны store и env')
    }

    const isCurrentPeerOpened =
      this.env.router.screenRoute.kind === 'ConvoRoute' &&
      this.env.router.screenRoute.peerId === peerId

    const mode = isCurrentPeerOpened ? 'idle' : 'normal'

    if (
      !(
        this.env?.browserNotifications as BrowserNotifications
      )?.isBrowserNotificationsEnabled()
    )
      return

    const showNotify =
      (this.env?.browserNotifications as BrowserNotifications)?.getState() &&
      (mode === 'idle' ? this.env.idle.isIdle() : true)

    if (!showNotify) {
      return
    }

    switch (notification.kind) {
      case 'message':
        this.messageNotification(notification.message)
        break
      case 'reaction':
        this.reactionNotification(
          notification.message,
          notification.reactedPeers,
          notification.reactedCount,
        )
        break
      case 'call':
        this.callNotification(notification).catch(() => {
          // do nothing
        })
        break

      default:
        exhaustivenessCheck(notification)
    }
  }

  private override async messageNotification(
    message: Message.Message,
  ): Promise<void> {
    if (!this.store) {
      throw new Error('Для работы нотификаций нужны store и env')
    }

    const silent = this.getSilentStatus()

    const state = this.store.getState()
    const peer = Peer.safeGet(state.peers, message.peerId)
    const author = Peer.safeGet(state.peers, message.authorId)
    const id = peer.id
    const icon = await this.getPeerAvatar(author)

    const text = await this['getMessageText'](message)

    const title = Peer.name(peer)

    const sentAt = new Date().getTime()
    const randomId = Message.resolveRandomId(-(sentAt % Math.abs(MIN_INT_32)))

    await window._common.showSystemNotification({
      title,
      body: text,
      id,
      icon,
      silent,
      replyData: message.cmid
        ? {
            peerId: message.peerId,
            groupId: getOwnerGroupId(state.ownerId),
            randomId,
            foreign: {
              conversation_message_ids: [message.cmid],
              is_reply: true,
              peer_id: message.peerId,
            },
          }
        : undefined,
    })
  }

  private override async reactionNotification(
    message: Message.Message,
    peers: Peer.Peer[],
    count: number,
  ): Promise<void> {
    if (!this.env || !this.store) {
      throw new Error('Для работы нотификаций нужны store и env')
    }
    const silent = this.getSilentStatus()

    let body = ''

    let messageText = await this['getMessageText'](message, false)

    messageText =
      messageText.length > MAX_MESSAGE_TEXT_LENGTH
        ? messageText.slice(0, MAX_MESSAGE_TEXT_LENGTH) + '…'
        : messageText

    const state = this.store.getState()
    const peer = Peer.safeGet(state.peers, message.peerId)
    const icon = await this.getPeerAvatar(peer)
    const title = Peer.name(peer)
    const id = peer.id

    //Если передали не всех пиров(не оказалось в кэше), то показываем общий текст
    if (
      peers.length === 0 ||
      (count < 3 && peers.length !== count) ||
      peers.length < 3
    ) {
      body = `${this.env.lang.use('me_notification_reaction_unknown', {
        values: { message: messageText },
      })}`
    } else {
      if (count === 1) {
        if (!peers[0]) {
          return
        }

        body = `${Peer.name(peers[0])}\r\n${this.env.lang.use(
          'me_notification_reaction_single',
          {
            sex: peers[0].kind === 'User' ? peers[0].sex : 'unknown',
            values: { message: messageText },
          },
        )}`
      } else {
        if (count > 3) {
          body = this.env.lang.use('me_notification_reaction_more_then_three', {
            num: count - 2,
            values: {
              count: String(count - 2),
              names: peers
                .slice(0, 2)
                .map((peer) => Peer.name(peer))
                .join(', '),
              message: messageText,
            },
          })
        } else {
          body = this.env?.lang.use('me_notification_reaction_up_to_three', {
            values: {
              names: peers.map((peer) => Peer.name(peer)).join(', '),
              message: messageText,
            },
          })
        }
      }
    }
    await window._common.showSystemNotification({
      title,
      body,
      id,
      icon,
      silent,
    })
  }

  private override async callNotification({
    caller,
    image,
    peerId,
  }: {
    caller: string
    image?: string
    peerId: Peer.Id
  }): Promise<void> {
    if (!this.node) {
      this.node = document.createElement('div')
    }

    const silent = this.getSilentStatus()

    const peerKind = Peer.toKind(peerId)

    let initials

    switch (peerKind) {
      case 'User':
      case 'Contact':
        initials = caller
          .split(/\s/)
          .slice(0, 2)
          .filter(Boolean)
          .map(getFirstLetter)
          .join('')
        break

      case 'Group':
      case 'Chat':
        initials = getFirstLetter(caller)
        break

      default:
        exhaustivenessCheck(peerKind)
    }

    const icon =
      image ||
      //TODO: сделать noAvatar публичным
      this['noAvatar'].getNoAvatar({
        peerId: peerId,
        initials,
      })

    await window._common.showSystemNotification({
      title: caller,
      body: this.env?.lang.use('me_call_inbound_text') || 'Входящий звонок',
      id: peerId,
      icon,
      silent,
    })
  }
}

export { ElectronNotifications }
