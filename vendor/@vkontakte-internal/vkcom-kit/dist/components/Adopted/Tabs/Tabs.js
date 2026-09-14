import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Tabs as TabsNative } from '@vkontakte/vkui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TabsContextProvider } from './TabsContext';
import styles from './Tabs.module.css';
export const Tabs = ({ mode = 'default', withFade, noMinWidth, disableStretch, layoutFillMode, children, ...restProps }) => {
    const scrollRef = useRef(null);
    const [isFadeLeft, setFadeLeft] = useState(false);
    const [isFadeRight, setFadeRight] = useState(false);
    const calculatedLayoutFillMode = disableStretch ? 'shrinked' : layoutFillMode;
    const context = useMemo(() => ({ noMinWidth }), [noMinWidth]);
    useEffect(() => {
        if (scrollRef.current && scrollRef.current.clientWidth < scrollRef.current.scrollWidth) {
            setFadeRight(true);
        }
    }, []);
    const scrollHandler = useCallback(() => {
        if (!scrollRef.current) {
            return;
        }
        setFadeLeft(scrollRef.current.scrollLeft !== 0);
        setFadeRight(!(scrollRef.current.clientWidth + scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth - 10));
    }, []);
    let content = children;
    if (withFade) {
        content = (_jsx("div", { className: classNames(styles.in, isFadeLeft && styles.inFadeLeft, isFadeRight && styles.inFadeRight), children: _jsx("div", { ref: scrollRef, className: styles.scroll, onScroll: scrollHandler, children: _jsx("div", { className: styles.scrollIn, children: content }) }) }));
    }
    return (_jsx(TabsContextProvider, { value: context, children: _jsx(TabsNative, { mode: mode, layoutFillMode: calculatedLayoutFillMode, ...restProps, children: content }) }));
};
//# sourceMappingURL=Tabs.js.map