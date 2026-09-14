import { useState, useEffect } from 'react';
/**
 * Нужно синхронизировать с переменной `--transitionMessageHighlightDuration` в
 * `base.css`.
 */
const HIGHLIGHT_DURATION = 1000;
/**
 * Хук, контролирующий анимацию подсвечивания сообщения.
 */
export function useMessageBlockHighlight(shouldHighlight) {
    const [isHighlighted, setIsHighlighted] = useState(false);
    useEffect(() => {
        if (!shouldHighlight?.value || isHighlighted) {
            return;
        }
        setIsHighlighted(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldHighlight]);
    useEffect(() => {
        if (!isHighlighted) {
            return;
        }
        const timeoutId = setTimeout(() => {
            setIsHighlighted(false);
        }, HIGHLIGHT_DURATION);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [isHighlighted]);
    return isHighlighted;
}
//# sourceMappingURL=useMessageBlockHighlight.js.map