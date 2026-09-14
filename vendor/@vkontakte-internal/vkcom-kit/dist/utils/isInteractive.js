/**
 * Функция определяет, является ли компонент наследующий свойства HTML элемента интерактивным (можно ли по нему кликнуть).
 */
export function isInteractive({ href, onClick }) {
    return Boolean(href || onClick);
}
//# sourceMappingURL=isInteractive.js.map