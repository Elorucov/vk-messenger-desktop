import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as Space from '../../core/model/Space';
import * as Message from '../../core/model/Message';
import * as ThemeStyle from '../../core/model/ThemeStyle';
import { fromApiMessage, fromApiPinnedMessage, } from '../converter/MessageConverter';
import { fromApiKeyboard } from '../converter/BotKeyboardConverter';
import { fromApiConvoBanner } from './ConvoBannerConverter';
import { isPeerDisabledByUserForPopupAutoplay } from '@vkontakte-internal/stickers-kit';
import { fromApiPicture } from '../converter/PictureConverter';
import { fromApiConvoCard } from '../converter/ConvoCardConverter';
const CAN_WRITE_REASON_FROM_CODE = {
    18: 'peer_deleted', // Пользователь заблокирован или удален
    203: 'disabled_by_peer', // Нет доступа к сообществу или ЧС от сообщества
    900: 'peer_blacklisted_by_me', // Нельзя отправить сообщение пользователю, который в чёрном списке
    901: 'peer_blacklisted', // Пользователь запретил присылать ему сообщения от лица сообщества с помощью настроек приватности
    902: 'peer_blacklisted', // Пользователь запретил присылать ему сообщения (заблокировал в p2p сообщениях) с помощью настроек приватности
    915: 'disabled_by_community', // В сообществе отключены сообщения
    916: 'disabled_by_peer', // В сообществе заблокированы сообщения
    917: 'kicked', // Нет доступа к чату
    918: 'no_access', // Нет доступа к e-mail
    922: 'no_access', // Покинул чат
    925: 'no_access', // Не является администратором чата
    932: 'no_access', // Сообщество не может общаться с пользователем (Your community can't interact with this peer)
    945: 'chat_disabled', // чат отключен (в частности, может быть отключен сообществом)
    946: 'chat_unsupported', // чат не поддерживается
    983: 'restricted_to_write_in_chat', // Получил запрет на написание в чат от администратора чата
    984: 'spam_restriction', // Ограничена возможность писать из-за жалоб на спам(можно писать только друзьям)
    985: 'announcements', // Нельзя писать потому, что это чат с анонсами и новостями
    986: 'need_edu_role', // Нельзя написать учителю пока в Сферуме нет роли (см. https://jira.mvk.com/browse/ME-58813)
    987: 'need_message_request', // Нужен одобренный запрос на общение чтобы написать пользователю
    988: 'pending_message_request', // Запрос на общение пока на рассмотрении пользователем
    993: 'chat_moved_to_max', // Чат переехал в макс
    1012: 'forbid_writing_for_all', // Запрещено всем писать в чат, кроме админов
    1021: 'no_conversation', // Сообщество не может инициировать общение с пользователем
};
export function fromApiConvo(featureFlags, apiConvo, apiLastMessage) {
    const message = apiLastMessage && fromApiMessage(featureFlags, apiLastMessage).message;
    const history = {
        confirmed: [],
        pending: [],
    };
    if (message) {
        history.confirmed =
            // Если айди последнего сообщения равен 1, то в чате есть только одно сообщение
            message.cmid > 1
                ? [
                    {
                        kind: 'GapNode',
                        fromCmid: Message.resolveCmid(1),
                        toCmid: Message.resolveCmid(message.cmid - 1),
                    },
                    { kind: 'Node', item: message },
                ]
                : [{ kind: 'Node', item: message }];
    }
    else if (apiConvo.last_conversation_message_id !== undefined &&
        apiConvo.last_conversation_message_id > 0) {
        history.confirmed = [
            {
                kind: 'GapNode',
                fromCmid: 1,
                toCmid: apiConvo.last_conversation_message_id,
            },
        ];
    }
    else if (
    /**
     * Для сообщений сообществ может приходить last_conversation_message_id равный 0
     * при наличии приветственного сообщения. Для получения этого сообщения мы должны
     * загрузить историю.
     * https://jira.mvk.com/browse/ME-51970
     */
    apiConvo.last_conversation_message_id === 0 &&
        apiConvo.peer.type === 'group') {
        history.confirmed = [
            {
                kind: 'GapNode',
                fromCmid: 1,
                toCmid: 1,
            },
        ];
    }
    const keyboard = apiConvo.current_keyboard && fromApiKeyboard(apiConvo.current_keyboard);
    if (keyboard?.kind === 'InlineKeyboard') {
        throw new Error('Не может прийти инлайн клавиатура для сообщения');
    }
    const convoPeerFlags = apiConvo.peer_flags || 0;
    const peerId = Peer.resolveId(apiConvo.peer.id);
    const postponedHistory = {
        confirmed: [
            {
                kind: 'GapNode',
                fromCmid: 1,
                toCmid: 1,
            },
        ],
        pending: [],
    };
    const convo = {
        majorSortId: apiConvo.sort_id?.major_id || 0,
        minorSortId: apiConvo.sort_id?.minor_id || 0,
        isDrafted: false,
        unreadCount: apiConvo.unread_count || 0,
        inReadBy: Message.resolveCmid(apiConvo.in_read_cmid),
        outReadBy: Message.resolveCmid(apiConvo.out_read_cmid),
        spaceId: apiConvo.space_id ? Space.resolveId(apiConvo.space_id) : undefined,
        isNew: !!apiConvo.is_new,
        peerFlags: convoPeerFlags,
        canWrite: fromApiCanWrite(apiConvo),
        currentKeyboard: keyboard,
        push: fromApiPushSettings(apiConvo.push_settings),
        history,
        postponed: {
            history: postponedHistory,
            loaded: false,
            hasError: !!apiConvo.has_postponed_errors,
            count: apiConvo.postponed_count || 0,
        },
        unreadExpireables: new Set((apiConvo.expire_cmids || []).map(Message.resolveCmid)),
        unreadReactions: new Map((apiConvo.unread_reactions || []).map((cmid) => [
            Message.resolveCmid(cmid),
            undefined,
        ])),
        convoBanner: apiConvo.conversation_bar &&
            fromApiConvoBanner(apiConvo.conversation_bar),
        convoCard: apiConvo.conversation_card
            ? fromApiConvoCard(apiConvo.conversation_card)
            : undefined,
        mediaViewerCache: { items: [], hasPrev: true, hasNext: true },
        styleId: ThemeStyle.resolveStyleId(apiConvo.style || 'system'),
        isStickersPopupAutoplayDisabledByAdmin: Boolean(apiConvo.chat_settings?.is_stickers_popup_autoplay_disabled),
        isStickersPopupAutoplayDisabledByUser: isPeerDisabledByUserForPopupAutoplay(peerId),
        isAlive: apiConvo.alive ?? true,
        tags: apiConvo.tags ? new Set(apiConvo.tags) : undefined,
        adsTag: apiConvo.ads_tag,
        transitionData: apiConvo.transition_data &&
            fromApiTransitionData(apiConvo.transition_data),
    };
    switch (apiConvo.peer.type) {
        case 'user': {
            if (!Peer.isUserPeerId(peerId)) {
                return null;
            }
            if (apiConvo.message_request_data !== undefined) {
                const { status } = apiConvo.message_request_data;
                if (status === 'pending' ||
                    status === 'cancelled' ||
                    status === 'rejected') {
                    return {
                        convo: {
                            ...convo,
                            kind: 'MessageRequestUserConvo',
                            peerId,
                            MRStatus: status,
                        },
                    };
                }
                return null;
            }
            return {
                convo: {
                    ...convo,
                    kind: 'UserConvo',
                    peerId,
                },
            };
        }
        case 'chat': {
            if (!Peer.isChatPeerId(peerId)) {
                return null;
            }
            if (!apiConvo.chat_settings) {
                throw new Error('TODO chat convo has to has chat settings');
            }
            /**
             * Несмотря на то что в типах апи схемы ownerId значится как обязательное поле,
             * в него может приходить бесполезный 0, который нам не подходит.
             */
            const ownerId = apiConvo.chat_settings.owner_id && apiConvo.chat_settings.owner_id !== 0
                ? Peer.resolveId(apiConvo.chat_settings.owner_id)
                : undefined;
            const resolvedOwnerId = ownerId && (Peer.isUserPeerId(ownerId) || Peer.isGroupPeerId(ownerId))
                ? ownerId
                : undefined;
            const adminIds = new Set([ownerId, ...(apiConvo.chat_settings.admin_ids || [])].map(Peer.resolveId));
            const convoMembers = {
                count: apiConvo.chat_settings.members_count || 0,
                members: new Map(),
                adminIds,
                memberIds: new Set(),
                invitedIds: new Set(),
                incognitoMembers: new Map(),
            };
            const chatConvo = {
                ...convo,
                peerId,
                ownerId: resolvedOwnerId,
                unreadMentions: new Set((apiConvo.mention_cmids || []).map(Message.resolveCmid)),
                state: apiConvo.chat_settings.state,
                isServiceMessagesDisabled: Boolean(apiConvo.chat_settings.disable_service_messages),
                isCasper: !!apiConvo.chat_settings.is_disappearing,
                isCommunityChat: ownerId ? Peer.isGroupPeerId(ownerId) : false,
                isDonut: !!apiConvo.chat_settings.is_donut,
                isGroupChannel: !!apiConvo.chat_settings.is_group_channel,
                activeCall: fromApiActiveCall(apiConvo.call_in_progress),
                pinnedMessage: apiConvo.chat_settings.pinned_message
                    ? fromApiPinnedMessage(apiConvo.chat_settings.pinned_message)
                    : undefined,
                acl: fromApiAcl(apiConvo.chat_settings.acl),
                permissions: apiConvo.chat_settings.permissions
                    ? fromApiPermissions(apiConvo.chat_settings.permissions)
                    : undefined,
                description: apiConvo.chat_settings.description,
                isService: Boolean(apiConvo.chat_settings.is_service),
                members: convoMembers,
                adminIds,
                shouldShortPollReactions: Boolean(apiConvo.chat_settings.short_poll_reactions),
                isIncognito: apiConvo.chat_settings.is_incognito,
                forbidedWritingForAll: apiConvo.chat_settings.writing_disabled
                    ? fromApiForbidedWritingForAll(apiConvo.chat_settings.writing_disabled)
                    : undefined,
                isDeleted: Boolean(apiConvo.chat_settings.is_deleted_for_all),
            };
            const chatPeer = {
                kind: 'Chat',
                id: peerId,
                isPostponed: false,
                title: apiConvo.chat_settings?.title || '',
                photo: fromApiPicture({
                    baseUrl: apiConvo.chat_settings.photo?.photo_base,
                    photo50: apiConvo.chat_settings.photo?.photo_50,
                    photo100: apiConvo.chat_settings.photo?.photo_100,
                    photo200: apiConvo.chat_settings.photo?.photo_200,
                }),
                hasDefaultPhoto: apiConvo.chat_settings.photo?.is_default_photo ||
                    apiConvo.chat_settings.photo?.is_default_call_photo,
                canCall: apiConvo.chat_settings.acl.can_call,
            };
            if (apiConvo.message_request_data !== undefined) {
                const { status, inviter_id } = apiConvo.message_request_data;
                if ((status === 'pending' ||
                    status === 'rejected' ||
                    status === 'cancelled') &&
                    inviter_id !== undefined) {
                    return {
                        convo: {
                            ...chatConvo,
                            kind: 'MessageRequestChatConvo',
                            inviterPeerId: Peer.resolveId(inviter_id),
                            MRStatus: status,
                        },
                        peer: chatPeer,
                    };
                }
                return null;
            }
            if (apiConvo.peer_flags &&
                (apiConvo.peer_flags & (1 << Convo.PEER_FLAGS.isBusinessNotify)) !== 0) {
                return {
                    convo: {
                        ...chatConvo,
                        kind: 'BusinessNotify',
                    },
                    peer: chatPeer,
                };
            }
            return {
                convo: { ...chatConvo, kind: 'ChatConvo' },
                peer: chatPeer,
            };
        }
        case 'group': {
            if (!Peer.isGroupPeerId(peerId)) {
                return null;
            }
            return {
                convo: {
                    ...convo,
                    isPromo: !!apiConvo.is_promo,
                    peerId,
                    kind: 'GroupConvo',
                },
            };
        }
        case 'email':
            /**
             * Мы не будем саппортить имейлы, это супер старая фигня,
             * которую даже не ясно как дебажить.
             */
            return null;
        case 'contact':
            if (!Peer.isContactPeerId(peerId)) {
                return null;
            }
            return {
                convo: {
                    ...convo,
                    peerId,
                    kind: 'ContactConvo',
                },
            };
        default:
            /**
             * По дефолту будем возвращать null,
             * чтобы если вдруг список расширится,
             * для нас это не стало брейкинг чейнджем.
             *
             * Но все равно проверим на экзостивнесс, чтобы
             * получать ошибки компиляции.
             */
            const _typeguard = apiConvo.peer.type;
            return null;
    }
}
export function fromLongpollPushSettings(update) {
    // @TODO удалить каст после фикса на беке, должен быть всегда number
    const disabledUntil = Number(update[1].disabled_until);
    switch (disabledUntil) {
        case 0:
            return {
                mode: 'everything',
                disabledUntil: 0,
            };
        case -1: {
            return {
                mode: 'every-mention', // нужно получать значение из события, но пока его нет, прописываем дефолт
                disabledUntil: Infinity,
            };
        }
        default:
            return {
                mode: 'every-mention', // нужно получать значение из события, но пока его нет, прописываем дефолт
                disabledUntil: disabledUntil * 1000,
            };
    }
}
function fromApiPushSettings(pushSettings) {
    let push = {
        mode: 'everything',
        disabledUntil: 0,
    };
    if (!pushSettings) {
        return push;
    }
    if (pushSettings.disabled_forever) {
        push = {
            mode: 'every-mention',
            disabledUntil: Infinity,
        };
    }
    else if (pushSettings.disabled_until) {
        push = {
            mode: 'every-mention',
            disabledUntil: pushSettings.disabled_until * 1000,
        };
    }
    if (push.mode !== 'everything') {
        if (pushSettings.disabled_mass_mentions) {
            push = {
                ...push,
                mode: 'direct-mention',
            };
        }
        /**
         * Поскольку настройка disabled_mentions перекрывает настройку
         * disabled_mass_mentions, тут не используем else if.
         *
         * То есть фактически мы перезапишем значение более строгой настройкой
         */
        if (pushSettings.disabled_mentions) {
            push = {
                ...push,
                mode: 'nothing',
            };
        }
    }
    return push;
}
function fromApiCanWrite(apiConvo) {
    if (apiConvo.peer.type === 'chat' &&
        apiConvo.message_request_data?.status === 'rejected') {
        return {
            allowed: false,
            reason: 'mr_rejected',
        };
    }
    if (!apiConvo.can_write?.allowed) {
        return {
            allowed: false,
            reason: (apiConvo.can_write?.reason &&
                CAN_WRITE_REASON_FROM_CODE[apiConvo.can_write.reason]) ||
                'unknown',
            until: apiConvo.can_write?.until
                ? apiConvo.can_write.until * 1000
                : undefined,
        };
    }
    return { allowed: true };
}
function fromApiActiveCall(activeCall) {
    if (!activeCall) {
        return undefined;
    }
    const list = (activeCall.participants.list || []).reduce((acc, id) => {
        const peerId = Peer.resolveAnyId(id);
        if (Peer.isUserPeerId(peerId) || Peer.isGroupPeerId(peerId)) {
            acc.push(peerId);
        }
        return acc;
    }, []);
    return {
        participants: {
            list,
            count: activeCall.participants.count || 0,
        },
        joinLink: activeCall.join_link,
        vkJoinLink: activeCall.vk_join_link,
        canFinishCall: Boolean(activeCall.can_finish_call),
        hasLink: Boolean(activeCall.has_link),
        id: activeCall.call_id,
    };
}
function fromApiPermissions(apiPermissions) {
    return {
        ...Convo.DEFAULT_CHAT_PERMISSIONS,
        ...apiPermissions,
    };
}
function fromApiAcl(apiAcl) {
    return {
        canChangeInfo: apiAcl.can_change_info,
        canChangeInviteLink: apiAcl.can_change_invite_link,
        canChangePin: apiAcl.can_change_pin,
        canInvite: apiAcl.can_invite,
        canPromoteUsers: apiAcl.can_promote_users,
        canSeeInviteLink: apiAcl.can_see_invite_link,
        canModerate: apiAcl.can_moderate,
        canCopyChat: apiAcl.can_copy_chat,
        canCall: apiAcl.can_call,
        canUseMassMentions: apiAcl.can_use_mass_mentions,
        canChangeOwner: Boolean(apiAcl.can_change_owner),
        canChangeServiceType: Boolean(apiAcl.can_change_service_type),
        canChangeStickersPopupAutoplay: Boolean(apiAcl.can_change_stickers_popup_autoplay),
        canChangeStyle: Boolean(apiAcl.can_change_style),
        //TODO: добавить когда появится в api
        canSendReactions: true,
        canDisableServiceMessages: Boolean(apiAcl.can_disable_service_messages),
        canDisableMessagesForwarding: Boolean(apiAcl.can_disable_forward_messages),
        canForwardMessages: apiAcl.can_forward_messages ?? true,
    };
}
function fromApiForbidedWritingForAll(writing_disabled) {
    return {
        value: writing_disabled.value,
        until: writing_disabled.until_ts
            ? writing_disabled.until_ts * 1000
            : undefined,
    };
}
function fromApiTransitionData(apiData) {
    return {
        peerIds: apiData.user_ids?.map((userId) => Peer.resolveRealId('User', userId)) ||
            [],
        link: apiData.link,
    };
}
//# sourceMappingURL=ConvoConverter.js.map