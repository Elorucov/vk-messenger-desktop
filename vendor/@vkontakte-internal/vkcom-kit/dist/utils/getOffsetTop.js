/**
 * Возвращает offsetTop элемента относительно корневого элемента (документа)
 */
export function getOffsetTop(element) {
    let top = 0;
    while (element) {
        top += element.offsetTop;
        element = isHTMLElement(element.offsetParent) ? element.offsetParent : null;
    }
    return top;
}
function isHTMLElement(element) {
    if (!element) {
        return false;
    }
    return 'offsetHeight' in element;
}
//# sourceMappingURL=getOffsetTop.js.map