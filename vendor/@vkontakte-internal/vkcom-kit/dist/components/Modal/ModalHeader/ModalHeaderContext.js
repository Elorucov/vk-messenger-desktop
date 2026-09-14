import { noop } from '@vkontakte/vkjs';
import { createContext, useContext } from 'react';
const ModalHeaderContext = createContext({
    registerTabs: noop,
});
export const ModalHeaderContextProvider = ModalHeaderContext.Provider;
export const useModalHeaderContext = () => useContext(ModalHeaderContext);
//# sourceMappingURL=ModalHeaderContext.js.map