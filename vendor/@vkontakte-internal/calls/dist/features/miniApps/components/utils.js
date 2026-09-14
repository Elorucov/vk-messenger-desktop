export const createMiniAppBaseHandlers = (handlers) => {
    const result = {};
    Object.keys(handlers).forEach((eventType) => {
        result[eventType] = {
            handle: handlers[eventType],
        };
    });
    return result;
};
//# sourceMappingURL=utils.js.map