import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":7}],"HorizontalScroll":["@vkontakte-internal/vkcom-kit",{"className":1}],"IconButton":["@vkontakte-internal/vkcom-kit",{"className":1}],"img":["global",{"className":1}],"Button":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { useMemo } from 'react';
import { Icon20Hand } from '@vkontakte/icons';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { classNames as cn } from '@vkontakte/vkjs';
import { useHorizontalScroll } from './useHorizontalScroll';
import { IconButton, Button, ButtonGroup, HorizontalScroll } from '@vkontakte-internal/vkcom-kit';
/** всплывающее меню с реакциями при клике на кнопку с "рукой" */
export const CallReactionsMenu = ({ onReaction, onHand, handBtnTitle, disabled, isHand, onMoving, }) => {
    const { refScroll, refContainer, moving } = useHorizontalScroll({ onMoving });
    const reactions = useTypedSelector((state) => state.reactions?.reactions);
    const buttons = useMemo(() => {
        if (!reactions) {
            return null;
        }
        return Object.keys(reactions?.[28] || {});
    }, [reactions]);
    const _onReaction = (key) => {
        if (!moving) {
            onReaction(key);
        }
    };
    return (_jsx("div", { className: cn('CallReactionsMenu', { 'CallReactionsMenu--moving': moving }), ref: refContainer, children: _jsxs(ButtonGroup, { mode: "vertical", gap: "m", children: [!!(reactions && buttons) && (_jsx(HorizontalScroll, { className: "CallReactionsMenu__h-scroll", showArrows: false, getRef: refScroll, scrollOnAnyWheel: true, inline: true, children: _jsxs("div", { className: "CallReactionsMenu__carousel", children: [_jsx("div", { className: "CallReactionsMenu__carousel__edge" }), buttons.map((key) => (_jsx(IconButton, { disabled: disabled, label: reactions.descriptions[key], className: "CallReactionsMenu__button", hasHover: false, hasActive: false, onClick: () => _onReaction(key), children: _jsx("img", { className: "CallReactionsMenu__button__img", alt: key, src: reactions[28][key], srcSet: `${reactions[56][key]} 1.5x` }) }, key))), _jsx("div", { className: "CallReactionsMenu__carousel__edge" }), _jsx("div", { className: cn('CallReactionsMenu__carousel__scrim', 'CallReactionsMenu__carousel__scrim--left') }), _jsx("div", { className: "CallReactionsMenu__carousel__scrim" })] }) })), onHand && handBtnTitle && (_jsx("div", { className: "CallReactionsMenu__submit__wrap", children: _jsx(Button, { className: cn('CallReactionsMenu__submit', { 'CallReactionsMenu__submit--hand-up': !!isHand }), before: _jsx(Icon20Hand, {}), mode: "secondary", size: "m", stretched: true, onClick: onHand, children: handBtnTitle }) }))] }) }));
};
//# sourceMappingURL=CallReactionsMenu.js.map