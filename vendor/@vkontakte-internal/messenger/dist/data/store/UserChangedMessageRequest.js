import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as Organisers from '../../core/model/Organisers';
import { current } from 'immer';
export const handler = (draft, action) => {
    const { type } = action;
    const { viewer } = draft;
    const viewerId = viewer.id;
    switch (type) {
        case 'UserSentMessageRequest': {
            const { peerId } = action;
            if (draft.locks.changeMessageRequest.has(peerId)) {
                return [];
            }
            draft.locks.changeMessageRequest.add(peerId);
            return [
                async function ({ api }) {
                    try {
                        await api.fetch('messages.sendMessageRequest', {
                            peer_id: peerId,
                        });
                        return {
                            type: 'UserAcceptedChatMessageRequest_RequestCompleted',
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserAcceptedChatMessageRequest_RequestCompleted',
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserAcceptedChatMessageRequest': {
            const { peerId } = action;
            if (draft.locks.changeMessageRequest.has(peerId)) {
                return [];
            }
            draft.locks.changeMessageRequest.add(peerId);
            // Не делаем здесь оптимистичный апдейт беседы, а обновляемся из события LP.
            // Чтобы избежать дерганий истории сообщений в беседе-принятом МРе.
            return [
                async function ({ api }) {
                    try {
                        await api.fetch('messages.acceptMessageRequest', {
                            peer_id: peerId,
                            user_id: Peer.toRealId(viewerId),
                        });
                        return {
                            type: 'UserAcceptedChatMessageRequest_RequestCompleted',
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserAcceptedChatMessageRequest_RequestCompleted',
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserRejectedMessageRequest': {
            const { peerId, isSpam, isNewMR = false } = action;
            const convo = draft.convos.get(peerId);
            const prevConvo = current(convo);
            if (convo?.kind !== 'MessageRequestChatConvo' &&
                convo?.kind !== 'MessageRequestUserConvo' &&
                convo?.kind !== 'UserConvo') {
                return [];
            }
            if (draft.locks.changeMessageRequest.has(peerId)) {
                return [];
            }
            draft.locks.changeMessageRequest.add(peerId);
            if (isNewMR) {
                // Согласно новой логике, ничего не делаем в этом случае
            }
            else {
                const rejectedMRConvo = Convo.rejectMR(convo);
                draft.convos.set(peerId, rejectedMRConvo);
                Organisers.refresh(draft.organisers, rejectedMRConvo);
            }
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('messages.rejectMessageRequest', {
                            peer_id: peerId,
                            user_id: Peer.toRealId(viewerId),
                            spam: isSpam ? 1 : 0,
                        });
                        return {
                            type: 'UserRejectedChatMessageRequest_RequestCompleted',
                            hasFailed: response !== 1,
                            peerId,
                            prevConvo,
                            isNewMR,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserRejectedChatMessageRequest_RequestCompleted',
                            hasFailed: true,
                            peerId,
                            prevConvo,
                            isNewMR,
                        };
                    }
                },
            ];
        }
        case 'UserAcceptedChatMessageRequest_RequestCompleted':
        case 'UserSentMessageRequest_RequestCompleted': {
            const { peerId } = action;
            draft.locks.changeMessageRequest.delete(peerId);
            return [];
        }
        case 'UserRejectedChatMessageRequest_RequestCompleted': {
            const { prevConvo, hasFailed, peerId, isNewMR } = action;
            draft.locks.changeMessageRequest.delete(peerId);
            if (isNewMR) {
                // Согласно новой логике, ничего не делаем в этом случае
            }
            else {
                if (hasFailed && prevConvo !== undefined) {
                    draft.convos.set(peerId, prevConvo);
                    Organisers.refresh(draft.organisers, prevConvo);
                }
            }
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=UserChangedMessageRequest.js.map