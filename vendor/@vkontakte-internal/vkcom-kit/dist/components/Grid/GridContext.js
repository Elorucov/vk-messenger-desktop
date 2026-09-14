import { noop } from '@vkontakte/vkjs';
import { createContext, useContext } from 'react';
const GridContext = createContext({
    setHasHorizontalScroll: noop,
});
export const GridContextProvider = GridContext.Provider;
export const useGridContext = () => useContext(GridContext);
//# sourceMappingURL=GridContext.js.map