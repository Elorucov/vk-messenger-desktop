import { createContext, useContext } from 'react';
const DropdownActionSheetContext = createContext(null);
export const DropdownActionSheetProvider = DropdownActionSheetContext.Provider;
export const useDropdownActionSheetContext = () => {
    const context = useContext(DropdownActionSheetContext);
    if (!context) {
        throw new Error('DropdownActionSheetContext has not been passed in provider');
    }
    return context;
};
//# sourceMappingURL=DropdownActionSheetContext.js.map