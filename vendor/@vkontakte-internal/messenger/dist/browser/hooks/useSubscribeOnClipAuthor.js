import { useCallback, useState } from 'react';
import { useInsertIntoCache, useViewer } from './misc';
import { useApiFetch } from './useApiFetch';
import * as Peer from '../../core/model/Peer';
/**
 * Хук с логикой подписки/отписки на/от автора клипа в истории сообщений
 * */
export function useSubscribeOnClipAuthor({ author, onSubscribeSucceed, onSubscribeFailed, onUnsubscribeSucceed, onUnsubscribeFailed, }) {
    const [isLoading, setIsLoading] = useState(false);
    const apiFetch = useApiFetch();
    const insertIntoCache = useInsertIntoCache();
    const { viewer } = useViewer();
    const isOwnClip = author.id === viewer.id;
    const canSubscribe = !isOwnClip &&
        ((author.kind === 'Group' && author.membership === 'notMember') ||
            (author.kind === 'User' &&
                (author.friendship === 'unfamiliar' ||
                    author.friendship === 'incomingRequest')));
    const canUnsubscribe = (author.kind === 'Group' && author.membership === 'member') ||
        (author.kind === 'User' &&
            (author.friendship === 'friends' ||
                author.friendship === 'outgoingRequest'));
    /** Перезапрашивает пира и обновляет его в кэше */
    const refetchAuthor = useCallback(async () => {
        const id = Peer.toRealId(author.id).toString();
        switch (author.kind) {
            case 'Group':
                const response = await apiFetch('groups.getById', { group_ids: id }, { retries: 2 });
                insertIntoCache({
                    groups: response.groups,
                    dangerouslyOverwrite: true,
                });
                return;
            case 'User':
                const responseUsers = await apiFetch('users.get', { user_ids: id }, { retries: 2 });
                insertIntoCache({
                    profiles: responseUsers,
                    dangerouslyOverwrite: true,
                });
                return;
            default:
                return;
        }
    }, [author.kind, author.id, apiFetch, insertIntoCache]);
    const subscribe = useCallback(async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        try {
            if (author.kind === 'Group') {
                const response = await apiFetch('groups.join', {
                    group_id: Math.abs(author.id),
                });
                if (response === 1) {
                    await refetchAuthor();
                    onSubscribeSucceed();
                }
                else {
                    throw new Error();
                }
            }
            else if (author.kind === 'User') {
                const response = await apiFetch('friends.add', {
                    user_id: author.id,
                    follow: 1,
                });
                if (response === 1 || response === 2) {
                    await refetchAuthor();
                    onSubscribeSucceed();
                }
                else {
                    throw new Error();
                }
            }
        }
        catch {
            onSubscribeFailed();
        }
        finally {
            setIsLoading(false);
        }
    }, [
        author.id,
        author.kind,
        isLoading,
        apiFetch,
        refetchAuthor,
        onSubscribeSucceed,
        onSubscribeFailed,
    ]);
    const unsubscribe = useCallback(async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        try {
            if (author.kind === 'Group') {
                const response = await apiFetch('groups.leave', {
                    group_id: Math.abs(author.id),
                    source: 'im_chat',
                });
                if (response === 1) {
                    refetchAuthor();
                    onUnsubscribeSucceed();
                }
                else {
                    throw new Error();
                }
            }
            else if (author.kind === 'User') {
                const response = await apiFetch('friends.delete', {
                    user_id: author.id,
                });
                if (response.success) {
                    refetchAuthor();
                    onUnsubscribeSucceed();
                }
                else {
                    throw new Error();
                }
            }
        }
        catch {
            onUnsubscribeFailed();
        }
        finally {
            setIsLoading(false);
        }
    }, [
        author.id,
        author.kind,
        isLoading,
        apiFetch,
        refetchAuthor,
        onUnsubscribeSucceed,
        onUnsubscribeFailed,
    ]);
    return {
        canSubscribe,
        canUnsubscribe,
        subscribe,
        unsubscribe,
    };
}
//# sourceMappingURL=useSubscribeOnClipAuthor.js.map