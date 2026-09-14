import { createContext, useContext } from 'react';
export function widgetsContextCreator(widgets) {
    const context = createContext(widgets);
    const useWidgets = () => useContext(context);
    return {
        CallsWidgetsProvider: context.Provider,
        useWidgets,
    };
}
const { useWidgets: useHistoryWidgets, CallsWidgetsProvider: CallsHistoryWidgetsProvider } = widgetsContextCreator({});
export { useHistoryWidgets, CallsHistoryWidgetsProvider };
//# sourceMappingURL=CallsWidgetsProvider.js.map