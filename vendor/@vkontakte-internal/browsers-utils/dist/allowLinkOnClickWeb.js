export const allowLinkOnclickWebAttr = 'data-allow-link-onclick-web';
// Allow navigating to <a> links even if they have onclick attributes (or even without attributes,
// but with React onClick handlers)
// See FEED-13646 for more detailed description
export const allowLinkOnclickWebAttrs = {
    [allowLinkOnclickWebAttr]: 1,
};
export function isAllowLinkOnclickWebForLink(el) {
    if (!el || !(el instanceof HTMLElement)) {
        return false;
    }
    return el.hasAttribute(allowLinkOnclickWebAttr);
}
//# sourceMappingURL=allowLinkOnClickWeb.js.map