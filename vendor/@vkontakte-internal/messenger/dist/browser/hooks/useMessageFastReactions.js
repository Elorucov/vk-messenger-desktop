import { useFeatureFlags } from './misc';
export const useMessageFastReactions = ({ message, isClipOnly, isPostOnly, isReactionsAvailable, canSendReactions, }) => {
    const featureFlags = useFeatureFlags();
    /** Имеется ли реакция текущего пользователя на сообщении */
    const hasViewerReactionOnMessage = message.kind === 'Normal' && message?.reactionId;
    /** Выполнены ли общие условия показа кнопки быстрых реакций */
    const withFastReactionsMenuTrigger = isReactionsAvailable &&
        canSendReactions &&
        message.kind === 'Normal' &&
        !message.isOut &&
        !message.attaches?.channelMessage?.isDeleted &&
        !hasViewerReactionOnMessage;
    /** Выполнены ли специфичные для клипа условия показа кнопки быстрых реакций */
    const withClipFastReactions = withFastReactionsMenuTrigger &&
        featureFlags.vkm_clips_reactions &&
        isClipOnly;
    /** Выполнены ли специфичные для поста условия показа кнопки быстрых реакций */
    const withPostFastReactions = withFastReactionsMenuTrigger &&
        featureFlags.vkm_posts_fast_reactions &&
        isPostOnly;
    return {
        withClipFastReactions,
        withPostFastReactions,
    };
};
//# sourceMappingURL=useMessageFastReactions.js.map