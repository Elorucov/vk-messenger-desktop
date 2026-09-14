import * as Peer from '../../core/model/Peer';
import * as Channel from '../../core/model/Channel';
import * as Viewer from '../../core/model/Viewer';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import { API_ERROR_MESSAGES_SHOULD_BE_EDU, API_ERROR_MESSAGES_SHOULD_NOT_BE_EDU, } from '@vkontakte-internal/api-schema-typescript';
import { getOwnerGroupId, insertChannels, insertConvos, insertPeers, } from '../store/State';
import * as Convo from '../../core/model/Convo';
import { VISIBLE_MESSAGES_COUNT } from '../store/UserRequestChatInvitationLink';
import { IApi } from '../env/IApi';
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'LoadChatMembers': {
            return [];
        }
        case 'UserOpenedConvoProfile': {
            const { peerId, isLinkWithHistory } = action;
            const convo = draft.convos.get(peerId);
            const peer = draft.peers.get(peerId);
            const ownerId = draft.ownerId;
            const viewer = draft.viewer;
            const isEdu = Viewer.isEdu(viewer.profileType);
            if (isEdu) {
                /**
                 * Новая логика загрузки профиля
                 * Загружаем профиль (как раньше) + канал при необходимости
                 */
                if (!convo || (Peer.isGroupPeerId(peerId) && !peer)) {
                    return [
                        async function ({ api }) {
                            try {
                                let convoResponse, channelResponse;
                                if (!convo) {
                                    convoResponse = await api.fetch('messages.getConversationsById', {
                                        peer_ids: peerId.toString(),
                                        extended: 1,
                                        group_id: getOwnerGroupId(ownerId),
                                    }, {
                                        retries: 3,
                                    });
                                }
                                if (Peer.isGroupPeerId(peerId) && !peer) {
                                    try {
                                        channelResponse = await api.fetch('channels.getById', {
                                            channel_ids: peerId.toString(),
                                            extended: 1,
                                        }, {
                                            retries: 3,
                                        });
                                    }
                                    catch (error) {
                                        return {
                                            type: 'UserOpenedConvoProfile_ConvoRequestCompleted',
                                            peerId,
                                            hasFailed: false,
                                            convoResponse,
                                            channelError: error,
                                            isLinkWithHistory,
                                        };
                                    }
                                }
                                return {
                                    type: 'UserOpenedConvoProfile_ConvoRequestCompleted',
                                    peerId,
                                    hasFailed: false,
                                    convoResponse,
                                    channelResponse,
                                    isLinkWithHistory,
                                };
                            }
                            catch (err) {
                                return {
                                    type: 'UserOpenedConvoProfile_ConvoRequestCompleted',
                                    peerId,
                                    hasFailed: true,
                                    error: err,
                                    isLinkWithHistory,
                                };
                            }
                        },
                    ];
                }
                return handler(draft, {
                    type: 'UserOpenedConvoProfile_ConvoRequestCompleted',
                    peerId,
                    hasFailed: false,
                    isLinkWithHistory,
                }, featureFlags, envFeatureFlags);
            }
            else {
                /**
                 * Если диалог не был найден в кэше, загружаем его
                 */
                if (!convo) {
                    return [
                        async function ({ api }) {
                            try {
                                let convoResponse;
                                if (!convo) {
                                    convoResponse = await api.fetch('messages.getConversationsById', {
                                        peer_ids: peerId.toString(),
                                        extended: 1,
                                        group_id: getOwnerGroupId(ownerId),
                                    }, {
                                        retries: 3,
                                    });
                                }
                                return {
                                    type: 'UserOpenedConvoProfile_ConvoRequestCompleted',
                                    peerId,
                                    hasFailed: false,
                                    convoResponse,
                                    isLinkWithHistory,
                                };
                            }
                            catch (err) {
                                return {
                                    type: 'UserOpenedConvoProfile_ConvoRequestCompleted',
                                    peerId,
                                    hasFailed: true,
                                    isLinkWithHistory,
                                };
                            }
                        },
                    ];
                }
            }
            return handler(draft, {
                type: 'UserOpenedConvoProfile_ConvoRequestCompleted',
                peerId,
                hasFailed: false,
                isLinkWithHistory,
            }, featureFlags, envFeatureFlags);
        }
        case 'UserOpenedConvoProfile_ConvoRequestCompleted': {
            const { peerId, convoResponse, channelResponse, hasFailed, channelError, isLinkWithHistory, } = action;
            const ownerId = draft.ownerId;
            const viewer = draft.viewer;
            const isEdu = Viewer.isEdu(viewer.profileType);
            if (hasFailed) {
                if (isDev) {
                    throw new Error('Не удалось загрузить диалог');
                }
                return [
                    async function () {
                        return { type: 'Noop' };
                    },
                ];
            }
            if (convoResponse) {
                insertConvos(draft, convoResponse.items || [], featureFlags);
                insertPeers(draft, {
                    apiUsers: convoResponse.profiles || [],
                    apiGroups: convoResponse.groups || [],
                    apiContacts: convoResponse.contacts || [],
                });
            }
            if (isEdu) {
                if (channelResponse) {
                    insertPeers(draft, {
                        apiUsers: channelResponse.profiles ?? [],
                        apiGroups: channelResponse.groups ?? [],
                        apiContacts: [],
                    });
                    insertChannels(draft, {
                        apiChannels: channelResponse.items ?? [],
                        apiGroups: channelResponse.groups ?? [],
                        featureFlags,
                    });
                }
                if (channelError && channelError instanceof IApi.RequestError) {
                    /**
                     * Обработка ошибки загрузки канала
                     * Сценарий возможен когда пытаемся загрузить канал из другого контура
                     */
                    switch (channelError.code) {
                        case API_ERROR_MESSAGES_SHOULD_NOT_BE_EDU:
                        case API_ERROR_MESSAGES_SHOULD_BE_EDU:
                            const channelId = Channel.resolveId(peerId);
                            draft.channels.set(channelId, {
                                id: channelId,
                                kind: 'ChannelRestricted',
                                needSwitchAccount: true,
                            });
                            break;
                        default:
                            return [
                                async function () {
                                    return { type: 'Noop' };
                                },
                            ];
                    }
                }
            }
            const convo = draft.convos.get(peerId);
            /**
             * Данная ошибка не должна никогда срабатывать, так как экшин вызывается только при наличии convo
             */
            if (!convo) {
                if (isDev) {
                    throw new Error('Диалог не был найден');
                }
                return [];
            }
            const shouldLoadMembers = convo.kind === 'ChatConvo' &&
                convo.members.memberIds.size === 0 &&
                Convo.canReadMembers(convo) &&
                !draft.locks.getConversationMembers.has(peerId);
            if (shouldLoadMembers) {
                draft.locks.getConversationMembers.add(peerId);
            }
            const shouldLoadInviteLinks = convo.kind === 'ChatConvo' && convo.acl.canSeeInviteLink;
            const shouldLoadUGCPackLists = Peer.isChatPeerId(peerId);
            if (shouldLoadMembers) {
                draft.locks.setChatStickersDisplay.add(peerId);
            }
            return [
                shouldLoadMembers &&
                    Peer.isChatPeerId(peerId) &&
                    async function loadChatMembers() {
                        return {
                            type: 'LoadChatMembers',
                            peerId,
                        };
                    },
                shouldLoadInviteLinks &&
                    Peer.isChatPeerId(peerId) &&
                    async function loadInviteLinks({ api }) {
                        try {
                            return {
                                type: 'UserOpenedConvoProfile_InviteLinksCompleted',
                                peerId,
                                isLinkWithHistory,
                                response: await api.fetch('messages.getInviteLink', {
                                    peer_id: peerId,
                                    visible_messages_count: isLinkWithHistory
                                        ? VISIBLE_MESSAGES_COUNT
                                        : 0,
                                    reset: 0,
                                    group_id: getOwnerGroupId(ownerId),
                                }, { retries: 1 }),
                            };
                        }
                        catch { }
                        return { type: 'Noop' };
                    },
                shouldLoadUGCPackLists &&
                    async function loadUGCPackLists({ api }) {
                        try {
                            return {
                                type: 'UserOpenedConvoProfile_UGCPackListsCompleted',
                                peerId,
                                response: await api.fetch('stickers.getUGCPackLists', {
                                    owner_ids: peerId.toString(),
                                }, { retries: 1 }),
                            };
                        }
                        catch { }
                        return { type: 'Noop' };
                    },
            ];
        }
        case 'UserOpenedConvoProfile_InviteLinksCompleted': {
            const { peerId, response: { link }, isLinkWithHistory, } = action;
            const convo = draft.convos.get(peerId);
            if (!convo || convo.kind !== 'ChatConvo' || !link) {
                return [];
            }
            Convo.replaceInviteLinks(convo, {
                ...convo.inviteLinks,
                ...(isLinkWithHistory ? { withHistory: link } : { noHistory: link }),
            });
            return [];
        }
        case 'UserOpenedConvoProfile_UGCPackListsCompleted': {
            const { peerId, response: { lists }, } = action;
            const convo = draft.convos.get(peerId);
            if (!convo || convo.kind !== 'ChatConvo' || !lists[0]) {
                return [];
            }
            const { can_hide_keyboard, can_edit, is_keyboard_hidden, items } = lists[0];
            Convo.setStickersParams(convo, {
                canEdit: can_edit ?? false,
                canHideKeyboard: can_hide_keyboard,
                isKeyboardHidden: is_keyboard_hidden,
                hasStickers: items.length !== 0,
            });
            draft.locks.setChatStickersDisplay.delete(peerId);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserOpenedConvoProfile.js.map