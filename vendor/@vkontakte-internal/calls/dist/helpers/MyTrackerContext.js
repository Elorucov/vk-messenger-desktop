import { createContext } from 'react';
import { IS_INCOMPLETE_CONTEXT_KEY } from '@vkontakte-internal/calls-core';
const throwError = (name) => {
    throw new Error(`The function "${name}" wasn't set in MyTrackerContext`);
};
export const MyTrackerContext = createContext({
    [IS_INCOMPLETE_CONTEXT_KEY]: true,
    getScreenTimespentCollector: () => throwError('getScreenTimespentCollector'),
    getServiceTimespentCollector: () => throwError('getServiceTimespentCollector'),
    tmrSendTimespentEvent: () => throwError('tmrSendTimespentEvent'),
});
//# sourceMappingURL=MyTrackerContext.js.map