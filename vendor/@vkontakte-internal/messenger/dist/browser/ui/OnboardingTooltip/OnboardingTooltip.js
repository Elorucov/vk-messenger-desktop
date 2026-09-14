import { Icon16Cancel } from '@vkontakte/icons';
import '../../ui/OnboardingTooltip/OnboardingTooltip.css';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import React, { useCallback, useEffect, useRef, useState, } from 'react';
import cx from 'classnames';
const ONBOARDING_TOOLTIP_AUTO_HIDE_TIMEOUT = 5000;
/**
 * Онбординговый тултип.
 * Работает в контролируемом режиме.
 * Закрывается по трем возможным сценариям:
 * - по наведению на closeOnHoverTarget.current
 * - по нажатию на крестик в содержимом, если передан флаг withCloseButton
 * - по истечении таймаута closeTimeout
 */
export const OnboardingTooltip = ({ isOpen, text, onClose, withCloseButton, closeOnHoverTarget, closeTimeout = ONBOARDING_TOOLTIP_AUTO_HIDE_TIMEOUT, align, position, arrowOffset, targetClassName, }) => {
    const [tooltipState, setTooltipState] = useState('closed');
    const onTooltipClose = useCallback(() => {
        setTooltipState('closed');
        onClose();
    }, [onClose]);
    const startTooltipClosing = useCallback(() => {
        setTooltipState((tooltipState) => tooltipState !== 'opened' ? tooltipState : 'closing');
    }, []);
    useEffect(() => {
        const container = closeOnHoverTarget.current;
        if (container === null) {
            return;
        }
        container.addEventListener('mouseover', startTooltipClosing);
        return () => container.removeEventListener('mouseover', startTooltipClosing);
    }, [closeOnHoverTarget, startTooltipClosing]);
    // Используем ref на функцию в эффектах, так как иначе она берется
    // из замыкания на момент вызова и внутри нее имеем неактуальный стейт, а стейт на момент вызова эффекта.
    // Добавить функцию в зависимости эффекта тоже не помогает - тултип не закрывается по таймайту
    // и также эффект зацикливается.
    const startTooltipClosingRef = useRef(startTooltipClosing);
    startTooltipClosingRef.current = startTooltipClosing;
    useEffect(() => {
        if (!isOpen) {
            startTooltipClosingRef.current();
            return;
        }
        setTooltipState('opened');
        const timeoutId = setTimeout(() => {
            startTooltipClosingRef.current();
        }, closeTimeout);
        return () => clearTimeout(timeoutId);
    }, [isOpen, closeTimeout]);
    return (React.createElement(Tooltip, { content: React.createElement("div", { className: "OnboardingTooltip__content", onClick: (e) => e.stopPropagation() },
            React.createElement("span", null, text),
            withCloseButton && (React.createElement("button", { className: "OnboardingTooltip__close", onClick: (e) => {
                    e.stopPropagation();
                    onClose();
                } },
                React.createElement(Icon16Cancel, null)))), align: align, position: position, arrowOffset: arrowOffset, open: tooltipState === 'opened', onClose: onTooltipClose, tooltipClassName: "OnboardingTooltip", pointerEvents: true, vkuiStyle: true },
        React.createElement("div", { className: cx('OnboardingTooltip__target', targetClassName) })));
};
//# sourceMappingURL=OnboardingTooltip.js.map