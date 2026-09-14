import '../../ui/MessageActionsDropdown/MessageActionsDropdown.css';
import React, { useEffect, useRef, useState, useMemo, } from 'react';
import cx from 'classnames';
import { MessageActionsButton } from '../../ui/MessageActionsButton/MessageActionsButton';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useInView } from 'react-intersection-observer';
import { useCombinedRefs, useBrowserEnv } from '../../hooks/misc';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { OnboardingWrapper } from '../../ui/OnboardingWrapper/OnboardingWrapper';
import { MessageActionsButtonMore } from '../../ui/MessageActionsButton/MessageActionsButton';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
export const MessageActionsDropdown = function MessageActionsDropdown({ content, message, wrapperClassName, portalClassName, contentWrapperClassName, children, setOpened, onOpen, onClose, open, watchContentChange, forceUpdateContent, handleRef, isLastMessage, }) {
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const { ref: inViewRef, inView } = useInView({ threshold: 1 });
    const messageActionTriggerButtonRef = useRef(null);
    const combinedRefsCallback = useCombinedRefs((ref) => {
        /**
         * Так как inViewRef нужен для закрытия дропдауна, когда кнопка действий
         * не в видимой области, и изменение рефа триггерит ререндер, поэтому
         * передаем реф только для открытого дропдауна.
         */
        if (open) {
            inViewRef(ref);
        }
    }, messageActionTriggerButtonRef);
    useEffect(() => {
        if (!inView) {
            setOpened(false);
        }
    }, [inView, setOpened]);
    const isOut = message.kind !== 'Foreign' && message.isOut;
    const buttonClassName = useMemo(() => {
        if (isWithoutBubblesTheme || isMobileLayout) {
            return undefined;
        }
        return isOut
            ? 'MessageActionsDropdownButton--out'
            : 'MessageActionsDropdownButton--in';
    }, [isWithoutBubblesTheme, isOut, isMobileLayout]);
    /**
     * Задержка для показа онбординга реакций, чтобы пользователь успел прочитать сообщение
     */
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isOnboardingShowing, setIsOnboardingShowing] = useState(false);
    useEffect(() => {
        if (!isLastMessage) {
            return;
        }
        const timer = setTimeout(() => {
            setShowOnboarding(true);
        }, 3000);
        return () => {
            clearTimeout(timer);
        };
    }, [isLastMessage]);
    return (React.createElement(DeferredRendering, null,
        React.createElement(Dropdown, { handleRef: handleRef, disableInert: true, enableFocusTrap: true, content: content, ...(isMobileLayout
                ? {
                    align: isOut ? 'left' : 'right',
                    position: 'bottom',
                    adaptation: 'horizontal',
                }
                : {
                    align: 'center',
                    position: isOut ? 'left' : 'right',
                    adaptation: 'vertical',
                }), open: open, onOpen: onOpen, onClose: onClose, classNames: {
                wrapper: cx('MessageActionsDropdown', wrapperClassName),
                wrapperOpened: 'MessageActionsDropdown--opened',
                wrapperClosed: cx({
                    'MessageActionsDropdown--closed': !isMobileLayout && !isOnboardingShowing,
                    'MessageActionsDropdown--closed-onboarding': isLastMessage && !showOnboarding,
                }),
                portal: portalClassName,
                contentWrapper: contentWrapperClassName,
            }, openType: "click", adaptive: true, forceUpdateContent: forceUpdateContent, hideOnClick: true, hideOnWheel: true, hideOnMouseLeave: true, watchContentChange: watchContentChange },
            React.createElement(MessageActionsButton, { containerClassName: buttonClassName, ref: combinedRefsCallback },
                React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "MessageActionsDropdownWrapper" }, children),
                React.createElement(OnboardingWrapper, { type: "tooltip", onHideEnd: () => {
                        setIsOnboardingShowing(false);
                        setShowOnboarding(false);
                    }, onShowStart: () => {
                        setIsOnboardingShowing(true);
                    }, shown: showOnboarding, mode: "1", appearance: "lime", tilt: "left", tipPosition: "top-left", size: 48, content: lang.use('me_onboarding_reactions'), campaignName: "me_mvk:message_reactions", screen: "mvk_convo", usePortal: messageActionTriggerButtonRef, enableQuarantine: true },
                    React.createElement("div", null,
                        React.createElement(MessageActionsButtonMore, { isTap: isMobileLayout })))))));
};
//# sourceMappingURL=MessageActionsDropdown.js.map