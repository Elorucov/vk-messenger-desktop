import React, { useCallback, useEffect, useRef, useState, } from 'react';
import cx from 'classnames';
import { CSSTransition } from 'react-transition-group';
import '../../ui/StickyHeader/StickyHeader.css';
/**
 * Шапка которая умеет появляться и скрываться, а так же менять свой контент в зависимости от положения скролла
 *
 * Для работы нужно передать ссылки на контейнер который будет скроллиться, а также на все "якоря" в составе
 * контйнера, которые указывают на точки прохождения разделов контейнера. В момент прохождения якоря в процессе
 * скролла, эта шапка появится или скроется, и изменит свой контент в зависимости от текущего раздела.
 *
 * @sample
 *
 * Разметка:
 * <div ref={containerRef}>
 *   <article>Длинное описание..</article>
 *   <div ref={menuAnchorRef} />
 *   <nav>
 *     <a>Кнопка 1</a>
 *     <a>Кнопка 2</a>
 *   </nav>
 *   <div ref={footerAnchorRef} />
 *   <footer>
 *     <article>Еще один длинный текст..</article>
 *   </footer>
 * </div>
 *
 * Использование:
 * <StickyHeader containerRef={containerRef} sections={[{ content: 'Меню', anchorRef: menuAnchorRef }, { content: 'Подвал', anchorRef: footerAnchorRef }]} />
 *
 * Изначально шапка будет скрыта. В момент прокрутки контейнера до menuAnchorRef появится шапка с текстом "Меню", и
 * затем когда прокрутка дойдет до footerAnchorRef, текст "Меню" сменится на "Подвал".
 *
 * Количество якорей не ограничено.
 */
export const StickyHeader = ({ left, right, containerRef, sections, }) => {
    const [currentSection, setCurrentSection] = useState(null);
    const onScroll = useCallback((event) => {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        const top = event.target.scrollTop;
        let lowestSection = null;
        for (let index = 0; index < sections.length; index += 1) {
            const section = sections[index];
            const sectionEl = section?.anchorRef.current;
            if (!sectionEl) {
                continue;
            }
            const y = sectionEl.offsetTop;
            if (y > top) {
                continue;
            }
            const lowestSectionTop = lowestSection?.anchorRef.current?.offsetTop;
            if (lowestSectionTop && y < lowestSectionTop) {
                continue;
            }
            lowestSection = section;
        }
        setCurrentSection(lowestSection);
    }, [sections]);
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const element = containerRef.current;
        element.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            element.removeEventListener('scroll', onScroll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef.current, onScroll]);
    const renderSections = () => {
        return sections.map((section) => (React.createElement(SectionContent, { key: section.id, section: section, isActive: section.id === currentSection?.id })));
    };
    const isOverContent = currentSection !== null;
    return (React.createElement("div", { className: cx('StickyHeader', {
            'StickyHeader--overContent': isOverContent,
        }) },
        left && React.createElement("div", { className: "StickyHeader__side" }, left),
        React.createElement("div", { className: "StickyHeader__content" }, renderSections()),
        right && React.createElement("div", { className: "StickyHeader__side" }, right)));
};
const SectionContent = ({ section, isActive, }) => {
    const nodeRef = useRef(null);
    return (React.createElement(CSSTransition, { nodeRef: nodeRef, in: isActive, timeout: 1000, classNames: "SectionContent", appear: true, addEndListener: (done) => nodeRef.current?.addEventListener('transitionend', done, false) },
        React.createElement("div", { key: section.id, ref: nodeRef, className: cx('StickyHeader__section', {
                'StickyHeader__section--active': isActive,
            }) }, section.content)));
};
//# sourceMappingURL=StickyHeader.js.map