import React, { useRef, useState, useLayoutEffect } from 'react';
import cx from 'classnames';
import { CollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import '../../ui/MEAppMainPanel/MEAppMainPanel.css';
export const MEAppMainPanel = ({ children, isCollapsible, classNames = '', }) => {
    const $mainPanel = useRef(null);
    const [mainPanelInitialWidth, setMainPanelInitialWidth] = useState(null);
    useLayoutEffect(() => {
        if ($mainPanel.current) {
            setMainPanelInitialWidth($mainPanel.current.offsetWidth);
        }
    }, []);
    return isCollapsible ? (React.createElement(CollapsibleContainer, { defaultWidth: mainPanelInitialWidth },
        React.createElement("div", { ref: $mainPanel, className: cx('MEAppMainPanel', {
                'MEAppMainPanel--collapsible': mainPanelInitialWidth !== null,
            }, classNames) }, children))) : (React.createElement("div", { ref: $mainPanel, className: classNames }, children));
};
//# sourceMappingURL=MEAppMainPanel.js.map