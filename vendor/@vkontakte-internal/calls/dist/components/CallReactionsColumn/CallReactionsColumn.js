import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useRef, useCallback } from 'react';
import { classNames as cn } from '@vkontakte/vkjs';
import { useReactionsColumn } from '../CallReactions/hooks/useReactionsColumn';
import { useReactionsStore } from '../CallReactions/hooks/useReactionsStore';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useLang } from '../../hooks/useLang';
/** блок-колонка для отрисовки анимаций с реакциями в нижнем правом углу окна звока */
export const CallReactionsColumn = ({ isGridView, isShownParticipantsAside, refCall, className, showReactionWithoutUserName, }) => {
    const iconUrls = useTypedSelector((state) => state.reactions?.reactions);
    const refContainer = useRef(null);
    const { getLang } = useLang();
    const onAdd = useCallback((reaction) => {
        if (!refContainer.current)
            return;
        const imgUrl = iconUrls?.[24][reaction.key];
        const imgUrl2x = iconUrls?.[48][reaction.key];
        if (!imgUrl || !imgUrl2x)
            return;
        const reactionLabel = getLang('calls_reactions_default_accessibility_label');
        const element = createReactionElement({
            reaction,
            imgUrl,
            imgUrl2x,
            reactionLabel,
            withoutName: showReactionWithoutUserName,
        });
        requestAnimationFrame(() => {
            refContainer.current?.append(element);
        });
    }, []);
    const { add } = useReactionsColumn({ refCall, onAdd });
    useReactionsStore({ add, showReactionWithoutUserName });
    return (_jsx("div", { ref: refContainer, className: cn('CallsReactionsColumn', className, {
            'CallsReactionsColumn--grid': !!isGridView,
            'CallsReactionsColumn--aside-hidden': !isGridView && !isShownParticipantsAside,
        }), "aria-live": "polite" }));
};
function createReactionElement({ imgUrl, imgUrl2x, reaction, reactionLabel, withoutName, }) {
    const div = document.createElement('div');
    div.classList.add('CallsReactionsColumn__reaction');
    if (withoutName) {
        div.classList.add('CallsReactionsColumn__reaction--withoutName');
    }
    div.style.setProperty('--calls-reaction-up-speed', `${reaction.animationSpeed}ms`);
    div.onanimationend = () => {
        reaction.onAnimationEnd?.(reaction.id);
        requestAnimationFrame(() => {
            div.remove();
        });
    };
    const img = document.createElement('img');
    img.classList.add('CallsReactionsColumn__reaction__icon');
    img.src = imgUrl;
    img.srcset = `${imgUrl2x} 1.5x`;
    img.alt = `${reactionLabel} ${reaction.description ?? reaction.key}`;
    const h5 = document.createElement('h5');
    h5.classList.add('CallsReactionsColumn__reaction__name');
    h5.textContent = reaction.name;
    div.append(img, h5);
    return div;
}
//# sourceMappingURL=CallReactionsColumn.js.map