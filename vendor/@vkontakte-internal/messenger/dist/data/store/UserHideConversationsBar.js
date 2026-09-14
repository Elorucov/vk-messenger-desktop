import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserHideConversationsBar': {
            if (!draft.conversationsBar) {
                return [];
            }
            const { name } = action;
            if (draft.conversationsBar.name !== name) {
                return [];
            }
            delete draft.conversationsBar;
            return [
                async function hideConversationsBar({ api }) {
                    try {
                        await api.fetch('messages.conversationBarHide', {
                            name,
                        });
                    }
                    catch { }
                    return { type: 'Noop' };
                },
            ];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserHideConversationsBar.js.map