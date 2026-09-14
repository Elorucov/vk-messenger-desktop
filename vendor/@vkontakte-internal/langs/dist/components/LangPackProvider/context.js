import { createContext, useContext } from 'react';
export const LangPackIdContext = createContext(undefined);
export const LangPackIdProvider = LangPackIdContext.Provider;
export function useLangPackId() {
    return useContext(LangPackIdContext);
}
//# sourceMappingURL=context.js.map