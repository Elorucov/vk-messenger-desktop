import { useLayoutEffect, useRef } from 'react';
import { getOffsetTop } from '../../../../utils/getOffsetTop';
const compareStates = (state1, state2) => state1.isScrollingDown === state2.isScrollingDown &&
    state1.isScrollAboveContent === state2.isScrollAboveContent &&
    state1.isScrollBelowContent === state2.isScrollBelowContent;
/**
 * С помощью этого хука можно добавить элементу внутри контента немного улучшенное sticky поведение:
 * В отличие от обычного элемента с `position=sticky`, который просто прилипает не ниже/выше указанной позиции,
 * Улучшенное sticky поведение позволяет элементу скроллиться вниз/вверх вместе с родителем,
 * пока первый не достигает своего конца/начала.
 * @returns реф на элемент
 */
export function useStickyPosition(offsetTop = 0) {
    const contentRef = useRef(null);
    const lastScrollTop = useRef(0);
    const lastState = useRef({
        isScrollingDown: false,
        isScrollBelowContent: false,
        isScrollAboveContent: false,
    });
    useLayoutEffect(() => {
        if (typeof window === 'undefined' || !contentRef.current) {
            return;
        }
        const updateContentPosition = (position, top) => {
            if (contentRef.current) {
                contentRef.current.style.position = position;
                contentRef.current.style.top = top;
            }
        };
        const updatePosition = () => {
            const isDocumentFixed = document.documentElement.style.position === 'fixed';
            if (isDocumentFixed) {
                return;
            }
            const scrollTop = window.pageYOffset;
            const isScrollingDown = scrollTop > lastScrollTop.current;
            lastScrollTop.current = scrollTop;
            if (!contentRef.current) {
                return;
            }
            const windowHeight = window.innerHeight;
            const { height: contentHeight } = contentRef.current.getBoundingClientRect();
            const contentTop = getOffsetTop(contentRef.current);
            const scrollBottom = scrollTop + windowHeight;
            const contentBottom = contentTop + contentHeight;
            const newState = {
                isScrollingDown,
                isScrollAboveContent: (!isScrollingDown && lastState.current.isScrollAboveContent) || scrollTop <= contentTop,
                isScrollBelowContent: (isScrollingDown && lastState.current.isScrollBelowContent) || scrollBottom >= contentBottom,
            };
            /**
             * Дальше мы обрабатываем 4 основных сценария:
             * 1. Пользователь скроллит вниз, но еще не достиг конца элемента
             * 2. Пользователь скроллит вниз и уже достиг конца элемента
             * 3. Пользователь скроллит вверх, но еще не достиг начала элемента
             * 4. Пользователь скроллит вверх и уже достиг начала элемента
             * 5. Если html залочен через scrollLock, то ничего не делаем
             * В случаях 2 и 4 мы закрепляем элемент обычным `position=sticky` чтобы браузер все сделал за нас.
             *
             * Все модификации вносятся только тогда, когда они нужны (когда мы переходим из одного сценария в другой)
             */
            if (compareStates(lastState.current, newState)) {
                return;
            }
            const offsetTopValue = typeof offsetTop === 'number' ? `${offsetTop}px` : offsetTop;
            if (newState.isScrollingDown) {
                if (newState.isScrollBelowContent) {
                    // Используем min для вычисления минимального значения
                    updateContentPosition('sticky', `min(${windowHeight - contentHeight}px, ${offsetTopValue})`);
                }
                else {
                    updateContentPosition('relative', `${contentRef.current.offsetTop}px`);
                }
            }
            else {
                if (newState.isScrollAboveContent) {
                    updateContentPosition('sticky', offsetTopValue);
                }
                else {
                    updateContentPosition('relative', `${contentRef.current.offsetTop}px`);
                }
            }
            lastState.current = newState;
        };
        document.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition, {
            passive: true,
        });
        updatePosition();
        return () => {
            document.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [offsetTop]);
    return contentRef;
}
//# sourceMappingURL=useStickyPosition.js.map