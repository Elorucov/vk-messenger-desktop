import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}],"Button":["@vkontakte-internal/vkcom-kit",{"className":1}],"Icon20Hand":["@vkontakte/icons",{"className":1}]} */
import { memo, useState, useEffect, useRef, useLayoutEffect, useCallback, } from 'react';
import { CallReactionsMenu, } from '../../components/CallReactionsMenu/CallReactionsMenu';
import { AppearanceProvider, Button, Popover } from '@vkontakte-internal/vkcom-kit';
import { Icon20Hand, Icon24HandHeartFilled } from '@vkontakte/icons';
import { DivWithRootRef } from '../DivWithRootRef/DivWithRootRef';
import { createTimeout } from '../../helpers/helpers';
import { useTimeout } from '../../hooks/useTimeout';
import { useDelayedHide } from '../CallReactionsMenu/useDelayedHide';
import { CallsIconButton } from '../CallsIconButton';
import { getIsVoiceRoom } from '../../selectors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
/** новая кнопка управления реакциями + поднятием руки */
const CallReactionsButtonComponent = ({ onHand, onReaction, onTooltipChange, tooltipTitle, tooltips, isHand, iconReaction, isLeftPlacement, ariaLabel, disabled, iconButton, className, customRenderButton, }) => {
    const isVoiceRoom = useTypedSelector(getIsVoiceRoom);
    const delayedHide = useDelayedHide();
    const disabledReactionsProxy = useDisabledReactionsProxy(onReaction);
    const icon = iconButton || _jsx(Icon24HandHeartFilled, {});
    const buttonIcon = iconReaction ? (_jsx("div", { className: isVoiceRoom ? 'CallReactionsButton_iconReaction--voiceRoom' : 'CallReactionsButton_iconReaction', children: iconReaction })) : (icon);
    {
        /**
         *  Так как не пашет одновременное использование click и hover в Popover приходится извращаться через manual и события мышки
         *  Задача, которая фиксит это, потом убрать все события мышки и кликов и оставить в trigger ['click', 'hover']
         *  @link https://github.com/VKCOM/VKUI/pull/7170
         */
    }
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    let popoverTimeout = useRef(undefined);
    function popoverMouseEnter(isTriggerElement = false) {
        clearTimeout(popoverTimeout.current);
        if (isTriggerElement) {
            onTooltipChange('hand', true);
        }
    }
    function popoverMouseLeave() {
        popoverTimeout.current = setTimeout(() => onTooltipChange('hand', false), 200);
    }
    return (_jsx(AppearanceProvider, { value: "dark", children: _jsxs("div", { className: "CallReactionsButton", children: [_jsx(Popover, { placement: isLeftPlacement ? 'left' : 'top', 
                    /**
                     * @see https://jira.mvk.com/browse/CALL-12012
                     * - `-5` нужно сделать по задаче
                     * - `8`  => vkui/Popper.tsx => default offsetDistance
                     */
                    offsetByMainAxis: isLeftPlacement ? -8 : 9, content: tooltips ? (_jsx("div", { className: "CallReactionsButton__wrapper", children: _jsx(Button, { className: "CallReactionsButton__button", size: "m", stretched: true, appearance: "accent", before: _jsx(Icon20Hand, { className: "CallReactionsButton__button-icon" }), onClick: onHand, children: tooltipTitle }) })) : undefined, shown: useHandDownTooltipShown({ isHand, tooltips }), usePortal: false, arrow: true, children: _jsx(DivWithRootRef, { className: "CallReactionsButton__anchor--hand" }) }), _jsx(Popover, { trigger: "manual", placement: "top", shown: tooltips.hand, onShownChange: (shown) => onTooltipChange('hand', shown), onMouseEnter: () => popoverMouseEnter(), onMouseLeave: () => popoverMouseLeave(), hoverDelay: [0, delayedHide.delay || 0], content: !disabled ? (_jsx(CallReactionsMenu, { ...disabledReactionsProxy, onHand: onHand, handBtnTitle: tooltipTitle, isHand: isHand, onMoving: delayedHide.onMoving })) : undefined, usePortal: false, children: customRenderButton ? (customRenderButton(buttonIcon)) : (_jsx(CallsIconButton, { isMainButton: true, ariaLabel: ariaLabel, "aria-expanded": tooltips.hand, "data-testid": "calls_call_footer_button_reactions", onClick: () => onTooltipChange('hand', !tooltips.hand), onMouseEnter: () => popoverMouseEnter(true), onMouseLeave: () => popoverMouseLeave(), className: className, disabled: disabled, hasHover: false, hasActive: false, children: buttonIcon })) })] }) }));
};
export const CallReactionsButton = memo(CallReactionsButtonComponent);
CallReactionsButton.displayName = 'CallReactionsButton';
/**
 * костыль для того, чтобы при выходе из collapsed
 * режима, тултип отрисовывался там где нужно, тк
 * из за animation-in окна звонка кнопки не успевают встать
 * на своё место и он отрисовывается выше, чем нужно
 */
function useHandDownTooltipShown({ tooltips, isHand }) {
    const mounted = useRef(false);
    const [localShowHand, setLocalShowHand] = useState(false);
    useLayoutEffect(() => {
        const next = Boolean(!tooltips.hand && isHand);
        // убирать нужно сразу
        if (!next || mounted.current) {
            return setLocalShowHand(next);
        }
        // столько же, сколько идет animation-in окна звонков
        return createTimeout(() => setLocalShowHand(next), 300);
    }, [tooltips.hand, isHand]);
    useEffect(() => {
        mounted.current = true;
    }, []);
    return localShowHand;
}
/**
 * при выборе реакций на сервере работает антифлуд (примерно
 * 1000 мс), чтобы юзер не кликал впустую кнопки реакций -
 * делаем disable на этот срок после выбора
 */
function useDisabledReactionsProxy(onReaction) {
    const to = useTimeout();
    const [disabled, setDisabled] = useState(false);
    useEffect(() => {
        return () => to.clear();
    }, []);
    const _onReaction = useCallback((reaction) => {
        onReaction(reaction);
        setDisabled(true);
        to.add(() => setDisabled(false), 1000);
    }, [onReaction]);
    return {
        disabled,
        onReaction: _onReaction,
    };
}
//# sourceMappingURL=CallReactionsButton.js.map