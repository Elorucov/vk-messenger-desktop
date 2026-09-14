import { isValidElement, cloneElement, useEffect, } from 'react';
import { useExternRef } from './useExternRef';
const isDOMTypeElement = (element) => {
    return typeof element.type === 'string';
};
/**
 * Взято из VKUI (в 4-й версии библиотеки нет импорта этого хука)
 */
export const usePatchChildrenRef = (children) => {
    const childRef = isValidElement(children) &&
        (isDOMTypeElement(children) ? children.ref : children.props.getRootRef);
    const patchedRef = useExternRef(childRef);
    useEffect(() => {
        if (!patchedRef.current) {
            console.error('Кажется, в children передан компонент, который не поддерживает свойство getRootRef. Мы не можем получить ссылку на корневой dom-элемент этого компонента');
        }
    }, [children?.type, patchedRef]);
    return [
        patchedRef,
        isValidElement(children)
            ? cloneElement(children, {
                [isDOMTypeElement(children) ? 'ref' : 'getRootRef']: patchedRef,
            })
            : children,
    ];
};
//# sourceMappingURL=usePatchChildrenRef.js.map