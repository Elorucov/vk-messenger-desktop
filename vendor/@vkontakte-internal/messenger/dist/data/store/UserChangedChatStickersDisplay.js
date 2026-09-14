import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
import { getLogEventLabel } from '../utils/typeMessagingActionItem';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserChangedChatStickersDisplay': {
            const { peerId, showChatStickers } = action;
            if (draft.locks.setChatStickersDisplay.has(peerId)) {
                return [];
            }
            draft.locks.setChatStickersDisplay.add(peerId);
            const convo = draft.convos.get(peerId);
            if (convo && convo.kind === 'ChatConvo' && convo.stickersParams) {
                Convo.setStickersParams(convo, {
                    ...convo.stickersParams,
                    isKeyboardHidden: !showChatStickers,
                });
            }
            return [
                async function ({ api, stats }) {
                    try {
                        const response = await api.fetch(showChatStickers
                            ? 'stickers.showUGCKeyboard'
                            : 'stickers.hideUGCKeyboard', {
                            owner_id: peerId,
                        });
                        if (response !== 1) {
                            throw Error('Запрос выполнен с ошибкой');
                        }
                        stats.logEvent({
                            type: 'type_action',
                            type_action: {
                                type: 'type_messaging_action_item',
                                type_messaging_action_item: {
                                    action_type: showChatStickers
                                        ? 'show_sticker_chat'
                                        : 'hide_sticker_chat',
                                    label: getLogEventLabel(),
                                },
                            },
                        });
                        return {
                            type: 'UserChangedChatStickersDisplay_RequestCompleted',
                            peerId,
                            hasFailed: false,
                            showChatStickers: showChatStickers,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedChatStickersDisplay_RequestCompleted',
                            peerId,
                            hasFailed: true,
                            showChatStickers: false,
                        };
                    }
                },
            ];
        }
        case 'UserChangedChatStickersDisplay_RequestCompleted': {
            draft.locks.setChatStickersDisplay.delete(action.peerId);
            if (action.hasFailed) {
                const convo = draft.convos.get(action.peerId);
                if (convo && convo.kind === 'ChatConvo' && convo.stickersParams) {
                    Convo.setStickersParams(convo, {
                        ...convo.stickersParams,
                        isKeyboardHidden: action.showChatStickers,
                    });
                }
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserChangedChatStickersDisplay.js.map