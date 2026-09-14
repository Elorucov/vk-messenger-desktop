import { useRef, useState } from 'react';
/**
 * Хук для создания базового состояния и ссылок (`useRef`) для управления
 * клавиатурной навигацией по контенту.
 */
export function useHistoryKeyboardFocusNavigationState() {
    const composerHandleRef = useRef();
    const controlHandleRef = useRef();
    const [isNavigating, setIsNavigating] = useState(false);
    return { isNavigating, composerHandleRef, controlHandleRef, setIsNavigating };
}
//# sourceMappingURL=useHistoryKeyboardFocusNavigationState.js.map