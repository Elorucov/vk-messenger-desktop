import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Message from '../../core/model/Message';
import * as Convo from '../../core/model/Convo';
import * as History from '../../core/model/History';
import { getOwnerGroupId, insertPeers } from './State';
import { fromApiMessageReactions } from '../converter/MessageReactionConverter';
/**
 * Это ограничение, установленное беком для метода
 * шорт-поллинга.
 */
const MAX_SHORT_POLL_CMIDS = 100;
export const handler = (draft, action, featureFlags) => {
    if (!featureFlags.vkm_reactions) {
        return [];
    }
    switch (action.type) {
        case 'PollConvoReactions': {
            const { peerId, fromCmid, toCmid } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const slice = History.around(convo.history, fromCmid);
            if (slice === undefined) {
                return [];
            }
            const cmids = slice.nodes
                .reduce((result, node) => {
                const cmid = node.kind === 'Node' ? node.item.cmid : undefined;
                if (cmid !== undefined && cmid >= fromCmid && cmid <= toCmid) {
                    result.push(cmid);
                }
                return result;
            }, [])
                .slice(-MAX_SHORT_POLL_CMIDS);
            const ownerId = draft.ownerId;
            return [
                async function shortPollConvoReactions({ api }) {
                    try {
                        const res = await api.fetch('messages.getMessagesReactions', {
                            peer_id: peerId,
                            cmids: cmids.join(','),
                            extended: 1,
                            group_id: getOwnerGroupId(ownerId),
                        });
                        return {
                            type: 'PollConvoReactions_RequestSucceed',
                            peerId,
                            cmids,
                            apiResponse: res,
                        };
                    }
                    catch { }
                    return {
                        type: 'Noop',
                    };
                },
            ];
        }
        case 'PollConvoReactions_RequestSucceed': {
            const { peerId, apiResponse, cmids } = action;
            insertPeers(draft, {
                apiUsers: apiResponse.profiles || [],
                apiGroups: apiResponse.groups || [],
                apiContacts: apiResponse.contacts || [],
            });
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const responseCmids = new Set(apiResponse.items.map((item) => Message.resolveCmid(item.cmid)));
            let hasUnknownReactions = false;
            //Если в ответе нет сообщения, а в истории оно есть с реакциями, то у него удалили все реакции
            //В таком случае просто очищаем список реакций
            cmids
                .filter((cmid) => !responseCmids.has(cmid))
                .forEach((cmid) => {
                const message = Convo.findMessageByCmid(convo, Message.resolveCmid(cmid));
                if (message?.kind !== 'Normal' || message.reactions.size === 0) {
                    return;
                }
                Message.setReactions(message, []);
            });
            for (const { cmid, counters } of apiResponse.items) {
                const message = Convo.findMessageByCmid(convo, Message.resolveCmid(cmid));
                if (message?.kind !== 'Normal') {
                    continue;
                }
                const reactions = fromApiMessageReactions(counters);
                Message.setReactions(message, Array.from(reactions.values()));
                if (!hasUnknownReactions) {
                    hasUnknownReactions = Array.from(reactions.keys()).some((id) => !draft.messageReactionsConfig.assets.has(id));
                }
            }
            if (hasUnknownReactions) {
                return [
                    async function ({ channelEngine }) {
                        return {
                            type: 'InvalidateMessageReactions',
                            force: true,
                            shouldFetchChannelReactionsMapping: !!channelEngine,
                        };
                    },
                ];
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=PollConvoReactions.js.map