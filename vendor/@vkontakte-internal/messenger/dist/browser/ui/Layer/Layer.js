import React, { useContext, useMemo } from 'react';
import { createContext } from 'react';
import { createPortal } from 'react-dom';
const LayerContext = createContext({});
/**
 * Поставляет дочерним элементам дом-элемент/слой, в котором, например, нужно отрендерить модалки
 */
export const LayerProvider = ({ layer, children }) => {
    return (React.createElement(LayerContext.Provider, { value: useMemo(() => ({ layer }), [layer]) }, children));
};
/**
 * Компонент, который отправляет дочерние элементы в слой, взятый из провайдера
 */
export const LayerPortal = ({ children, }) => {
    const { layer } = useContext(LayerContext);
    if (!layer) {
        return null;
    }
    return React.createElement(Portal, { container: layer }, children);
};
/**
 * Хук для получения слоя, который можно передать в качестве значения для отправки на нужный слой
 */
export const useLayer = () => {
    const { layer } = useContext(LayerContext);
    return layer || undefined;
};
const Portal = ({ children, container, }) => {
    return createPortal(children, container);
};
//# sourceMappingURL=Layer.js.map