import { browser } from '@vkontakte/calls-sdk';
export const currentBrowser = {
    isChrome: browser.browserName() === 'Chrome',
    isSafari: browser.browserName() === 'Safari',
    isFirefox: browser.browserName() === 'Firefox',
    isYandex: browser.browserName() === 'Yandex',
    isOpera: browser.browserName() === 'Opera',
    isSferum: browser.browserName() === 'Sferum',
    isEdge: browser.browserName() === 'Edge',
    isIE: browser.browserName() === 'IE',
    get isUnknown() {
        const { isUnknown, ...browsers } = this;
        return Object.values(browsers).every((value) => value === false);
    },
};
//# sourceMappingURL=currentBrowser.js.map