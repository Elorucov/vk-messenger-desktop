import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { getOwnerGroupId, insertConvos, insertPeers, } from '../store/State';
import { current, isDraft } from 'immer';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'VKCOMRightColumnConvosUpdated': {
            const { change, peerId } = action;
            const { peerIds, isLeftColumnConvoListOpened, isVisible, isInited } = draft.VKCOMRightColumnConvos;
            if (!isInited && peerIds.length === 0) {
                /**
                 * Не перезатираем данные в сторадже, пока не получили
                 * чаты из стораджа.
                 */
                return [];
            }
            let newPeerIds = peerIds;
            switch (change) {
                case 'add': {
                    if (peerIds.includes(peerId) || !isVisible) {
                        break;
                    }
                    const convo = draft.convos.get(peerId);
                    if (!convo) {
                        break;
                    }
                    if (action.reason === 'opened') {
                        newPeerIds.unshift(peerId);
                        break;
                    }
                    const shouldAdd = convo?.unreadCount &&
                        !Convo.isMuted(convo) &&
                        !isLeftColumnConvoListOpened;
                    if (shouldAdd) {
                        newPeerIds.push(peerId);
                    }
                    break;
                }
                case 'remove': {
                    newPeerIds = newPeerIds.filter((id) => id !== peerId);
                    break;
                }
                default:
                    exhaustivenessCheck(change);
            }
            draft.VKCOMRightColumnConvos.peerIds = newPeerIds;
            const undraftedPeerIds = isDraft(newPeerIds)
                ? current(newPeerIds)
                : newPeerIds;
            return [
                async function saveConvos({ storage }) {
                    storage.set('vkcom-right-column-peer-ids', undraftedPeerIds, true);
                    return { type: 'Noop' };
                },
            ];
        }
        case 'VKCOMRightColumnDataUpdated': {
            draft.VKCOMRightColumnConvos = {
                ...draft.VKCOMRightColumnConvos,
                ...action.change,
            };
            return [];
        }
        case 'VKCOMRightColumnDataInit': {
            return [
                async function getConvosFromStorage({ storage }) {
                    const rawPeerIds = storage.get('vkcom-right-column-peer-ids', true)?.slice(0, 20) ?? [];
                    const peerIds = rawPeerIds.map((id) => Peer.resolveId(id));
                    return {
                        type: 'VKCOMRightColumnDataLoadConvos',
                        peerIds,
                    };
                },
            ];
        }
        case 'VKCOMRightColumnDataLoadConvos': {
            const { peerIds } = action;
            draft.VKCOMRightColumnConvos.peerIds = peerIds;
            const peerIdsToLoad = peerIds.filter((peerId) => !draft.convos.has(peerId) || !draft.peers.has(peerId));
            if (peerIdsToLoad.length === 0) {
                draft.VKCOMRightColumnConvos.isInited = true;
                return [];
            }
            const ownerId = draft.ownerId;
            const groupId = getOwnerGroupId(ownerId);
            return [
                async function loadConvos({ api }) {
                    try {
                        const response = await api.fetch('messages.getConversationsById', {
                            peer_ids: peerIdsToLoad.join(','),
                            group_id: groupId,
                            extended: 1,
                        }, {
                            retries: 3,
                        });
                        return {
                            type: 'VKCOMRightColumnDataLoadConvos_RequestCompleted',
                            response,
                        };
                    }
                    catch {
                        return {
                            type: 'VKCOMRightColumnDataLoadConvos_RequestCompleted',
                            isFailed: true,
                        };
                    }
                },
            ];
        }
        case 'VKCOMRightColumnDataLoadConvos_RequestCompleted': {
            if (!action.isFailed) {
                const { items, profiles, groups, contacts } = action.response;
                insertConvos(draft, items, featureFlags);
                insertPeers(draft, {
                    apiUsers: profiles || [],
                    apiGroups: groups || [],
                    apiContacts: contacts || [],
                });
            }
            draft.VKCOMRightColumnConvos.isInited = true;
            /**
             * Отфильтровываем чаты, которых нет в сторе.
             * Это либо удаленные чаты, либо запрашиваемые в экшене выше, но
             * неполученные из-за падения запроса.
             */
            draft.VKCOMRightColumnConvos.peerIds =
                draft.VKCOMRightColumnConvos.peerIds.filter((peerId) => draft.convos.has(peerId) && draft.peers.has(peerId));
            return [];
        }
        default:
            return [];
    }
};
//# sourceMappingURL=VKCOMRightColumnConvosUpdated.js.map