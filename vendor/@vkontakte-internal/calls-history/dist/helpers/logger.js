let bridge = null;
export function setBridgeForLogger(newBridge) {
    bridge = newBridge;
}
/**
 * хелпер для использования в промисах, логирует ошибки
 *
 * @example
 * ```
 * somePromise()
 *  .then(...)
 *  .catch(handlePromiseError)
 * ```
 */
export function handlePromiseError(...args) {
    bridge?.log('error', args);
}
//# sourceMappingURL=logger.js.map