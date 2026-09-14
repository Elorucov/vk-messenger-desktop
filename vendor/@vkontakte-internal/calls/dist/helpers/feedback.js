import { ConversationOption } from '@vkontakte/calls-sdk';
/** получили ли мы конфиг по реакциям */
export const isFeedbackConfigFetched = (state) => {
    return !!state.reactions?.reactions;
};
export const isFeedbackOptionEnabled = (conversationOptions) => {
    return conversationOptions.includes(ConversationOption.FEEDBACK);
};
/** включена ли фича по реакциям в звонке */
export const isFeedbackEnabled = (state) => {
    return isFeedbackOptionEnabled(state.conversationOptions) && isFeedbackConfigFetched(state);
};
/** включена ли панель реакций в звонке */
export const isFeedbackPanelEnabled = (state) => {
    return isFeedbackEnabled(state);
};
/**
 * включена ли фича отображения реакций анимированной
 * колонкой в основном окне звонка
 */
export const isFeedbackColumnEnabled = (state) => {
    return isFeedbackEnabled(state);
};
//# sourceMappingURL=feedback.js.map