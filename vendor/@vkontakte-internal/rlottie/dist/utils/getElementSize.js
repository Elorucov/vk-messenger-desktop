export function getElementSize(element) {
    const { paddingTop, paddingBottom, paddingLeft, paddingRight, borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth, } = getComputedStyle(element);
    const paddingX = parseInt(paddingLeft) + parseInt(paddingRight);
    const paddingY = parseInt(paddingTop) + parseInt(paddingBottom);
    const borderX = parseInt(borderLeftWidth) + parseInt(borderRightWidth);
    const borderY = parseInt(borderTopWidth) + parseInt(borderBottomWidth);
    const width = Math.trunc(parseInt(element.style.width) || element.clientWidth - paddingX - borderX || element.offsetWidth) || 0;
    const height = Math.trunc(parseInt(element.style.height) || element.clientHeight - paddingY - borderY || element.offsetHeight) || 0;
    return {
        width,
        height,
    };
}
//# sourceMappingURL=getElementSize.js.map