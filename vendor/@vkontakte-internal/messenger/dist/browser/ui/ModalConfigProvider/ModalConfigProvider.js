import React, { createContext, useMemo } from 'react';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const ModalConfigContext = createContext({
    isFullScreen: false,
});
export const ModalsConfigProvider = ({ children, }) => {
    const { isMobileLayout } = useLayoutData();
    const value = useMemo(() => {
        return { isFullScreen: isMobileLayout };
    }, [isMobileLayout]);
    return (React.createElement(ModalConfigContext.Provider, { value: value }, children));
};
//# sourceMappingURL=ModalConfigProvider.js.map