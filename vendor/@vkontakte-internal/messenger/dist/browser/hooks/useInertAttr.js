import { useRef, useMemo } from 'react';
import { suppressOthers } from 'aria-hidden';
import { debounce } from '../../core/utils/misc';
const DEFAULT_MARKER_NAME = 'data-vkme-inert';
const DEFAULT_DEBOUNCE_DURATION = 80;
/**
 * При активации добавляет элементам, не находящимся в белом списке, атрибут
 * `inert`, который:
 * - Предотвращает срабатывние событий по взаимодействию с элементами не из
 * белого списка.
 * - Исключает эти элементы из Accessibility Tree.
 *
 * В браузерах, не поддерживающих `inert`, использует `aria-hidden`.
 *
 * Также добавляет специальный маркер в виде атрибута, который можно
 * использовать для назначения соответствующих параметров через CSS-классы.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert
 */
export function useInertAttr({ debounceDuration = DEFAULT_DEBOUNCE_DURATION, parentNode, markerName = DEFAULT_MARKER_NAME, } = {}) {
    const $undo = useRef();
    // Используем `debounce`, чтобы не вызывать частые изменения в DOM-дереве
    // за пределами реакта.
    const apply = useMemo(() => debounce((...[whitelist]) => {
        // Атрибут уже добавлен.
        if ($undo.current)
            return;
        const target = whitelist.reduce((acc, item) => {
            if (!item)
                return acc;
            // Извлекаем refы.
            if ('current' in item) {
                if (!item.current)
                    return acc;
                void acc.push(item.current);
            }
            else {
                void acc.push(item);
            }
            return acc;
        }, []);
        $undo.current = suppressOthers(target, parentNode, markerName);
    }, debounceDuration, false), [debounceDuration, markerName, parentNode]);
    const remove = useMemo(() => debounce(() => {
        if (!$undo.current)
            return;
        $undo.current();
        $undo.current = null;
    }, debounceDuration, false), [debounceDuration]);
    return { apply, remove };
}
//# sourceMappingURL=useInertAttr.js.map