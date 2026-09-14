import '../../ui/ContextMenu/ContextMenu.css';
import React, { forwardRef, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, useEffect, } from 'react';
import { Popper, } from '../../ui/Popper/Popper';
import { CSSTransition } from 'react-transition-group';
import cx from 'classnames';
import { usePrevious } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useLongTouch } from '../../hooks/useLongTouch';
import { DropdownDepthContext, DropdownRootCloseContext, } from '../../ui/Dropdown/Dropdown';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import { browser } from '../../utils/misc';
/**
 * Компонент копирует функционал Dropdown за исключением механизма
 * открытия.
 *
 * Если требуется открывать контекстное меню на определенном div, то
 * 1) достаточно передать в компонент ref и положить рядом в JSX;
 * ИЛИ
 * 2) повесить на div обработчик onContextMenu и вызывать на нем функцию,
 * полученную через getToggleOpen. Более подробно показано в сторибуке.
 * Сам же компонент ContextMenu точно как в 1) положить рядом в JSX.
 *
 * Оборачивать этим компонентом ничего не нужно, он не создает новых
 * div оберток над элементом, где требуется контекстное меню.
 *
 */
export const ContextMenu = forwardRef(({ classNames = {}, content, forceUpdateContent, canOpen = true, open = false, hideOnClick = true, hideOnWheel = true, allowNativeContextMenu = false, onStartOpening, onOpen, onClose, children: _children, position = 'bottom', align = 'left', getToggleOpen, contentPreventDefault = true, }, $containerRef) => {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const [childOpen, setChildOpen] = useState(false);
    const prevChildOpen = usePrevious(childOpen);
    const prevOpen = usePrevious(open);
    const childOpenRef = useRef(childOpen);
    childOpenRef.current = childOpen;
    const [displayContent, setDisplayContent] = useState(content);
    const [cursor, setCursor] = useState({ x: -999, y: -999 });
    const [displayState, updateDisplayState] = useState('closed');
    const contextMenuDepth = useContext(DropdownDepthContext);
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
                    contextMenuDepth?.setChildOpen(true);
                    break;
                case 'closing':
                case 'closed':
                    contextMenuDepth?.setChildOpen(false);
                    break;
                default:
                    exhaustivenessCheck(newState);
            }
            return newState;
        });
    }, [contextMenuDepth]);
    const toggleOpen = useCallback(({ preventDefault, x, y }) => {
        if (!allowNativeContextMenu) {
            preventDefault?.();
        }
        setDisplayState((prev) => {
            switch (prev) {
                case 'opened':
                case 'opening':
                case 'closing':
                    return 'closing';
                case 'closed':
                    if (allowNativeContextMenu) {
                        preventDefault?.();
                    }
                    setCursor({
                        x,
                        y,
                    });
                    return 'opening';
                default:
                    exhaustivenessCheck(prev);
            }
        });
    }, [allowNativeContextMenu, setDisplayState]);
    /**
     * Работа с открытием контекстного меню через onContextMenu извне
     */
    getToggleOpen?.(toggleOpen);
    /**
     * Работа с открытием контекстного меню через ref
     */
    useLayoutEffect(() => {
        if (!isCorrectRef($containerRef)) {
            return;
        }
        const container = $containerRef.current;
        const handleToggleOpen = (e) => {
            toggleOpen({
                x: e.clientX,
                y: e.clientY,
                preventDefault: e.preventDefault.bind(e),
            });
        };
        container?.addEventListener('contextmenu', handleToggleOpen);
        return () => {
            container?.removeEventListener('contextmenu', handleToggleOpen);
        };
    }, [$containerRef, allowNativeContextMenu, setDisplayState, toggleOpen]);
    useLayoutEffect(function blockIOSNativeContextMenu() {
        if (!isCorrectRef($containerRef) || !browser.ios) {
            return;
        }
        const container = $containerRef.current;
        const shouldAllow = displayState === 'opened' && allowNativeContextMenu;
        container.classList.toggle('RE_ContextMenu__contentWrapper--IOSTouchCalloutNone', !shouldAllow);
    }, [$containerRef, allowNativeContextMenu, displayState, hasPointer]);
    useLongTouch(!hasPointer && isCorrectRef($containerRef), isCorrectRef($containerRef) ? $containerRef : { current: null }, ({ touches }) => {
        toggleOpen({
            x: touches[0]?.clientX || 0,
            y: touches[0]?.clientY || 0,
        });
    });
    const handleHide = useCallback(() => {
        setDisplayState((prev) => {
            switch (prev) {
                case 'opening':
                case 'closed':
                    return 'closed';
                case 'opened':
                case 'closing':
                    return 'closing';
                default:
                    return exhaustivenessCheck(prev);
            }
        });
    }, [setDisplayState]);
    const handleContentClick = useCallback((event) => {
        if (contentPreventDefault) {
            event.preventDefault();
        }
        event.stopPropagation();
        if (!hideOnClick) {
            return;
        }
        handleHide();
    }, [hideOnClick, handleHide, contentPreventDefault]);
    const preventContentClickWhileClosing = (event) => {
        // Игнорируем, если это клик по вложенному элементу
        if (childOpen) {
            return;
        }
        if (displayState === 'closing') {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    useLayoutEffect(() => {
        setDisplayState((displayState) => {
            if ((!open || !canOpen) && displayState !== 'closed') {
                return $content.current ? 'closing' : 'closed';
            }
            if (canOpen && open && displayState !== 'opened') {
                return 'opening';
            }
            return displayState;
        });
    }, [open, canOpen, setDisplayState]);
    const $content = useRef(null);
    const checkIfContentHasTarget = useCallback((target) => {
        return target instanceof Node && $content.current?.contains(target);
    }, []);
    useLayoutEffect(() => {
        const handleClickOutside = (event) => {
            /**
             * Если открыт вложенный дропдаун - то до его закрытия не закрываем
             * контекстное меню
             */
            if (!checkIfContentHasTarget(event.target) && !childOpenRef.current) {
                handleHide();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [
        allowNativeContextMenu,
        checkIfContentHasTarget,
        displayState,
        handleHide,
    ]);
    useEffect(() => {
        if (displayState === 'opening') {
            onStartOpening?.();
        }
        if (displayState === 'opened') {
            onOpen?.();
        }
        if (displayState === 'closed') {
            onClose?.();
            /**
             * При закрытии контекстного меню дополнительно
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
    useEffect(() => {
        if (!hideOnWheel || displayState !== 'opened') {
            return;
        }
        const handleHideOnWheel = ({ target }) => {
            /**
             * Если скроллим по контенту, то не закрываем его.
             *
             * Но проверяем на вложенные дропдауны
             */
            if (!checkIfContentHasTarget(target) && !childOpenRef.current) {
                handleHide();
            }
        };
        window.addEventListener('wheel', handleHideOnWheel, true);
        return () => {
            window.removeEventListener('wheel', handleHideOnWheel, true);
        };
    }, [checkIfContentHasTarget, displayState, handleHide, hideOnWheel]);
    return (
    /**
     * Вложенного контекстного меню пока нет,
     * есть только дропдауны.
     */
    React.createElement(DropdownRootCloseContext.Provider, { value: handleHide },
        React.createElement(DropdownDepthContext.Provider, { value: useMemo(() => ({ setChildOpen }), [setChildOpen]) },
            React.createElement(Popper, { mode: "cursor", cursor: cursor, align: align, position: position, portalClassName: classNames.portal, open: displayState !== 'closed', watchContentChange: true, content: React.createElement(CSSTransition, { nodeRef: $content, in: displayState === 'opening' || displayState === 'opened', addEndListener: (done) => $content.current?.addEventListener('transitionend', done, false), mountOnEnter: true, unmountOnExit: true, appear: true, classNames: "RE_ContextMenu__contentWrapper-", onEntered: () => setDisplayState('opened'), onExited: () => setDisplayState('closed') },
                    React.createElement("div", { ref: $content, className: cx('RE_ContextMenu__contentWrapper', classNames.contentWrapper), onClickCapture: preventContentClickWhileClosing, onClick: handleContentClick }, displayContent)) }))));
});
function isCorrectRef($ref) {
    return !!$ref && typeof $ref !== 'function';
}
//# sourceMappingURL=ContextMenu.js.map