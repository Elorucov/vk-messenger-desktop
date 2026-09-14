import { useEffect, useRef } from 'react';
export const useHandleBotKeyboardEvents = (state, botKeyboard) => {
    const currentBotKeyboardEventRef = useRef(state.botKeyboardEvent);
    currentBotKeyboardEventRef.current = state.botKeyboardEvent;
    useEffect(() => {
        const prevBotKeyboardEventRef = state.botKeyboardEvent;
        return () => {
            if (currentBotKeyboardEventRef.current &&
                currentBotKeyboardEventRef.current !== prevBotKeyboardEventRef) {
                botKeyboard.update(currentBotKeyboardEventRef.current);
            }
        };
    }, [botKeyboard, state.botKeyboardEvent]);
};
//# sourceMappingURL=useHandleBotKeyboardEvents.js.map