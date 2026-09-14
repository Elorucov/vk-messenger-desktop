import { insertPeers } from '../store/State';
import { exhaustivenessCheck, sleep } from '../../core/utils/misc';
import * as Comment from '../../core/model/Comment';
import * as Peer from '../../core/model/Peer';
import * as VideoConvo from '../../core/model/VideoConvo';
import { fromApiComment } from '../converter/CommentConverter';
export const handler = (draft, action) => {
    switch (action.variant.kind) {
        case 'FromVideoEngine': {
            return handleFromChannelEngine(draft, action.variant);
        }
        case 'FromVideoEngineWithMissingData': {
            return handleFromChannelEngineWithMissingData(draft, action.variant);
        }
        default:
            return exhaustivenessCheck(action.variant);
    }
};
function handleFromChannelEngine(draft, variant) {
    const { next } = variant;
    if (next.kind === 'Failure') {
        const reconnectAttempts = draft.convoConn.reconnectAttempts++;
        return [
            async function resyncComments({ videoEngine }) {
                if (!videoEngine) {
                    return {
                        type: 'Noop',
                    };
                }
                // Не будем спамить АПИ, подождем чуть-чуть для ресинка.
                // Иначе в случае постоянных разрывов лп мы будем перезапрашивать
                // gLPH как бешеные.
                const timeout = Math.min(2 ** reconnectAttempts * 500, 10 * 1000);
                await sleep(timeout);
                try {
                    videoEngine.connect(next.config);
                }
                catch {
                    return { type: 'Noop' };
                }
                return {
                    type: 'VideoEngineBatchReceived',
                    variant: {
                        kind: 'FromVideoEngine',
                        next: await videoEngine.poll(),
                    },
                };
            },
        ];
    }
    const missing = collectMissingData(draft, next);
    if (missing.userIds.size > 0) {
        return [
            async function fetchMissingData({ api }) {
                try {
                    const [response] = await api.fetchMany([
                        missing.userIds.size > 0 && {
                            method: 'users.get',
                            params: {
                                user_ids: Array.from(missing.userIds)
                                    .map(Peer.resolveId)
                                    .map(Peer.toRealId)
                                    .join(','),
                                extended: 1,
                            },
                        },
                    ], { retries: Infinity });
                    return {
                        type: 'VideoEngineBatchReceived',
                        variant: {
                            kind: 'FromVideoEngineWithMissingData',
                            next,
                            response,
                        },
                    };
                }
                catch {
                    return {
                        type: 'Noop',
                    };
                }
            },
        ];
    }
    return handleUpdates(draft, next);
}
function handleFromChannelEngineWithMissingData(draft, variant) {
    const { next, response } = variant;
    if (response) {
        insertPeers(draft, {
            apiUsers: response || [],
            apiGroups: [],
            apiContacts: [],
        });
    }
    return handleUpdates(draft, next);
}
function handleUpdates(draft, next) {
    const handleUpdate = (update) => {
        switch (update.type) {
            case 'video_comment_new':
                return updateNew(draft, update);
            case 'video_comment_delete':
                return updateDelete(draft, update);
            case 'sticker':
            case 'video_like':
                return updateSticker(draft, update);
            case 'env_live':
                return updateEndLive(draft, update);
            default:
                /**
                 * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
                 * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
                 * что знаем.
                 */
                const _typeguard = update;
                return [];
        }
    };
    const limits = {
        like: 0,
        sticker: 0,
    };
    const effects = next.updates
        .reduce((acc, update) => {
        if ((update.type === 'video_like' || update.type === 'sticker') &&
            update.user_id !== draft.viewer.id) {
            const type = update.type === 'video_like' ? 'like' : 'sticker';
            /**
             * Допускаем только 5 апдейтов в батче
             */
            if (++limits[type] > 5) {
                return acc;
            }
        }
        acc.push(update);
        return acc;
    }, [])
        .flatMap(handleUpdate);
    return [
        ...effects,
        async function pollChannelEngine({ videoEngine }) {
            if (!videoEngine) {
                return {
                    type: 'Noop',
                };
            }
            try {
                return {
                    type: 'VideoEngineBatchReceived',
                    variant: {
                        kind: 'FromVideoEngine',
                        next: await videoEngine.poll(),
                    },
                };
            }
            catch {
                return {
                    type: 'Noop',
                };
            }
        },
    ];
}
/**
 * Проверка кэша на наличие всех необходимых данных.
 */
function collectMissingData(draft, next) {
    const userIds = new Set();
    function handleUpdate(update) {
        switch (update.type) {
            case 'video_comment_new':
                if (!draft.peers.has(Peer.resolveId(update.comment.from_id))) {
                    userIds.add(update.comment.from_id);
                }
                break;
            case 'video_comment_delete':
            case 'sticker':
            case 'video_like':
            case 'env_live':
                break;
            default:
                /**
                 * Ничего не делаем, просто игнорируем апдейты, которых не знаем.
                 * При этом добавляем тайпгарды, чтобы быть уверенными, что мы точно обработали все,
                 * что знаем.
                 */
                const _typeguard = update;
                break;
        }
    }
    for (const update of next.updates) {
        handleUpdate(update);
    }
    return {
        userIds,
    };
}
function updateNew(draft, update) {
    const { video_id, comment } = update;
    const videoConvo = draft.videoConvos.get(VideoConvo.resolveId(video_id));
    if (videoConvo) {
        VideoConvo.addComment(videoConvo, fromApiComment(comment));
    }
    return [];
}
function updateDelete(draft, update) {
    const { video_id, comment_id } = update;
    const videoConvo = draft.videoConvos.get(VideoConvo.resolveId(video_id));
    if (!videoConvo) {
        return [];
    }
    VideoConvo.deleteComment(videoConvo, Comment.resolveCmid(comment_id));
    return [];
}
function updateSticker(draft, update) {
    const { video_id, type } = update;
    const videoConvo = draft.videoConvos.get(VideoConvo.resolveId(video_id));
    const stickerId = type === 'video_like' ? 'like' : update.sticker.id;
    if (videoConvo && stickerId) {
        return [
            async function sendSticker({ videoStickers }) {
                videoStickers?.send(type === 'video_like' ? 'like' : update.sticker);
                return {
                    type: 'Noop',
                };
            },
        ];
    }
    return [];
}
function updateEndLive(draft, update) {
    const { video_id } = update;
    const videoConvo = draft.videoConvos.get(VideoConvo.resolveId(video_id));
    if (videoConvo) {
        /**
         * Вместо рефетча завершим ЛП и изменим тип, чтобы сообщения стали
         * отправляться не в live режиме. Корректный Attach.Video нам предоставит
         * LiveChecker по завершении трансляции и там же он вызовет обновление
         */
        videoConvo.type = 'video';
        return [
            async function shutdown({ videoEngine }) {
                videoEngine?.shutdown();
                return {
                    type: 'Noop',
                };
            },
        ];
    }
    return [];
}
//# sourceMappingURL=VideoEngineBatchReceived.js.map