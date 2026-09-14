const _ua = navigator.userAgent.toLowerCase();
export const browser = {
    version: (_ua.match(/.+(?:me|ox|on|rv|it|era|opr|ie|edge)[\/: ]([\d.]+)/) || [0, '0'])[1],
    safari: !/chrome/i.test(_ua) && /webkit|safari|khtml/i.test(_ua),
    edge: /(edge)\/(\d+)\.(\d+)/.test(_ua),
    chrome: /(chrome)\/(\d+)\.(\d+)/.test(_ua),
    firefox: /(firefox)\/(\d+)\.(\d+)/.test(_ua),
};
export function getWarningBrowserInfo(browserWarnings) {
    const denyBrowser = browserWarnings?.find((row) => {
        return browser[row.browser] && row.version === undefined;
    });
    const denyBrowserWithVersion = browserWarnings?.find((row) => {
        return (browser[row.browser] && String(browser.version).startsWith(String(row.version)));
    });
    return denyBrowserWithVersion ?? denyBrowser ?? null;
}
//# sourceMappingURL=browser.js.map