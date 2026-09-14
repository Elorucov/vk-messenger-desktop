import { useMemo, useState, useEffect, useCallback } from 'react';
import { createResizeObserver } from '../../../hooks/useResizeObserver';
/**
 * Возвращает функцию, определяющую влезает ли переданный функции текст
 * с примененными стилями styleRef элемента в containerRef контейнер
 * @param {RefObject<HTMLElement>} containerRef Ссылка на контейнер
 * @param {RefObject<HTMLElement>} styleRef Ссылка на элемент, стили которого будут использованы
 * для вычислений
 * @returns {Function} Функция для определения, влезает ли переданный текст в контейнер
 */
export const useIsTextFitsContainer = ({ containerRef, styleRef }) => {
    const [textContainerWidth, setTextContainerWidth] = useState(0);
    const context = useMemo(() => {
        if (!containerRef?.current) {
            return null;
        }
        const fragment = document.createDocumentFragment();
        const canvas = document.createElement('canvas');
        fragment.appendChild(canvas);
        const context = canvas.getContext('2d');
        if (!context) {
            return null;
        }
        const computedStyles = window.getComputedStyle(styleRef?.current ?? containerRef.current);
        context.font = computedStyles.font
            ? computedStyles.font
            : `${computedStyles.fontSize}" "${computedStyles.fontFamily}`;
        return context;
        // Необходимо пересоздавать canvas при изменении размера контейнера,
        // т. к. от ширины экрана зависят вычисляемые стили
    }, [textContainerWidth]);
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const onResize = (entry) => {
            const { width } = entry.contentRect;
            if (width) {
                setTextContainerWidth(width);
            }
        };
        const observer = createResizeObserver(onResize);
        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
        };
    }, []);
    return useCallback((text) => {
        if (!context) {
            return false;
        }
        const textWidth = context.measureText(text).width;
        return textWidth < textContainerWidth;
    }, [context]);
};
//# sourceMappingURL=useIsTextFitsContainer.js.map