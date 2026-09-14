import { useCallback } from 'react';
/** хук хелпер для управления реакциями и "рукой" */
export const useReactionsController = ({ onHand, onReaction, onTooltipChange, }) => {
    const onReactionClick = useCallback((reaction) => {
        onTooltipChange('hand', false);
        onReaction?.(reaction);
    }, [onReaction]);
    const onHandClick = useCallback(() => {
        onTooltipChange('hand', false);
        onHand?.();
    }, [onHand]);
    return {
        onReactionClick,
        onHandClick,
        onTooltipChange,
    };
};
//# sourceMappingURL=useReactionsController.js.map