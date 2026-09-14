import { parseRootMargin } from '../../core/utils/misc';
import { useCallback, useEffect, useState } from 'react';
import { observe } from 'react-intersection-observer';
export function useScrollIndent({ wrapper, margin, onTriggerCross, }) {
    const [trigger, setTrigger] = useState(null);
    const [checkIndentTrigger, setCheckIndentTrigger] = useState(0);
    // Вызывает переподписку на обзервер, чтобы вызвать onTriggerCross с
    // актуальным значением.
    const checkIndent = useCallback(() => setCheckIndentTrigger((value) => ++value), []);
    useEffect(() => {
        if (!trigger || !wrapper) {
            return onTriggerCross(false);
        }
        return observe(trigger, onTriggerCross, {
            root: wrapper,
            rootMargin: parseRootMargin(margin),
        });
        // checkIndentTrigger добавлен в зависимости, чтоб работала фукнция checkIndent
    }, [trigger, wrapper, margin, onTriggerCross, checkIndentTrigger]);
    return { setTrigger, checkIndent };
}
//# sourceMappingURL=useScrollIndent.js.map