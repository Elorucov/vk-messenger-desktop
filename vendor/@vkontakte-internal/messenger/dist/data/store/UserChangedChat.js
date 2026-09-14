import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as Attach from '../../core/model/Attach';
import { getOwnerGroupId } from '../store/State';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedChatTitle': {
            const { peerId, title } = action;
            const chatId = Peer.toRealId(peerId);
            const peer = draft.peers.get(peerId);
            const ownerId = draft.ownerId;
            if (!peer || peer.kind !== 'Chat') {
                return [];
            }
            const previousTitle = peer.title;
            Peer.updateChatInfo(peer, { title });
            return [
                async function editChat({ api }) {
                    try {
                        const response = await api.fetch('messages.editChat', {
                            chat_id: chatId,
                            title,
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        return {
                            type: 'UserChangedChatTitle_RequestCompleted',
                            hasFailed: response !== 1,
                            peerId,
                            title: response !== 1 ? previousTitle : title,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedChatTitle_RequestCompleted',
                            hasFailed: true,
                            peerId,
                            title: previousTitle,
                        };
                    }
                },
            ];
        }
        case 'UserChangedChatTitle_RequestCompleted': {
            const { peerId, title, hasFailed } = action;
            const peer = draft.peers.get(peerId);
            if (!peer || peer.kind !== 'Chat') {
                return [];
            }
            if (hasFailed) {
                Peer.updateChatInfo(peer, { title });
                return [];
            }
            return [];
        }
        case 'UserChangedChatDescription': {
            const { peerId, description } = action;
            const chatId = Peer.toRealId(peerId);
            const convo = draft.convos.get(peerId);
            const ownerId = draft.ownerId;
            if (!convo ||
                (convo.kind !== 'ChatConvo' && convo.kind !== 'GroupConvo')) {
                return [];
            }
            const previousDescription = convo.description;
            Convo.setDescription(convo, description);
            return [
                async function editChat({ api }) {
                    try {
                        const response = await api.fetch('messages.editChat', {
                            chat_id: chatId,
                            description,
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        return {
                            type: 'UserChangedChatDescription_RequestCompleted',
                            hasFailed: response !== 1,
                            peerId,
                            description: response !== 1 ? previousDescription : description,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedChatDescription_RequestCompleted',
                            hasFailed: true,
                            peerId,
                            description: previousDescription,
                        };
                    }
                },
            ];
        }
        case 'UserChangedChatDescription_RequestCompleted': {
            const { peerId, description, hasFailed } = action;
            const convo = draft.convos.get(peerId);
            if (!convo ||
                (convo.kind !== 'ChatConvo' && convo.kind !== 'GroupConvo')) {
                return [];
            }
            if (hasFailed) {
                Convo.setDescription(convo, description);
                return [];
            }
            return [];
        }
        case 'UserSetChatPhoto': {
            const { peerId, photo } = action;
            const peer = draft.peers.get(peerId);
            if (!peer || peer.kind !== 'Chat') {
                return [];
            }
            Peer.updateChatInfo(peer, {
                photo50: Attach.preview(photo, 50, 50)?.url,
                photo100: Attach.preview(photo, 100, 100)?.url,
                photo200: Attach.preview(photo, 200, 200)?.url,
                photo: photo.originalImage,
                thumbHashUrl: photo.thumbhashUrl,
            });
            return [];
        }
        case 'UserRemovedChatPhoto': {
            const { peerId } = action;
            const ownerId = draft.ownerId;
            const chatId = Peer.toRealId(peerId);
            const peer = draft.peers.get(peerId);
            if (!peer || peer.kind !== 'Chat') {
                return [];
            }
            Peer.updateChatInfo(peer, {
                photo50: undefined,
                photo100: undefined,
                photo200: undefined,
                photo: undefined,
            });
            return [
                async function editChat({ api }) {
                    try {
                        await api.fetch('messages.deleteChatPhoto', {
                            chat_id: chatId,
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        return {
                            type: 'UserRemovedChatPhoto_RequestCompleted',
                            hasFailed: false,
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserRemovedChatPhoto_RequestCompleted',
                            hasFailed: true,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserRemovedChatPhoto_RequestCompleted': {
            return [];
        }
        case 'UserChangedChatSettings': {
            const { peerId, isService, permissions } = action;
            const { stickers_popup_autoplay, ...restPermissions } = permissions;
            const chatId = Peer.toRealId(peerId);
            const ownerId = draft.ownerId;
            return [
                async function editChat({ api }) {
                    try {
                        const response = await api.fetch('messages.editChat', {
                            chat_id: chatId,
                            is_service: isService ? 1 : 0,
                            is_disable_stickers_popup_autoplay: stickers_popup_autoplay === 'off' ? 1 : 0,
                            permissions: JSON.stringify(restPermissions),
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        return {
                            type: 'UserChangedChatSettings_RequestCompleted',
                            hasFailed: response !== 1,
                            permissions,
                            peerId,
                            isService,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedChatSettings_RequestCompleted',
                            hasFailed: true,
                            permissions,
                            peerId,
                            isService,
                        };
                    }
                },
            ];
        }
        case 'UserChangedChatSettings_RequestCompleted': {
            const { peerId, isService, permissions, hasFailed } = action;
            if (hasFailed) {
                return [];
            }
            const convo = draft.convos.get(peerId);
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            Convo.setChatPermissions(convo, permissions, isService);
            return [];
        }
        case 'UserChangedChatMessagesSettings': {
            const { peerId, isServiceMessagesDisabled, isMessagesForwardingDisabled, } = action;
            const chatId = Peer.toRealId(peerId);
            const convo = draft.convos.get(peerId);
            const ownerId = draft.ownerId;
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            const prevIsServiceMessagesDisabled = Convo.isServiceMessagesDisabled(convo);
            const prevIsMessagesForwardingDisabled = Convo.isMessagesForwardingDisabled(convo);
            Convo.setIsServiceMessagesDisabled(convo, isServiceMessagesDisabled);
            Convo.setIsMessagesForwardingDisabled(convo, isMessagesForwardingDisabled);
            return [
                async function editChat({ api }) {
                    try {
                        const response = await api.fetch('messages.editChat', {
                            chat_id: chatId,
                            disable_service_messages: isServiceMessagesDisabled ? 1 : 0,
                            disable_forwarding: isMessagesForwardingDisabled ? 1 : 0,
                            group_id: getOwnerGroupId(ownerId),
                        }, { retries: 1 });
                        const hasFailed = response !== 1;
                        return {
                            type: 'UserChangedChatMessagesSettings_RequestCompleted',
                            hasFailed,
                            peerId,
                            prevIsServiceMessagesDisabled,
                            prevIsMessagesForwardingDisabled,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedChatMessagesSettings_RequestCompleted',
                            hasFailed: true,
                            peerId,
                            prevIsServiceMessagesDisabled,
                            prevIsMessagesForwardingDisabled,
                        };
                    }
                },
            ];
        }
        case 'UserChangedChatMessagesSettings_RequestCompleted': {
            const { peerId, prevIsServiceMessagesDisabled, prevIsMessagesForwardingDisabled, hasFailed, } = action;
            const convo = draft.convos.get(peerId);
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            if (hasFailed) {
                Convo.setIsServiceMessagesDisabled(convo, prevIsServiceMessagesDisabled);
                Convo.setIsMessagesForwardingDisabled(convo, prevIsMessagesForwardingDisabled);
                return [];
            }
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=UserChangedChat.js.map