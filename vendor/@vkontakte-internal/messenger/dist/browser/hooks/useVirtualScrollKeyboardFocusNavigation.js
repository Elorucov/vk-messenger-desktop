import { useRef, useMemo, useImperativeHandle, useCallback, useEffect, } from 'react';
import { moveFocusInside, getFocusableNodes } from 'focus-lock';
import { useKeyboardFocusNavigation } from '../hooks/useKeyboardFocusNavigation';
import { getActiveElement as getActiveDocumentElement } from '../utils/misc';
import { isShallowEqual } from '../../core/utils/misc';
const DEFAULT_VIEWPORT_AREA_OFFSET = 12;
/**
 * Создаёт обработчик клавиатурной навигации по интерактивным элементам,
 * которые находятся внутри виртуального скролла.
 *
 * Поддерживает сложные продуктовые сценарии (например, смешанную навигацию -
 * стрелками по верхнеуровневым элементам (по бабблам), табами по внутренним
 * элементам (по элементам внутри бабблов))
 *
 * Также поддерживает восстановление фокуса для последнего активного элемента
 * при возвращении к навигации.
 *
 * @param options Опции для хука.
 * @param deps Зависимости, на основе которых будет определяться частотность
 * вызовов колбека `onUpdate` и восстановления последнего элемента в фокусе.
 *
 * @example
 * const Example: React.FC<{}> = () => {
 *   {...}
 *
 *   const $viewport = useRef<HTMLDivElement>(null)
 *
 *   const { ref: $content, onKeyDown } = useVirtualScrollKeyboardFocusNavigation<HTMLDivElement>({
 *     cycle: false,
 *     disabled: !items.length,
 *     kind: 'list',
 *     restoreLastFocusOn: 'always',
 *     getViewport: () => $viewport.current,
 *   }, [items])
 *
 *   return (
 *     <VirtualScrollList virtualizerCore={virtualizerCore}>
 *       {(...indicies) => (
 *         <div
 *           ref={$viewport}
 *           role="presentation"
 *           style={{
 *             height: 450,
 *             width: 900,
 *           }}
 *         >
 *           {...}
 *           <div ref={$content} role="list" tabIndex={0} onKeyDown={onKeyDown}>
 *             {items.map(({ foo, bar }) => (
 *               <VirtualScrollItem
 *                 key={foo}
 *                 itemKey={foo}
 *                 itemRole="presentation"
 *               >
 *                 <div role="listitem" tabIndex={-1}>{bar}</div>
 *               </VirtualScrollItem>
 *             ))}
 *           </div>
 *           {/...}
 *         </div>
 *       )}
 *     </VirtualScrollList>
 *   )
 * }
 */
