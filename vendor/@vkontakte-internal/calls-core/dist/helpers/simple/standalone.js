/**
 * Проверяет что находимся на продакшен лендосе звонков
 */
export function isProductionCallsStandalone() {
    const { hostname } = window.location;
    const regExVkCom = /calls\.vk\.(com|ru)/;
    return regExVkCom.test(hostname);
}
/** проверяет, что находимся на лендинге звонков */
export function isLocationCallsStandalone() {
    const { pathname } = window.location;
    return isProductionCallsStandalone() || pathname.startsWith('/calls-standalone');
}
//# sourceMappingURL=standalone.js.map