export const setRef = (node, setElementRef) => {
    if (!setElementRef) {
        return;
    }
    if (typeof setElementRef === 'function') {
        setElementRef(node);
    }
    else if (setElementRef.hasOwnProperty('current')) {
        setElementRef.current = node;
    }
};
//# sourceMappingURL=setRef.js.map