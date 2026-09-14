import { useFocusScope } from 'react-focus-lock';
import { useKeyboardFocusNavigation } from '../hooks/useKeyboardFocusNavigation';
/**
 * Создаёт обработчик событий клавиатурной навигации для элементов,
 * которые находятся внутри `FocusTrap`.
 *
 * Для большинства кейсов достаточно использовать готовый
 * компонент `FocusTrapNavigation`, который использует этот хук.
 *
 * @see {@link useFocusScope}
 * @see {@link useKeyboardFocusNavigation}
 * @see https://github.com/theKashey/react-focus-lock?tab=readme-ov-file#programmatic-control-1
 *
 * @example
 * const ExampleModal: React.FC<{ open?: boolean }> = ({ open }) => {
 *   if (!open) return null
 *
 *   return (
 *     <Portal>
 *       <FocusTrap>
 *         <ExampleModalContent />
 *       </FocusTrap>
 *     </Portal>
 *   )
 * }
 *
 * const ExampleModalContent: React.FC<{}> = () => {
 *   const onKeyDown = useFocusTrapKeyboardNavigation()
 *
 *   return (
 *     <div role="list" tabIndex={0} onKeyDown={onKeyDown}>
 *       <div role="listitem" tabIndex={0}>foo</div>
 *       <div role="listitem" tabIndex={0}>bar</div>
 *     </div>
 *   )
 * }
 */
export function useFocusTrapKeyboardNavigation(options) {
    /**
     * Контроллер, которому необходим контекст от focus trap.
     */
    const control = useFocusScope();
    return useKeyboardFocusNavigation(control, options);
}
//# sourceMappingURL=useFocusTrapKeyboardNavigation.js.map