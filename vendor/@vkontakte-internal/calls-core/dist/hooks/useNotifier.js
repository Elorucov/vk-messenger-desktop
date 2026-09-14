import { useCallback } from 'react';
import { noop } from '@vkontakte/vkjs';
/** обертка для использования глобальных методов Notifier.js */
export const useNotifier = () => {
    const showErrorMessage = useCallback((...params) => {
        const notifier = window?.Calls?.notifierGetter?.();
        const fn = notifier?.showEvent || noop;
        return fn({
            ...params[0],
            type: 'calls-standalone',
        }, params[1]);
    }, []);
    const showText = useCallback((text) => {
        const notifier = window?.Calls?.notifierGetter?.();
        const fn = notifier?.showEvent || noop;
        return fn({
            type: 'calls-standalone--text',
            text,
        });
    }, []);
    return {
        showErrorMessage,
        showText,
    };
};
//# sourceMappingURL=useNotifier.js.map