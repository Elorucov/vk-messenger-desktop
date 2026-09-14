import '../../ui/Dropdown/Dropdown.css';
import React, { useCallback, useEffect, useRef, useState, createContext, useContext, useMemo, useLayoutEffect, forwardRef, } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Popper, } from '../../ui/Popper/Popper';
import cx from 'classnames';
import { getFocusableNodes } from 'focus-lock';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useDidUpdate, usePrevious } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useLongTouch } from '../../hooks/useLongTouch';
import { useModuleKeyBoardHandlers } from '../../hooks/useKeyBoardHandlers';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { FocusTrap, FocusTrapNavigation } from '../../ui/FocusTrap/FocusTrap';
import { OuterInert } from '../../ui/OuterInert/OuterInert';
import { localizeNavigationKey } from '../../utils/keyBoardCombos';
import { useStickersPopupAnimationStopperContext } from '../../hooks/useStickersPopupAnimation';
import { useFeatureFlags } from '../../hooks/misc';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import { getActiveElement, getOwnerDocument } from '../../utils/misc';
import { usePerformanceSettings } from '../../hooks/usePerformanceSettings';
export const DEFAULT_HIDE_DELAY = 150;
/**
 * В дропдаунах могут быть другие дропдауны. Так сделано в ActionsMenu.
 * Чтобы родительский дропдаун не закрывался, когда ховер переходит на
 * ребенка, поддерживаю ховер у родителя через вложенный контексты
 * (элементы в порталах, поэтому контекст, а не проп).
 *
 * А еще вложенные дропдауны могут быть в ContextMenu!
 */
