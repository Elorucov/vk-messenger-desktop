import { createContext, useContext } from 'react';
export const HelpHintsContext = createContext({});
export function useHelpHints() {
    return useContext(HelpHintsContext);
}
//# sourceMappingURL=helpHints.js.map