import React, { useContext } from 'react';
const SnackbarTimerContext = React.createContext(undefined);
export const SnackbarTimerProvider = SnackbarTimerContext.Provider;
export const useSnackbarTimerContext = () => {
    const context = useContext(SnackbarTimerContext);
    if (!context) {
        throw Error('SnackbarTimerProvider не добавлен в дерево Реакта!');
    }
    return context;
};
//# sourceMappingURL=SnackbarContext.js.map