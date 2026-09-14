import { useImperativeHandle } from 'react';
import { useFocusController } from 'react-focus-lock';
import { useKeyboardFocusNavigation } from '../hooks/useKeyboardFocusNavigation';
/**
 * Создаёт обработчик клавиатурной навигации по целевым элементам (`shards`).
 * В `shards` достаточно прокидывать контейнер, внутри которого находятся
 * элементы, подлежащие фокусу.
 *
 * @see {@link useFocusController}
 * @see {@link useKeyboardFocusNavigation}
 * @see https://github.com/theKashey/react-focus-lock?tab=readme-ov-file#programmatic-control-1
 *
 * @example
 * const Example: React.FC<{}> = () => {
 *   const ref = useRef<HTMLDivElement>(null)
 *   const onKeyDown = useControlledKeyboardFocusNavigation([ref])
 *
 *   return (
 *     <div ref={ref} role="list" tabIndex={0} onKeyDown={onKeyDown}>
 *       <div role="listitem" tabIndex={0}>foo</div>
 *       <div role="listitem" tabIndex={0}>bar</div>
 *     </div>
 *   )
 * }
 *
 * @note
 * Если вы хотите, чтобы на listitem в фокусе по энтеру срабатывал клик, то
 * в разметке должен быть кликабельный элемент: <a role="listitem"> / <button role="listitem">
 */
export function useControlledKeyboardFocusNavigation(shards, { controlHandleRef, ...options } = {}) {
    /**
     * Фокус-контроллер, которому не требуется focus trap.
     */
    const control = useFocusController(...shards);
    useImperativeHandle(controlHandleRef, () => control, [control]);
    return useKeyboardFocusNavigation(control, options);
}
//# sourceMappingURL=useControlledKeyboardFocusNavigation.js.map