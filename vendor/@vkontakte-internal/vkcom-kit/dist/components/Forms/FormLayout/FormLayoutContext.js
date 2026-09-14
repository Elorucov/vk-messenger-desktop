import { createContext, useContext } from 'react';
const FormLayoutContext = createContext({});
export function useFormLayoutContext() {
    return useContext(FormLayoutContext);
}
export const FormLayoutContextProvider = FormLayoutContext.Provider;
//# sourceMappingURL=FormLayoutContext.js.map