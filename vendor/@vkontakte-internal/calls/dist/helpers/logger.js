import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
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
export const handlePromiseError = (...args) => {
    debugMessage(DebugMessageType.ERROR, ...args);
};
//# sourceMappingURL=logger.js.map