import { createContext, useContext } from 'react';
const ModalBoxContext = createContext({ setHeaderId() { } });
export const ModalBoxContextProvider = ModalBoxContext.Provider;
export const useModalBoxContext = () => useContext(ModalBoxContext);
//# sourceMappingURL=ModalBoxContext.js.map