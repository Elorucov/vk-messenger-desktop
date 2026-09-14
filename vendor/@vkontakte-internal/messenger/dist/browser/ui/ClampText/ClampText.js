import React, { useLayoutEffect, useRef, useState, } from 'react';
import cx from 'classnames';
import '../../ui/ClampText/ClampText.css';
import { useBrowserEnv } from '../../hooks/misc';
export const ClampText = ({ children, lines = 2, trigger, className, initialTriggerVisibility = true, }) => {
    const { lang } = useBrowserEnv();
    const [isExpanded, setExpanded] = useState(false);
    const [isTriggerVisible, setTriggerVisible] = useState(initialTriggerVisibility);
    const $container = useRef(null);
    useLayoutEffect(() => {
        const elem = $container.current;
        if (!elem) {
            return;
        }
        const { scrollHeight, clientHeight } = elem;
        if (scrollHeight <= clientHeight) {
            setExpanded(true);
        }
        else {
            setTriggerVisible(true);
        }
    }, []);
    const open = () => {
        setExpanded(true);
    };
    const renderTrigger = () => {
        if (!isTriggerVisible) {
            return null;
        }
        if (trigger) {
            return trigger;
        }
        return (React.createElement(ClampTextTrigger, null, lang.use('me_clamp_text_show_more')));
    };
    return (React.createElement("div", { onClick: open, className: cx('ClampText', { 'ClampText--expanded': isExpanded }) },
        React.createElement("div", { className: cx(className, 'ClampText__content', {
                'ClampText__content--expanded': isExpanded,
            }), ref: $container, style: {
                '--clamp_text_lines': lines,
            } }, children),
        !isExpanded && renderTrigger()));
};
export const ClampTextTrigger = ({ children, color, className }) => {
    return (React.createElement("button", { className: cx(className, 'ClampTextTrigger'), style: { '--clamp_text_trigger_background': color } }, children));
};
//# sourceMappingURL=ClampText.js.map