import React, { forwardRef, useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { useFocusTrapKeyboardNavigation } from '../../hooks/useFocusTrapKeyboardNavigation';
const DEFAULT_RETURN_FOCUS = {
    preventScroll: true,
};
/**
 * Компонент управления вниманием пользователя внутри определённого контейнера.
 *
 * Данный компонент - обёртка поверх компонента `FocusLock` из пакета
 * `react-focus-lock`, в который по умолчанию прокидываются подходящие для
 * большинства кейсов пропы.
 *
 * @see {@link FocusLock}
 * @see https://github.com/theKashey/react-focus-lock?tab=readme-ov-file#api
 *
 * @example
 * const ExampleModal: React.FC<{ open?: boolean }> = ({ open }) => {
 *   if (!open) return null
 *
 *   return (
 *     <Portal>
 *       <FocusTrap>
 *         <div>foobar</div>
 *       </FocusTrap>
 *     </Portal>
 *   )
 * }
 */
export const FocusTrap = ({ disableByClickOutside, ...props }) => {
    const $container = useRef(null);
    const [isFocusAppearedIn, setFocusAppearedIn] = useState(false);
    const [isClickedOutSide, setClickedOutSide] = useState(false);
    useEffect(() => {
        const container = $container.current;
        if (!container || !disableByClickOutside) {
            return;
        }
        const handler = () => {
            setFocusAppearedIn(true);
            setClickedOutSide(false);
        };
        container.addEventListener('focusin', handler, true);
        return () => {
            container.removeEventListener('focusin', handler, true);
        };
    }, [disableByClickOutside]);
    useEffect(() => {
        const clickOutsideHandler = (event) => {
            if (!isFocusAppearedIn || !disableByClickOutside) {
                return;
            }
            if (!$container.current ||
                !(event.target instanceof HTMLElement) ||
                $container.current.contains(event.target)) {
                return;
            }
            setClickedOutSide(true);
            setFocusAppearedIn(false);
        };
        document.addEventListener('pointerdown', clickOutsideHandler, true);
        return () => {
            document.removeEventListener('pointerdown', clickOutsideHandler, true);
        };
    }, [disableByClickOutside, isFocusAppearedIn]);
    return (React.createElement(FocusLock, { returnFocus: DEFAULT_RETURN_FOCUS, ...props, disabled: props.disabled || isClickedOutSide, ref: $container }));
};
/**
 * Добавляет клавиатурную навигацию по элементам внутри `FocusTrap`.
 *
 * @see {@link useFocusTrapKeyboardNavigation}
 *
 * @example
 * const ExampleModal: React.FC<{ open?: boolean }> = ({ open }) => {
 *   if (!open) return null
 *
 *   return (
 *     <Portal>
 *       <FocusTrap>
 *         <FocusTrapNavigation>
 *           <div tabIndex={0}>foo</div>
 *           <div tabIndex={0}>bar</div>
 *         </FocusTrapNavigation>
 *       </FocusTrap>
 *     </Portal>
 *   )
 * }
 */
export const FocusTrapNavigation = forwardRef(function FocusTrapNavigation({ disableNavigation, dir, window, cycle = true, kind, onlyTabbable, factory, onNavigation, onTabKeyPressed, onFocusError, onKeyDown, ...props }, ref) {
    const handleKeyboardNavigation = useFocusTrapKeyboardNavigation({
        disabled: disableNavigation,
        dir,
        window,
        cycle,
        kind,
        onlyTabbable,
        factory,
        onNavigation,
        onTabKeyPressed,
        onFocusError,
    });
    const handleKeyDown = (...args) => {
        handleKeyboardNavigation(...args);
        onKeyDown?.(...args);
    };
    return (React.createElement("div", { role: "presentation", ...props, ref: ref, onKeyDown: handleKeyDown }));
});
//# sourceMappingURL=FocusTrap.js.map