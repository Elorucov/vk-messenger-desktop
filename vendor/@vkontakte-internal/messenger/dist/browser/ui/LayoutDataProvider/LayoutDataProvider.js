import React, { useMemo } from 'react';
import { createContext, useContext } from 'react';
import { exhaustivenessCheck, isDev } from '../../../core/utils/misc';
const LayoutDataContext = createContext(null);
/**
 * Провайдер значения режима адаптивности:
 * колонный и двухколонный режимы
 */
export const LayoutDataProvider = ({ children, mode, }) => {
    return (React.createElement(LayoutDataContext.Provider, { value: mode }, children));
};
export function useLayoutData() {
    let layoutMode = useContext(LayoutDataContext);
    if (!layoutMode) {
        // ссыкотно, поэтому пока только в дев режиме выбрасываем ошибку
        if (isDev) {
            throw new Error('LayoutDataContext не добавлен в дерево Реакта!');
        }
        else {
            console.warn('LayoutDataContext не добавлен в дерево Реакта!');
        }
        /**
         * 'two-column' - самый проработанный и частоиспользуемый в конфигах интерфейс
         */
        layoutMode = 'two-column';
    }
    const layoutData = useMemo(() => {
        switch (layoutMode) {
            case 'one-column':
                return {
                    isMobileLayout: false,
                    isOneColumnLayout: true,
                    isTwoColumnLayout: false,
                };
            case 'two-column':
                return {
                    isMobileLayout: false,
                    isOneColumnLayout: false,
                    isTwoColumnLayout: true,
                };
            case 'mobile':
                return {
                    isMobileLayout: true,
                    isOneColumnLayout: false,
                    isTwoColumnLayout: false,
                };
            default:
                exhaustivenessCheck(layoutMode);
        }
    }, [layoutMode]);
    return layoutData;
}
//# sourceMappingURL=LayoutDataProvider.js.map