import { useEffect, useState, useCallback } from 'react';
import * as Peer from '../../../core/model/Peer';
import { useInsertIntoCache } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { API_ERROR_ACCESS, API_ERROR_MESSAGES_CHAT_USER_NO_ACCESS, API_ERROR_PARAM, API_ERROR_UNKNOWN, API_ERROR_MESSAGES_CHAT_WAS_DELETED, API_ERROR_MESSAGES_CHAT_CAN_NOT_BE_JOINED_FOR_NOT_ORGANIZATION_MEMBER, API_ERROR_FLOOD, } from '@vkontakte-internal/api-schema-typescript';
import { IApi } from '../../../data/env/IApi';
import { fromApiPicture } from '../../../data/converter/PictureConverter';
import { useApiFetch } from '../../hooks/useApiFetch';
export const CHAT_PREVIEW_ERRORS_LANG_MAP = {
    [API_ERROR_UNKNOWN]: 'me_unknown_error',
    [API_ERROR_ACCESS]: 'me_error_already_in',
    [API_ERROR_PARAM]: 'me_error_join_link_invalid',
    [API_ERROR_MESSAGES_CHAT_USER_NO_ACCESS]: 'me_error_chat_no_access',
    [API_ERROR_MESSAGES_CHAT_WAS_DELETED]: 'me_error_chat_deleted',
    [API_ERROR_MESSAGES_CHAT_CAN_NOT_BE_JOINED_FOR_NOT_ORGANIZATION_MEMBER]: 'me_error_chat_can_not_be_joined_edu',
    [API_ERROR_FLOOD]: 'me_generic_flood_control_error',
};
export function useChatPreview(params) {
    const apiFetch = useApiFetch();
    const insertIntoCache = useInsertIntoCache();
    const { navigate } = useRouter();
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [isJoiningChat, setIsJoiningChat] = useState(false);
    const { kind, onJoinChat } = params;
    const link = kind === 'Link' || kind === 'ExternalLink' ? params.link : undefined;
    const peerId = kind === 'MR' ? params.peerId : undefined;
    const previewTrackId = IApi.resolveTrackId('messages.getChatPreview', link ?? String(peerId));
    const joinChatTrackId = link !== undefined
        ? IApi.resolveTrackId('messages.joinChatByInviteLink', link)
        : undefined;
    const handleJoinChat = useCallback((chatId) => {
        if (onJoinChat) {
            onJoinChat(chatId);
        }
        else {
            navigate({
                kind: 'ConvoRoute',
                entrypoint: 'convo_invite',
                peerId: chatId,
            });
        }
    }, [onJoinChat, navigate]);
    const joinChat = useCallback(async () => {
        if (kind !== 'Link' && kind !== 'ExternalLink') {
            return;
        }
        if (!preview) {
            throw new Error('Объект `preview` пустой. Сначала получи данные превью чата!');
        }
        if (isJoiningChat) {
            return;
        }
        setIsJoiningChat(true);
        try {
            const res = await apiFetch('messages.joinChatByInviteLink', { link: params.link }, { trackId: joinChatTrackId });
            if (res.chat_id) {
                handleJoinChat(Peer.resolveRealId('Chat', res.chat_id));
            }
            else {
                throw new Error('Метод "messages.joinChatByInviteLink" не вернул chat_id. Такого никогда не должно быть.');
            }
        }
        catch (err) {
            if (err instanceof IApi.RequestError) {
                // Когда человек уже находится в чате, нужно сделать navigate в чат
                if (err.code === API_ERROR_ACCESS && preview?.localId) {
                    handleJoinChat(Peer.resolveRealId('Chat', preview.localId));
                }
                else {
                    setError(err.code);
                }
            }
            else {
                setError(1);
            }
        }
        finally {
            setIsJoiningChat(false);
        }
    }, [
        apiFetch,
        isJoiningChat,
        joinChatTrackId,
        params,
        kind,
        preview,
        handleJoinChat,
    ]);
    useEffect(() => {
        const getChatPreview = async () => {
            try {
                const { preview, profiles, contacts, groups } = await apiFetch('messages.getChatPreview', {
                    link,
                    peer_id: peerId,
                    extended: 1,
                }, { trackId: previewTrackId, retries: 3 });
                insertIntoCache({
                    profiles,
                    contacts,
                    groups,
                });
                // joined - указывает, что мы уже есть в чате (то есть имеем его peer_id). Но, если мы получили MR, то мы тоже получаем его peer_id и значение joined становится true. Поэтому для MR-ов игнорируем данные поля
                if (preview?.joined && preview.local_id && kind !== 'MR') {
                    handleJoinChat(Peer.resolveRealId('Chat', preview.local_id));
                    return;
                }
                setPreview(preview ? fromApiChatPreview(preview) : null);
                setError(null);
                setIsJoiningChat(false);
            }
            catch (err) {
                // Если ошибка от AbortController, скипаем.
                // DOMException бросается при аборте сетевого запроса
                if (err instanceof IApi.AbortError) {
                    return;
                }
                else {
                    setPreview(null);
                    setError(err instanceof IApi.RequestError ? err.code : 1);
                    setIsJoiningChat(false);
                }
            }
        };
        void getChatPreview();
    }, [
        apiFetch,
        joinChatTrackId,
        link,
        peerId,
        previewTrackId,
        insertIntoCache,
        handleJoinChat,
        kind,
    ]);
    return {
        preview,
        error,
        isLoading: preview === null && error !== null,
        ...(kind === 'Link' || kind === 'ExternalLink'
            ? {
                isJoiningChat,
                joinChat,
            }
            : {}),
    };
}
export function fromApiChatPreview(apiPreview) {
    return {
        membersCount: apiPreview?.members_count || 0,
        members: apiPreview.members?.map((id) => Peer.resolveId(id)) || [],
        title: apiPreview.title,
        joined: apiPreview.joined,
        photo: {
            photo: fromApiPicture({
                baseUrl: apiPreview.photo?.photo_base,
                photo50: apiPreview.photo?.photo_50,
                photo100: apiPreview.photo?.photo_100,
                photo200: apiPreview.photo?.photo_200,
            }),
            isDefaultPhoto: apiPreview.photo?.is_default_photo,
        },
        isGroupChannel: apiPreview.chat_settings?.is_group_channel || false,
        isDisappearing: apiPreview.chat_settings?.is_disappearing || false,
        isDonut: apiPreview.chat_settings?.is_donut || false,
        isBigChat: apiPreview.chat_settings?.is_big_chat || false,
        isService: apiPreview.chat_settings?.is_service || false,
        adminId: Peer.resolveId(apiPreview.admin_id),
        ownerId: Peer.resolveId(apiPreview.chat_settings?.owner_id),
        inState: apiPreview.chat_settings?.state || false,
        ...(apiPreview.local_id && {
            localId: Peer.resolveId(apiPreview.local_id),
        }),
        ...(apiPreview.button && {
            button: {
                title: apiPreview.button.title || '',
                action: {
                    type: apiPreview.button.action?.type || '',
                    target: apiPreview.button.action?.target || '',
                    url: apiPreview.button.action?.url || '',
                },
            },
        }),
    };
}
//# sourceMappingURL=useChatPreview.js.map