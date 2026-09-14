import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { rootContainer } from '../container';
const ContainerContext = createContext(rootContainer);
export const useContainer = () => useContext(ContainerContext);
/**
 * Провайдер для предоставления доступа к DI контейнеру
 * */
export const DIProvider = ({ instance = rootContainer, children, }) => {
    return _jsx(ContainerContext.Provider, { value: instance, children: children });
};
/**
 * Провайдер предоставляет простой способ создать дочерний DI контейнер
 * и предоставить его всей нижележащей иерархии виджетов
 * */
export const ChildDIProvider = ({ children, name, isolated }) => {
    const di = useContainer() || rootContainer;
    const childContainerName = getChildContainerName(di, name);
    const [childDi] = useState(() => di.child(childContainerName, isolated));
    useEffect(() => () => {
        childDi.destroy();
    }, []);
    return _jsx(DIProvider, { instance: childDi, children: children });
};
function getChildContainerName(di, name) {
    return di.childrenExists(name) ? `${name}-${getRandomNumber()}` : name;
}
function getRandomNumber() {
    return Math.floor(Math.random() * 100000);
}
//# sourceMappingURL=container.js.map