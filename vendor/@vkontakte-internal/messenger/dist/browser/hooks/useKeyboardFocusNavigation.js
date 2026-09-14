import { useMemo } from 'react';
import { noop } from '../../core/utils/misc';
import { Modifier, localizeNavigationKey } from '../utils/keyBoardCombos';
import { onElementKeyDownFactory } from '../utils/elementKeyDown';
import { isDepsShallowEqual, useMemoWithCustomCompare, } from '../hooks/misc';
/**
 * Создаёт обработчик клавиатурной навигации.
 *
 * @example
 * const Example: React.FC<{}> = () => {
 *   const control = useMemo<FocusControl>(() => ({
 *     autoFocus: async () => {...},
 *     focusPrev: async () => {...},
 *     focusNext: async () => {...},
 *     focusFirst: async () => {...},
 *     focusLast: async () => {...},
 *   }), [])
 *
 *   const onKeyDown = useKeyboardFocusNavigation(control)
 *
 *   return (
 *     <div tabIndex={-1} onKeyDown={onKeyDown}>
 *       {...}
 *     </div>
 *   )
 * }
 */
export function useKeyboardFocusNavigation(control, { kind, factory, ...factoryOptions } = {}) {
    const keysMapping = useMemo(() => {
        switch (kind) {
            case 'list':
                return {
                    prev: ['ArrowUp'],
                    next: ['ArrowDown'],
                };
            case 'menubar':
                return {
                    prev: (keyCombo, dir) => keyCombo === localizeNavigationKey('ArrowLeft', dir),
                    next: (keyCombo, dir) => keyCombo === localizeNavigationKey('ArrowRight', dir),
                    first: ['Home'],
                    last: ['End'],
                };
            default:
                return {
                    prev: ['ArrowUp', 'PageUp'],
                    next: ['ArrowDown', 'PageDown'],
                    first: ['Home'],
                    last: ['End'],
                };
        }
    }, [kind]);
    return useMemoWithCustomCompare(() => {
        const keyDownHandler = (factory || createNavigationHandler)(control, {
            ...factoryOptions,
            ...keysMapping,
        });
        return onElementKeyDownFactory(keyDownHandler);
    }, [control, keysMapping, factoryOptions, factory], isDepsShallowEqual);
}
function createNavigationHandler(control, { disabled, dir, prev, next, first, last, window: win = window, onTabKeyPressed, onNavigation, onFocusError = noop, ...focusOptions }) {
    let focusTimeoutId;
    return (keyCombo, event) => {
        if (disabled || !keyCombo)
            return;
        switch (true) {
            case onTabKeyPressed &&
                (keyCombo === `Tab` || keyCombo === `${Modifier.Shift}+Tab`):
                {
                    onTabKeyPressed(keyCombo, event, {
                        control,
                    });
                    break;
                }
            case checkNavigationHandlerKeysMapping(prev, keyCombo, dir): {
                event.preventDefault();
                control.focusPrev(focusOptions).catch(onFocusError);
                break;
            }
            case checkNavigationHandlerKeysMapping(next, keyCombo, dir): {
                event.preventDefault();
                control.focusNext(focusOptions).catch(onFocusError);
                break;
            }
            case first && checkNavigationHandlerKeysMapping(first, keyCombo, dir): {
                event.preventDefault();
                control.focusFirst(focusOptions).catch(onFocusError);
                break;
            }
            case last && checkNavigationHandlerKeysMapping(last, keyCombo, dir): {
                event.preventDefault();
                control.focusLast(focusOptions).catch(onFocusError);
                break;
            }
            default:
                // Другие комбинации клавиш не обрабатываются.
                return;
        }
        win.clearTimeout(focusTimeoutId);
        // На данном этапе фокус может оставаться на предыдущем элементе, поэтому
        // "откладываем" вызов колбека.
        focusTimeoutId = win.setTimeout(() => {
            onNavigation?.(keyCombo);
        }, 0);
    };
}
export function checkNavigationHandlerKeysMapping(keysMapping, keyCombo, dir) {
    return typeof keysMapping === 'function'
        ? keysMapping(keyCombo, dir)
        : keysMapping.includes(keyCombo);
}
//# sourceMappingURL=useKeyboardFocusNavigation.js.map