export const DropdownDepthContext = createContext(undefined);
export const DropdownRootCloseContext = createContext(undefined);
const DropdownRootCloseWrapper = ({ children, hide }) => {
    const dropdownRootClose = useContext(DropdownRootCloseContext);
    return dropdownRootClose ? (React.createElement(React.Fragment, null, children)) : (React.createElement(DropdownRootCloseContext.Provider, { value: hide }, children));
};
export const Dropdown = forwardRef(({ openType: openTypeProp = 'hover', delay, hideDelay = DEFAULT_HIDE_DELAY, classNames = {}, content, children, hideOnClick, hideOnWheel, hideOnMouseLeave, canOpen = true, open = false, onOpen, onClose, forceUpdateContent, contentPreventDefault = true, disableInert, enableFocusTrap, handleRef, verticalShiftPadding, returnFocus, adaptive = false, ...popperProps }, $ref) => {
    /**
     * Индикатор того, что у дропдауна-родителя открыт вложенный в него дропдаун
     */
    const [childOpen, setChildOpen] = useState(false);
    const prevChildOpen = usePrevious(childOpen);
    const prevOpen = usePrevious(open);
    const [displayContent, setDisplayContent] = useState(content);
    const { isMobileLayout } = useLayoutData();
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const { vkm_dropdown_outside_click } = useFeatureFlags();
    const { enableAnimations } = usePerformanceSettings();
    const shouldAnimate = enableAnimations || !vkm_dropdown_outside_click;
    const openType = !hasPointer && openTypeProp === 'hover' ? 'click' : openTypeProp;
    const { displayState, $content, $trigger, isNavigating, nested, onClick, onHover, onKeyDown, handleHide, handleOpened, handleClosed, handleContentKeyDown, } = useDropdownDisplayState({
        canOpen,
        open,
        openType,
        delay,
        hideDelay,
        childOpen,
        hideOnMouseLeave,
    });
    useDidUpdate(() => {
        if (!enableFocusTrap || !$trigger.current || displayState !== 'closed') {
            return;
        }
        // Без таймаута фокус может не сработать, т.к. элемент может быть всё ещё
        // неактивен из-за атрибута `inert`.
        void setTimeout(() => {
            const doc = getOwnerDocument($trigger.current);
            const activeElement = getActiveElement(doc);
            // Фокус может быть уже отдан другому элементу, соответственно
            // проверяем, что верхнеуровневый дропдаун не перебивает уже заданный
            // ранее фокус (если фокус вернулся в `document.body`, это значит, что
            // фокус не был переопределён программно).
            if ((!nested && activeElement && doc.body !== doc.activeElement) ||
                !$trigger.current) {
                return;
            }
            /**
             * Элемент, который нужно зафокусить при закрытии дроудауна.
             *
             * Находим через `ref` вручную, т.к. триггер может быть на другом UI-слое,
             * из-за чего focus trap может попытаться вернуть фокус элементу
             * `document.body`.
             */
            const target = getFocusableNodes([$trigger.current], new Map())[0]?.node;
            if (!target)
                return;
            if (returnFocus) {
                return returnFocus(target);
            }
            target.focus({ preventScroll: true });
        }, 0);
    }, [displayState]);
    const dropdownRootClose = useContext(DropdownRootCloseContext);
    const { subscribeKeyDown } = useModuleKeyBoardHandlers({
        moduleName: 'Dropdown',
        blockGlobalHandlers: true,
        handlerElementRef: $content,
    });
    const onInteractiveContentKeyDown = useCallback((keyCombo, event) => {
        // Останавливаем всплытие при открытом дропдауне.
        // https://jira.mvk.com/browse/ME-48854
        event.stopPropagation();
        if (keyCombo === 'Escape') {
            event.preventDefault();
            handleHide(0, false);
            return;
        }
        handleContentKeyDown(event);
    }, [handleHide, handleContentKeyDown]);
    const canHandleKeyDown = displayState === 'opened' &&
        !childOpen &&
        (openType === 'click' ||
            openType === 'contextmenu' ||
            openType === 'hover-click');
    useEffect(() => {
        if (!canHandleKeyDown) {
            return;
        }
        return subscribeKeyDown(onInteractiveContentKeyDown);
    }, [onInteractiveContentKeyDown, subscribeKeyDown, canHandleKeyDown]);
    const handleContentClick = useCallback((event) => {
        if (contentPreventDefault) {
            event.preventDefault();
        }
        event.stopPropagation();
        if (!hideOnClick) {
            return;
        }
        // Скрываем контент без задержки, так как она не нужна в этом сценарии
        // и чтобы не видеть апдейты контента, если они есть.
        // Также скрываем контент без возможности открыться по наведению на,
        // него во время закрытия, так как если этого не сделать, то контент
        // может не закрыться по клику.
        if (dropdownRootClose) {
            dropdownRootClose();
        }
        else {
            handleHide(0, false);
        }
    }, [hideOnClick, contentPreventDefault, handleHide, dropdownRootClose]);
    useEffect(() => {
        if (!hideOnWheel || displayState !== 'opened') {
            return;
        }
        const handleHideOnWheel = ({ target }) => {
            // Если скроллим по контенту дропдауна, то не закрываем его
            if (target instanceof Node && $content.current?.contains(target)) {
                return;
            }
            handleHide(0, false);
        };
        window.addEventListener('wheel', handleHideOnWheel, true);
        return () => {
            window.removeEventListener('wheel', handleHideOnWheel, true);
        };
    }, [$content, displayState, handleHide, hideOnWheel]);
    const hide = useCallback(() => handleHide(0, false), [handleHide]);
    // если после нажатия на контент дропдаун должен плавно исчезнуть
    // то упреждаем последующие нажатия по исчезающему дропдауну
    const preventContentClickWhileClosing = (event) => {
        // Игнорируем, если это вложенный дропдаун
        if (childOpen) {
            return;
        }
        if (hideOnClick && displayState === 'closing') {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    const { stopPopupStickerAnimation } = useStickersPopupAnimationStopperContext();
    useEffect(() => {
        if (displayState === 'opened') {
            onOpen?.();
            stopPopupStickerAnimation();
        }
        if (displayState === 'closed') {
            isNavigating.current = false;
            onClose?.();
            /**
             * При закрытии дропдауна дополнительно
             * убеждаемся, что закроются все вложенные
             * в него дропдауны
             */
            setChildOpen(false);
        }
        // Хотим дергать коллбэки только на изменение displayState.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayState]);
    useEffect(() => {
        const transitionedDisplayState = ['closing', 'opening'];
        const isChildUpdate = !childOpen && prevChildOpen;
        const externalStateChanged = !open && prevOpen;
        if (!forceUpdateContent &&
            (transitionedDisplayState.includes(displayState) ||
                isChildUpdate ||
                externalStateChanged)) {
            return;
        }
        setDisplayContent(content);
    }, [
        childOpen,
        content,
        displayState,
        prevChildOpen,
        forceUpdateContent,
        open,
        prevOpen,
    ]);
    const onContextMenu = (e) => {
        /**
         * Блокируем системное контекстное меню для всех устройств, кроме ios.
         * Для ios оно блокируется через css-свойство: -webkit-touch-callout .
         */
        e.preventDefault();
    };
    const handleContentNavigation = useCallback(() => {
        isNavigating.current = true;
    }, [isNavigating]);
    const handleTabKeyPressed = useCallback((keyCombo, event) => {
        event.preventDefault();
    }, []);
    const renderPopper = () => {
        const contentChild = (React.createElement(FocusTrap, { disabled: !enableFocusTrap || displayState !== 'opened', returnFocus: false },
            enableFocusTrap &&
                !disableInert &&
                !nested &&
                displayState === 'opened' && (React.createElement(OuterInert, { whitelist: openType === 'hover' || openType === 'hover-click'
                    ? [$trigger]
                    : undefined })),
            React.createElement(FocusTrapNavigation, { ref: $content, disableNavigation: !enableFocusTrap, onlyTabbable: false, role: "presentation", className: cx('DropdownReforged__contentWrapper', classNames.contentWrapper), onClickCapture: preventContentClickWhileClosing, onClick: handleContentClick, onKeyDown: canHandleKeyDown
                    ? onElementKeyDownFactory(onInteractiveContentKeyDown)
                    : handleContentKeyDown, onNavigation: handleContentNavigation, onTabKeyPressed: handleTabKeyPressed }, displayContent)));
        const showContent = displayState === 'opening' || displayState === 'opened';
        const content = shouldAnimate ? (React.createElement(CSSTransition, { nodeRef: $content, in: showContent, addEndListener: (done) => $content.current?.addEventListener('transitionend', done, false), mountOnEnter: true, unmountOnExit: true, appear: true, classNames: "DropdownReforged__contentWrapper-", onEntered: handleOpened, onExited: handleClosed }, contentChild)) : showContent ? (React.createElement(InstantlyRenderedContent, { className: "DropdownReforged__contentWrapper-", onEntered: handleOpened, onExited: handleClosed }, contentChild)) : null;
        const childrenNode = (React.createElement("div", { className: cx('DropdownReforged__trigger', classNames.trigger), onMouseOver: onHover, onMouseEnter: onHover, onKeyDown: onKeyDown, onClick: openType === 'click' || openType === 'hover-click'
                ? onClick
                : undefined, onContextMenu: openType === 'contextmenu' ? onClick : onContextMenu }, typeof children === 'function'
            ? children(displayState === 'opened')
            : children));
        const ref = (node) => {
            $trigger.current = node;
            if (typeof $ref === 'function') {
                $ref(node);
            }
            else if ($ref) {
                $ref.current = node;
            }
        };
        const isBottomSheet = adaptive && isMobileLayout;
        if (isBottomSheet) {
            return (React.createElement(Popper, { ref: ref, ...popperProps, mode: "bottom-sheet", portalClassName: cx('DropdownReforged__portal--bottomSheet', classNames.portal), onMouseEnter: onHover, open: displayState !== 'closed', content: content }, childrenNode));
        }
        return (React.createElement(Popper, { ref: ref, ...popperProps, mode: "side", portalClassName: classNames.portal, onMouseEnter: onHover, open: displayState !== 'closed', content: content, handleRef: handleRef, verticalShiftPadding: verticalShiftPadding }, childrenNode));
    };
    return (React.createElement("div", { className: cx('DropdownReforged', classNames.wrapper, {
            [classNames.wrapperOpened || 'DropdownReforged--opened']: displayState === 'opened',
            [classNames.wrapperClosed || 'DropdownReforged--closed']: displayState === 'closed',
        }) },
        React.createElement(DropdownDepthContext.Provider, { value: useMemo(() => ({ setChildOpen }), [setChildOpen]) },
            React.createElement(DropdownRootCloseWrapper, { hide: hide }, renderPopper()))));
});
const InstantlyRenderedContent = ({ className, onEntered, onExited, children, }) => {
    useEffect(() => {
        onEntered();
        return onExited;
    }, [onEntered, onExited]);
    return React.createElement("div", { className: className }, children);
};
function useDropdownHover({ open: isOpen, canOpen, delay, hideDelay, hideOnMouseLeave, openType, displayState, setDisplayState, $content, $trigger, childOpen, isNavigating, }) {
    const openTimeoutRef = useRef(null);
    const hideTimeoutRef = useRef(null);
    const appearingRafRef = useRef(null);
    const displayStateRef = useRef(displayState);
    displayStateRef.current = displayState;
    const childOpenRef = useRef(childOpen);
    childOpenRef.current = childOpen;
    const checkIsHover = useCallback(() => {
        return ($trigger.current?.matches(':hover') || $content.current?.matches(':hover'));
    }, [$content, $trigger]);
    const clearTimeoutRef = useCallback((timeoutRef) => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);
    const cancelAppearingRaf = useCallback(() => {
        if (appearingRafRef.current) {
            window.cancelAnimationFrame(appearingRafRef.current);
            appearingRafRef.current = null;
        }
    }, []);
    /**
     * Возможность вернуть закрывающийся дропдаун наведением на него
     * Отключем возможность, если дропдаун закрывается извне
     */
    const canOpenWhileClosingRef = useRef(isOpen === undefined);
    canOpenWhileClosingRef.current = isOpen === undefined;
    const hide = useCallback((delay = hideDelay, canOpenWhileClosing = true) => {
        if (openType !== 'hover' &&
            openType !== 'hover-click' &&
            !hideOnMouseLeave) {
            return;
        }
        // Чистим openTimeout, чтобы более ранние вызовы не повлияли на displayState.
        clearTimeoutRef(openTimeoutRef);
        const isClosing = displayStateRef.current === 'closed' ||
            displayStateRef.current === 'closing';
        if (hideTimeoutRef.current || isClosing) {
            return;
        }
        canOpenWhileClosingRef.current = canOpenWhileClosing;
        const close = () => {
            /**
             * Закрытие дропдауна без анимации, в случае, если он только начал открываться,
             * а пользователь увел мышку в сторону
             */
            setDisplayState((prev) => (prev === 'opened' ? 'closing' : 'closed'));
            clearTimeoutRef(hideTimeoutRef);
        };
        // Можем закрыть дропдаун с задержкой только если он на момент вызова открыт
        // и не имеет фокуса после навигации с помощью клавиатуры.
        if (delay && displayStateRef.current === 'opened') {
            hideTimeoutRef.current = window.setTimeout(() => {
                if (!checkIsHover() && !isNavigating.current) {
                    close();
                }
                else {
                    clearTimeoutRef(hideTimeoutRef);
                }
            }, delay);
        }
        else {
            close();
        }
    }, [
        hideDelay,
        openType,
        hideOnMouseLeave,
        clearTimeoutRef,
        setDisplayState,
        checkIsHover,
        isNavigating,
    ]);
    useLayoutEffect(() => {
        if (!openTimeoutRef.current) {
            return;
        }
        if (canOpen) {
            return;
        }
        clearTimeoutRef(openTimeoutRef);
    }, [clearTimeoutRef, openTimeoutRef, canOpen]);
    const open = useCallback(() => {
        if ((openType !== 'hover' && openType !== 'hover-click') || !canOpen) {
            return;
        }
        // Чистим hideTimeout, чтобы более ранние вызовы не повлияли на displayState.
        clearTimeoutRef(hideTimeoutRef);
        const isOpening = displayStateRef.current === 'opened' ||
            displayStateRef.current === 'opening';
        if (openTimeoutRef.current || isOpening) {
            return;
        }
        canOpenWhileClosingRef.current = true;
        const setOpen = () => {
            setDisplayState((prev) => (prev === 'closed' ? 'opening' : 'opened'));
            clearTimeoutRef(openTimeoutRef);
        };
        // Можем открыть дропдаун с задержкой только если он на момент вызова закрыт.
        if (delay && displayStateRef.current === 'closed') {
            openTimeoutRef.current = window.setTimeout(setOpen, delay);
        }
        else {
            setOpen();
        }
    }, [delay, canOpen, openType, setDisplayState, clearTimeoutRef]);
    const onHover = useCallback(() => {
        const handleHover = () => {
            /**
             * Фикс бага с "плавающим дропдауном", когда он не закрывался, пока
             * на него не наведешь мышкой
             */
            if (checkIsHover() ||
                // Используем реф, чтобы получить актуальное значение.
                childOpenRef.current) {
                if (displayStateRef.current !== 'closing' ||
                    canOpenWhileClosingRef.current) {
                    open();
                }
                return;
            }
            if (hideOnMouseLeave &&
                displayStateRef.current === 'opened' &&
                !isNavigating.current) {
                hide(1500, true);
            }
            if (!hideOnMouseLeave && !isNavigating.current) {
                hide();
            }
        };
        cancelAppearingRaf();
        /**
         * Делаем красиво, выдерживая 60 фпс
         */
        appearingRafRef.current = window.requestAnimationFrame(handleHover);
    }, [
        cancelAppearingRaf,
        checkIsHover,
        hide,
        hideOnMouseLeave,
        open,
        isNavigating,
    ]);
    useEffect(() => {
        if ((openType === 'hover' ||
            openType === 'hover-click' ||
            hideOnMouseLeave) &&
            displayState !== 'closed') {
            /**
             * Мы хотим, чтобы открывшийся дродпаун точно закрылся, если пользователь убрал
             * с него мышку. С passive: true это оптимизировано
             */
            document.addEventListener('mousemove', onHover, { passive: true });
            document.addEventListener('wheel', onHover, { passive: true });
        }
        return () => {
            document.removeEventListener('mousemove', onHover);
            document.removeEventListener('wheel', onHover);
        };
    }, [
        hideOnMouseLeave,
        displayState,
        onHover,
        openType,
        cancelAppearingRaf,
        // Хоть и используем childOpenRef для актуальности значения,
        // а childOpen все равно нужен в зависимостях эффекта, чтобы
        // при закрытии всех детей закрыть родителя и с евентами
        // mousemove и wheel и без них, если пользователь ничего не делает.
        childOpen,
    ]);
    useEffect(() => () => {
        clearTimeoutRef(openTimeoutRef);
        clearTimeoutRef(hideTimeoutRef);
        cancelAppearingRaf();
    }, 
    // Хотим отменить таймауты и RAF при демонтировании компонента.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    /**
     * Если дропдаун управляется извне, то при закрытии удаляем всех
     * слушателей
     */
    useEffect(() => {
        if (isOpen === false) {
            document.removeEventListener('mousemove', onHover);
            document.removeEventListener('wheel', onHover);
        }
    }, [isOpen, onHover, clearTimeoutRef, cancelAppearingRaf]);
    return {
        onMouseOver: open,
        hideOnHover: hide,
    };
}
function useDropdownClick({ $content, $trigger, openType, displayState, setDisplayState, canOpen, }) {
    const { vkm_dropdown_outside_click } = useFeatureFlags();
    const onClick = useCallback((event) => {
        if (openType !== 'click' &&
            openType !== 'hover-click' &&
            openType !== 'contextmenu' &&
            openType !== 'longtouch') {
            return;
        }
        // Триггер дропдауна может быть частью контекта родительского дропдауна,
        // чтобы не закрывать родительский дропдаун - прерываем всплытие.
        event?.stopPropagation();
        // Предотвращаем открытие нативного контекстного меню
        if (openType === 'contextmenu') {
            event?.preventDefault();
        }
        setDisplayState((prev) => {
            switch (prev) {
                case 'opening':
                    return 'closed';
                case 'closed':
                    if (canOpen) {
                        return 'opening';
                    }
                    return 'closed';
                case 'opened':
                case 'closing':
                    return 'closing';
                default:
                    return exhaustivenessCheck(prev);
            }
        });
    }, [openType, setDisplayState, canOpen]);
    useLongTouch(openType === 'longtouch', $trigger, () => onClick());
    useEffect(() => {
        const handleClickOutSide = (event) => {
            const isOpened = vkm_dropdown_outside_click
                ? displayState === 'opened' || displayState === 'opening'
                : true;
            if ((openType === 'click' ||
                openType === 'hover-click' ||
                openType === 'contextmenu' ||
                openType === 'longtouch') &&
                isOpened &&
                $content.current &&
                // Чтобы сошлось по типам для последующего contains
                event.target instanceof Node &&
                !$content.current.contains(event.target)) {
                onClick();
            }
        };
        if (vkm_dropdown_outside_click) {
            document.addEventListener('click', handleClickOutSide);
            return () => {
                document.removeEventListener('click', handleClickOutSide);
            };
        }
        document.addEventListener('mousedown', handleClickOutSide);
        document.addEventListener('touchstart', handleClickOutSide);
        return () => {
            document.removeEventListener('mousedown', handleClickOutSide);
            document.removeEventListener('touchstart', handleClickOutSide);
        };
    }, [$content, displayState, onClick, openType, vkm_dropdown_outside_click]);
    return {
        onClick,
    };
}
function useDropdownDisplayState({ canOpen, open, openType, delay, hideDelay, hideOnMouseLeave, childOpen, }) {
    const [displayState, updateDisplayState] = useState('closed');
    const $content = useRef(null);
    const $trigger = useRef(null);
    const dropdownDepth = useContext(DropdownDepthContext);
    const nested = Boolean(dropdownDepth);
    const isNavigating = useRef(false);
    const setDisplayState = useCallback((update) => {
        updateDisplayState((prev) => {
            let newState;
            if (typeof update === 'function') {
                newState = update(prev);
            }
            else {
                newState = update;
            }
            switch (newState) {
                case 'opening':
                case 'opened':
                    dropdownDepth?.setChildOpen(true);
                    break;
                case 'closing':
                case 'closed':
                    dropdownDepth?.setChildOpen(false);
                    break;
                default:
                    exhaustivenessCheck(newState);
            }
            return newState;
        });
    }, [dropdownDepth]);
    const { hideOnHover, onMouseOver } = useDropdownHover({
        open,
        canOpen,
        delay,
        hideDelay,
        hideOnMouseLeave,
        openType,
        displayState,
        setDisplayState,
        $content,
        $trigger,
        childOpen,
        isNavigating,
    });
    const { onClick } = useDropdownClick({
        $content,
        $trigger,
        openType,
        displayState,
        setDisplayState,
        canOpen,
    });
    /**
     * Хук для возможности управления состоянием дропдауна из вне
     */
    useLayoutEffect(() => {
        // Если апдейтить displayState не надо, вернем текущее значение и перерендера не будет.
        setDisplayState((displayState) => {
            if ((!open || !canOpen) && displayState !== 'closed') {
                /**
                 * Если контент на момент первого рендера был открыт (open = true), и затем мгновенно закрыт (open = false):
                 *
                 * 1. Сначала устанавливается displayState = opening (условие ниже)
                 * 2. Затем мы ловим open = false, и поскольку анимация еще не завершена, устанавливалось displayState = closing
                 * 3. Мы не ловим событие onExisting от CSSTransition (по каким-то причинам), хотя ноды в DOM уже нет
                 * 4. Соответственно, зависаем в состоянии 'closing' поскольку события об окончании анимации не приходит
                 * 5. Поскольку считается что контент открыт, класс на закрытие кнопки не установится и кнопка не закроется
                 *
                 * Поскольку событие не приходит, проверяем наличие ноды в DOM самостоятельно, и если ноды нет (то есть
                 * анимация уже завершена), явно устанавливаем состояние завершенности анимации.
                 *
                 * ME-31115
                 */
                return $content.current ? 'closing' : 'closed';
            }
            if (canOpen && open && displayState !== 'opened') {
                return 'opening';
            }
            return displayState;
        });
    }, [open, canOpen, setDisplayState]);
    const handleOpened = useCallback(() => {
        setDisplayState('opened');
    }, [setDisplayState]);
    const handleClosed = useCallback(() => {
        setDisplayState('closed');
    }, [setDisplayState]);
    const handleHide = useCallback((hoverHideDelay, canHoverOpenWhileClosing) => {
        onClick();
        hideOnHover(hoverHideDelay, canHoverOpenWhileClosing);
    }, [hideOnHover, onClick]);
    const onKeyDown = useMemo(() => onElementKeyDownFactory((keyCombo) => {
        if (!$trigger.current ||
            !nested ||
            keyCombo !== localizeNavigationKey('ArrowRight', $trigger.current)) {
            return;
        }
        isNavigating.current = true;
        setDisplayState('opened');
    }), [nested, setDisplayState]);
    const handleContentKeyDown = useMemo(() => onElementKeyDownFactory((keyCombo) => {
        if (!$content.current ||
            !nested ||
            keyCombo !== localizeNavigationKey('ArrowLeft', $content.current)) {
            return;
        }
        isNavigating.current = false;
        setDisplayState('closing');
    }), [nested, setDisplayState]);
    return {
        displayState,
        $content,
        $trigger,
        nested,
        isNavigating,
        onClick,
        onHover: onMouseOver,
        onKeyDown,
        handleHide,
        handleOpened,
        handleClosed,
        handleContentKeyDown,
    };
}
//# sourceMappingURL=Dropdown.js.map