export function useVirtualScrollKeyboardFocusNavigation({ controlHandleRef, disabled, restoreLastFocusOn, skipAutofocusOnEdges, viewportAreaOffset = DEFAULT_VIEWPORT_AREA_OFFSET, getCachedFocusKey, getFocusableElements = getAllFocusableElements, getFocusKeyFromElement = getFocusKeyFromVirtualScrollElement, getViewport, isElementFocusable: $isElementFocusable = isVirtualScrollElementFocusable, onEndEdgeHit, onFocusKeyChange, onStartEdgeHit, onUpdate, ...handlerOptions }, deps = []) {
    const ref = useRef(null);
    const lastFocusKey = useRef(null);
    const getActiveElement = useCallback(() => {
        if (!ref.current)
            return;
        const element = getActiveDocumentElement(ref.current);
        if (!(element instanceof HTMLElement) ||
            element === ref.current ||
            !ref.current.contains(element)) {
            return;
        }
        return element;
    }, [ref]);
    const isElementFocusable = useCallback((element) => {
        if (!ref.current)
            return false;
        return element !== ref.current && $isElementFocusable(element);
    }, [$isElementFocusable]);
    const isElementEdgeVisible = useCallback((value) => {
        if (!getViewport)
            return true;
        const viewportRect = getViewport()?.getBoundingClientRect();
        if (!viewportRect)
            return false;
        return (value >= viewportRect.top + viewportAreaOffset &&
            value <= viewportRect.bottom - viewportAreaOffset);
    }, [viewportAreaOffset, getViewport]);
    const isElementVisible = useCallback((element) => {
        if (!getViewport)
            return true;
        const viewportRect = getViewport()?.getBoundingClientRect();
        if (!viewportRect)
            return false;
        const { top, bottom } = element.getBoundingClientRect();
        // Элемент во вьюпорте, но полностью выходит за границы.
        if (top < viewportRect.top && bottom > viewportRect.bottom)
            return true;
        return isElementEdgeVisible(top) || isElementEdgeVisible(bottom);
    }, [getViewport, isElementEdgeVisible]);
    const findLastFocusElement = useCallback(() => {
        if (!ref.current || !lastFocusKey.current)
            return;
        const [name, value] = lastFocusKey.current;
        lastFocusKey.current = null;
        onFocusKeyChange?.(lastFocusKey.current);
        const container = ref.current.querySelector(`[${name}~="${value}"]`);
        if (!container)
            return;
        const focusableNodes = getFocusableNodes([container], new Map());
        if (!focusableNodes.length)
            return;
        for (let i = 0; i < focusableNodes.length; i++) {
            const focusableNode = focusableNodes[i];
            if (!focusableNode)
                continue;
            const { node: element } = focusableNode;
            if (isElementFocusable(element))
                return element;
        }
        return;
    }, [isElementFocusable, onFocusKeyChange]);
    const moveFocusToElement = useCallback((element, focusOptions) => {
        if (!(element instanceof HTMLElement))
            return;
        void window.requestAnimationFrame(() => {
            element.focus(focusOptions);
            // В случае, если верхняя граница элемента находится за пределами
            // "безопасной" видимой зоны, выполняем дополнительный доскролл до
            // верхнего края элемента.
            const { top } = element.getBoundingClientRect();
            if (focusOptions?.preventScroll !== true &&
                !isElementEdgeVisible(top)) {
                element.scrollIntoView(true);
            }
        });
    }, [isElementEdgeVisible]);
    const autoFocus = useCallback(async (focusOptions) => {
        if (!ref.current)
            return;
        return moveFocusInside(ref.current, getActiveDocumentElement(ref.current) || ref.current, { focusOptions });
    }, [ref]);
    const focusFirst = useCallback(({ skipLastFocusRestoration } = {}, focusOptions) => {
        if (!ref.current)
            return;
        if (!skipLastFocusRestoration &&
            (restoreLastFocusOn === 'focusFirst' || restoreLastFocusOn === 'always')) {
            const element = findLastFocusElement();
            if (element && isElementVisible(element)) {
                return moveFocusToElement(element, focusOptions);
            }
        }
        const elements = getFocusableElements(ref.current);
        if (!elements.length)
            return;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (!element)
                continue;
            if (!isElementFocusable(element) || !isElementVisible(element)) {
                continue;
            }
            return moveFocusToElement(element, focusOptions);
        }
    }, [
        restoreLastFocusOn,
        findLastFocusElement,
        getFocusableElements,
        isElementFocusable,
        isElementVisible,
        moveFocusToElement,
    ]);
    const focusLast = useCallback(({ skipLastFocusRestoration } = {}, focusOptions) => {
        if (!ref.current)
            return;
        if (!skipLastFocusRestoration &&
            (restoreLastFocusOn === 'focusLast' || restoreLastFocusOn === 'always')) {
            const element = findLastFocusElement();
            if (element && isElementVisible(element)) {
                return moveFocusToElement(element, focusOptions);
            }
        }
        const elements = getFocusableElements(ref.current);
        if (!elements.length)
            return;
        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            if (!element)
                continue;
            if (!isElementFocusable(element) || !isElementVisible(element)) {
                continue;
            }
            return moveFocusToElement(element, focusOptions);
        }
    }, [
        restoreLastFocusOn,
        findLastFocusElement,
        getFocusableElements,
        isElementFocusable,
        isElementVisible,
        moveFocusToElement,
    ]);
    const focusByKey = useCallback((key, focusOptions) => {
        if (!ref.current)
            return;
        const elements = getFocusableElements(ref.current, key);
        if (!elements.length)
            return;
        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            if (!element)
                continue;
            if (!isElementFocusable(element)) {
                continue;
            }
            return moveFocusToElement(element, focusOptions);
        }
    }, [getFocusableElements, isElementFocusable, moveFocusToElement]);
    const control = useMemo(() => ({
        autoFocus,
        focusPrev: async ({ cycle } = {}) => {
            if (!ref.current)
                return;
            let activeElement = getActiveElement();
            if (!activeElement) {
                const element = findLastFocusElement();
                if (element)
                    activeElement = element;
            }
            await autoFocus();
            if (!activeElement)
                return;
            const elements = getFocusableElements(ref.current);
            if (!elements.length)
                return;
            let activeIndex = -1;
            for (let i = elements.length - 1; i >= 0; i--) {
                const element = elements[i];
                if (!element || element === ref.current)
                    continue;
                if (activeIndex < 0) {
                    if (element.contains(activeElement)) {
                        // Если фокус находится внутри самого верхнеуровнего элемента,
                        // сначала возвращаем фокус на верхний уровень.
                        if (element !== activeElement)
                            return moveFocusToElement(element);
                        activeIndex = i;
                    }
                    continue;
                }
                if (!isElementFocusable(element))
                    continue;
                return moveFocusToElement(element);
            }
            onStartEdgeHit?.();
            if (cycle)
                focusLast({ skipLastFocusRestoration: true });
        },
        focusNext: async ({ cycle } = {}) => {
            if (!ref.current) {
                return;
            }
            const currentActiveElement = getActiveElement();
            let activeElement = currentActiveElement;
            if (!activeElement) {
                const element = findLastFocusElement();
                if (element) {
                    activeElement = element;
                }
            }
            await autoFocus();
            if (!activeElement) {
                return;
            }
            const elements = getFocusableElements(ref.current);
            if (!elements.length) {
                return;
            }
            let activeIndex = -1;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                if (!element || element === ref.current) {
                    continue;
                }
                if (activeIndex < 0) {
                    if (element.contains(activeElement) ||
                        element === currentActiveElement) {
                        activeIndex = i;
                    }
                    continue;
                }
                if (element === currentActiveElement) {
                    continue;
                }
                if (!isElementFocusable(element)) {
                    continue;
                }
                return moveFocusToElement(element);
            }
            onEndEdgeHit?.();
            if (cycle) {
                focusFirst({ skipLastFocusRestoration: true });
            }
        },
        focusFirst: async (_, focusOptions) => {
            if (!ref.current)
                return;
            if (!skipAutofocusOnEdges) {
                await autoFocus(focusOptions);
            }
            return focusFirst({}, focusOptions);
        },
        focusLast: async (_, focusOptions) => {
            if (!ref.current)
                return;
            if (!skipAutofocusOnEdges) {
                await autoFocus(focusOptions);
            }
            return focusLast({}, focusOptions);
        },
        focusByKey,
        isFocused: () => {
            const activeElement = getActiveElement();
            return !!(activeElement && ref.current?.contains(activeElement));
        },
    }), [
        autoFocus,
        focusByKey,
        getActiveElement,
        getFocusableElements,
        onStartEdgeHit,
        focusLast,
        findLastFocusElement,
        isElementFocusable,
        moveFocusToElement,
        onEndEdgeHit,
        focusFirst,
        skipAutofocusOnEdges,
    ]);
    const restoreLastFocusKey = useCallback(() => {
        if (!ref.current || !getCachedFocusKey)
            return;
        const key = getCachedFocusKey(ref.current, { getFocusKeyFromElement });
        if (!key)
            return;
        lastFocusKey.current = key;
    }, [getCachedFocusKey, getFocusKeyFromElement]);
    useEffect(() => {
        if (!ref.current || disabled)
            return;
        if (getCachedFocusKey && !lastFocusKey.current)
            restoreLastFocusKey();
        onUpdate?.(control, ref.current, {
            findLastFocusElement,
            moveFocusToElement,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    useImperativeHandle(controlHandleRef, () => control, [control]);
    const onFocus = useCallback((event) => {
        if (!ref.current)
            return;
        const target = event.target;
        if (!(target instanceof HTMLElement) || ref.current === target) {
            return;
        }
        const key = getFocusKeyFromElement(target, ref.current);
        if (!key || isShallowEqual(lastFocusKey.current, key))
            return;
        lastFocusKey.current = key;
        onFocusKeyChange?.(lastFocusKey.current);
    }, [getFocusKeyFromElement, onFocusKeyChange]);
    const onKeyDown = useKeyboardFocusNavigation(control, {
        ...handlerOptions,
        disabled,
        onlyTabbable: false,
    });
    return { ref, onFocus, onKeyDown };
}
/**
 * Получает **все** интерактивные элементы (очень тяжёлый поиск, рекомендую
 * явно определять искомые элементы через проп `getFocusableElements`).
 */
function getAllFocusableElements(container) {
    return getFocusableNodes([container], new Map()).map(({ node }) => node);
}
export const ITEM_KEY_ATTRIBUTE = `data-itemkey`;
const DEFAULT_VIRTUAL_SCROLL_ELEMENT_KEY_ATTRS = [
    ITEM_KEY_ATTRIBUTE,
    `data-stackkey`,
];
/**
 * Извлекает ключ элемента виртуального скролла в качестве признака, на основе
 * которого определяется последний элемент в фокусе.
 */
function getFocusKeyFromVirtualScrollElement(element, container) {
    let node = element;
    while (node && node !== container) {
        for (const name of DEFAULT_VIRTUAL_SCROLL_ELEMENT_KEY_ATTRS) {
            const value = node.getAttribute(name);
            if (value)
                return [name, value];
        }
        node = node.parentElement;
    }
    return;
}
/**
 * Определяет интерактивность элемента (возможность этот элемент зафокусить).
 */
function isVirtualScrollElementFocusable(element) {
    return element.tabIndex >= -1;
}
/**
 * Функция, позволяющая генерировать селектор для нашего виртуального скролла,
 * который будет находить первый интерактивный элемент (на основе явно
 * обозначенного `tabindex`) для каждого айтема от виртуального скролла.
 *
 * Может использоваться вместе с пропом `getFocusableElements`.
 */
export function composeVirtualScrollFirstFocusableSelector({ tabIndex, key, } = {}) {
    const tabIndexValue = typeof tabIndex !== 'number' ? '' : `="${tabIndex}"`;
    if (key) {
        return `[${key[0]}="${key[1]}"] [tabindex${tabIndexValue}]`;
    }
    return DEFAULT_VIRTUAL_SCROLL_ELEMENT_KEY_ATTRS.reduce((acc, name, index, arr) => {
        const tail = index === arr.length - 1 ? '' : ',';
        return (acc += `[${name}] [tabindex${tabIndexValue}]${tail}`);
    }, '');
}
//# sourceMappingURL=useVirtualScrollKeyboardFocusNavigation.js.map