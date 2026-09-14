import React, { memo, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import './HopNavigationButton.css';
import { usePrevious } from '../../hooks/misc';
const TRANSITION_TIMEOUT = 200;
export const HopNavigationButton = memo(({ count, icon, isVisible = true, isCounterVisible = true, title, onClick, }) => {
    const prevCount = usePrevious(count);
    const nodeRef = useRef(null);
    return (React.createElement(CSSTransition, { nodeRef: nodeRef, timeout: TRANSITION_TIMEOUT, classNames: "HopNavigationButton-", in: isVisible, mountOnEnter: true },
        React.createElement("button", { ref: nodeRef, onClick: onClick, "aria-label": title, className: "HopNavigationButton" },
            isCounterVisible && (React.createElement("div", { className: "HopNavigationButton__label", "aria-hidden": true },
                React.createElement(UnreadCounter, { count: isVisible ? count : prevCount || count, isMuted: false, isThemed: true, size: 18, className: "HopNavigationButton__labelCounter" }))),
            React.createElement("div", { className: "HopNavigationButton__icon" }, icon))));
});
//# sourceMappingURL=HopNavigationButton.js.map