import React, { createContext, useContext, useState, } from 'react';
import cx from 'classnames';
const DraggableListContext = createContext(undefined);
export const ComposerDraggableList = ({ parentContainerRef, onPositionChange, children, className, doScroll, }) => {
    const [itemState, setItemState] = useState({
        status: 'ready',
        type: null,
        index: -1,
        nextIndex: -1,
        rearrangeOffset: 0,
    });
    return (React.createElement(DraggableListContext.Provider, { value: {
            parentContainerRef,
            onPositionChange: onPositionChange || (() => { }),
            itemState,
            setItemState,
            doScroll,
        } },
        React.createElement("ul", { className: cx(className) }, children)));
};
export function useDraggableList() {
    const context = useContext(DraggableListContext);
    if (!context) {
        throw new Error('Компонент не помещен в ComposerDraggableList');
    }
    return context;
}
//# sourceMappingURL=ComposerDraggableList.js.map