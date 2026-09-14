import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Reaction from '../../core/model/Reaction';
import { fromApiReaction } from '../converter/ReactionConverter';
import { Time } from '../../core/utils/time';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'InvalidateMessageReactions': {
            const { shouldFetchChannelReactionsMapping, force } = action;
            if (draft.locks.invalidateMessageReactions) {
                return [];
            }
            draft.locks.invalidateMessageReactions = true;
            return [
                async function loadMessageReactions({ api, storage }) {
                    try {
                        const response = await loadReactionsInvalidatedInfo({
                            api,
                            storage,
                            cacheLifetime: featureFlags.vkm_reactions_sync_time || Time.Day,
                            shouldFetchChannelReactionsMapping,
                            force: Boolean(force),
                        });
                        return {
                            type: 'InvalidateMessageReactions_RequestCompleted',
                            response,
                        };
                    }
                    catch {
                        return {
                            type: 'InvalidateMessageReactions_RequestCompleted',
                        };
                    }
                },
            ];
        }
        case 'InvalidateMessageReactions_RequestCompleted': {
            const { response } = action;
            draft.locks.invalidateMessageReactions = false;
            if (!response) {
                return [];
            }
            const { reactionsAssetsResponse, reactionsMappingResponse } = response;
            const allowedIds = new Set(reactionsAssetsResponse.reaction_ids.map((rawId) => Reaction.resolveId(rawId)));
            const assets = reactionsAssetsResponse.assets.reduce((result, current) => {
                const newAsset = reactionsAssetsResponse.override_assets?.find((asset) => asset.reaction_id === current.reaction_id) ?? current;
                result.set(Reaction.resolveId(newAsset.reaction_id), fromApiReaction(newAsset));
                return result;
            }, new Map());
            draft.messageReactionsConfig = {
                assets,
                allowedIds,
            };
            if (reactionsMappingResponse) {
                const postReactionsIds = new Map(reactionsMappingResponse.mapping.map(({ channel_reaction_id, message_reaction_id }) => [
                    message_reaction_id,
                    channel_reaction_id,
                ]));
                draft.postReactions = reactionsAssetsResponse.assets.reduce((result, current) => {
                    if (postReactionsIds.has(current.reaction_id)) {
                        const newAsset = reactionsAssetsResponse.override_assets?.find((asset) => asset.reaction_id === current.reaction_id) ?? current;
                        result.set(Reaction.resolveId(postReactionsIds.get(current.reaction_id)), {
                            id: Reaction.resolveId(postReactionsIds.get(current.reaction_id)),
                            image: newAsset.links.static,
                            animationSmall: newAsset.links.small_animation,
                            animationBig: newAsset.links.big_animation,
                            name: '',
                        });
                    }
                    return result;
                }, new Map());
            }
            draft.newPostingReactions = reactionsAssetsResponse.reaction_ids.reduce((result, reactionId) => {
                const asset = reactionsAssetsResponse.assets.find((el) => el.reaction_id === reactionId);
                if (asset) {
                    result.set(reactionId, {
                        id: asset.reaction_id,
                        image: asset.links.static,
                        animationSmall: asset.links.small_animation,
                        animationBig: asset.links.big_animation,
                        name: '',
                    });
                }
                return result;
            }, new Map());
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
async function loadReactionsInvalidatedInfo({ api, storage, cacheLifetime, shouldFetchChannelReactionsMapping, force = false, }) {
    const messageReactionsAssetsCache = storage.get('message-reactions-assets');
    const channelReactionsMappingCache = storage.get('channel-reactions-mapping');
    const now = Date.now();
    const isMessageReactionsAssetsOutdated = !messageReactionsAssetsCache ||
        messageReactionsAssetsCache.expiresAt < now ||
        /**
         * Когда фича появится, то надо будет перезагрузить ассеты,
         * т.к. в старых в кэше не будет списка доступных реакций
         */
        !messageReactionsAssetsCache.response.reaction_ids ||
        force;
    const isChannelReactionsMappingOutdated = !channelReactionsMappingCache ||
        channelReactionsMappingCache.expiresAt < now ||
        force;
    /**
     * Сразу берем значение из кеша,
     * чтобы в случае ошибки от АПИ одтать хоть какие-то данные
     */
    let reactionsAssetsResponse = messageReactionsAssetsCache?.response || null;
    let reactionsMappingResponse = channelReactionsMappingCache?.response || null;
    try {
        const [apiAssetsResponse, apiMappingResponse] = await api.fetchMany([
            /**
             * Не передаём версию, т.к. ассеты хранятся не на CDN, а в Storage2 и ссылки могут протухать.
             * Чтобы такого не было раз в сутки полностью запрашиваем все ассеты.
             * (бэк изначально планировал, что клиенты будут кэшировать сами ассеты, а не ссылки)
             */
            isMessageReactionsAssetsOutdated && {
                method: 'messages.getReactionsAssets',
                params: {},
            },
            // Маппинги реакций нужны только в старых каналах
            shouldFetchChannelReactionsMapping &&
                isChannelReactionsMappingOutdated && {
                method: 'channels.getReactionsMapping',
                params: {},
            },
        ], {
            retries: 3,
        });
        if (apiAssetsResponse) {
            reactionsAssetsResponse = apiAssetsResponse;
            storage.set('message-reactions-assets', {
                response: reactionsAssetsResponse,
                expiresAt: now + cacheLifetime,
            });
        }
        if (apiMappingResponse) {
            reactionsMappingResponse = apiMappingResponse;
            storage.set('channel-reactions-mapping', {
                response: reactionsMappingResponse,
                expiresAt: now + cacheLifetime,
            });
        }
    }
    catch { }
    if (!reactionsAssetsResponse) {
        return;
    }
    return {
        reactionsAssetsResponse,
        reactionsMappingResponse,
    };
}
//# sourceMappingURL=InvalidateMessageReactions.js.map