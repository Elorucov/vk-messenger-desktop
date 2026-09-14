// Утащил из static/js/modules/shared/accessibility/accessibility.ts
export const FOCUSABLE_ELEMENTS_STRING = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([hidden]):not([type="hidden"]):not([aria-hidden])',
    'select:not([disabled]):not([hidden]):not([aria-hidden])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'audio',
    'video',
    '[contenteditable]',
    '[tabindex]',
    '[data-focus-first="true"]',
];
export function getFocusableElements(content = document) {
    return Array.from(content.querySelectorAll(FOCUSABLE_ELEMENTS_STRING.join()))
        .filter((item) => item.offsetParent !== null) // Оставим только видимые элементы
        .filter((item) => item.tabIndex !== -1 || (item.tabIndex === -1 && item.dataset.focusFirst === 'true'));
}
//# sourceMappingURL=accessibility.js.map