import { expectNever } from '@vkontakte-internal/utils';
import { useCallback, useEffect, useRef, useState, } from 'react';
import { reflow } from '../../utils/reflow';
/**
 * Хук, который решает какую высоту нужно установить для сворачиваемой области в зависимости от состояния.
 * Для анимации использует 4 состояния:
 * - collapsed - элемент свернут, высота 0 или minHeight;
 * - expanding - элемент разворачивается (идет анимация), высота фиксированная;
 * - expanded  - элемент развернулся, высота auto;
 * - before-collapse - элемент должен начать сворачиваться, высота фиксированная;
 * Фиксированная высота в состояниях expanding и before-collapse нужна для работы CSS переходов.
 * Высота auto нужна для того, чтобы компонент поддерживал динамическое изменение содержимого.
 */
export function useCollapsibleHeight(isExpanded, minHeight) {
    const ref = useRef(null);
    const defaultState = isExpanded ? 'expanded' : 'collapsed';
    const [state, setState] = useState(defaultState);
    // Переходы в случае когда состояние компонента должно измениться
    useEffect(() => {
        setState((oldState) => {
            switch (oldState) {
                case 'collapsed':
                    return isExpanded ? 'expanding' : oldState;
                case 'expanding':
                    return isExpanded ? oldState : 'collapsed';
                case 'expanded':
                    return isExpanded ? oldState : 'before-collapse';
                case 'before-collapse':
                    return isExpanded ? 'expanded' : oldState;
                default:
                    return expectNever(oldState);
            }
        });
    }, [isExpanded]);
    useEffect(() => {
        if (state === 'before-collapse') {
            if (ref.current) {
                const contentHeight = ref.current.scrollHeight;
                ref.current.style.height = `${contentHeight}px`;
                // Без reflow браузер проигнорирует предыдущее действие и будет
                // анимировать auto->0, вместо height->0
                reflow(ref.current);
            }
            setState('collapsed');
        }
    }, [state]);
    // Когда анимация перехода закончилась, мы хотим перевести компонент
    // в законченное состояние. Например, установить для развернутого компонента
    // высоту auto (чтобы элемент подстраивался при динамическом изменении содержимого)
    const onTransitionEnd = useCallback(() => {
        setState((oldState) => {
            switch (oldState) {
                case 'expanding':
                    return 'expanded';
                case 'before-collapse':
                    return 'collapsed';
                case 'collapsed':
                case 'expanded':
                    return oldState;
                default:
                    return expectNever(oldState);
            }
        });
    }, []);
    switch (state) {
        case 'collapsed':
            return [minHeight || 0, ref, onTransitionEnd];
        case 'expanded':
            return ['auto', ref, onTransitionEnd];
        case 'expanding':
        case 'before-collapse':
            return [ref.current?.scrollHeight ?? 'auto', ref, onTransitionEnd];
        default:
            return expectNever(state);
    }
}
//# sourceMappingURL=useCollabsibleHeight.js.map