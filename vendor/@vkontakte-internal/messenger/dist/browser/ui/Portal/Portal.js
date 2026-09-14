import React, { forwardRef, useEffect, useLayoutEffect, useState, } from 'react';
import ReactDOM from 'react-dom';
import { usePrevious } from '../../hooks/misc';
/**
 * Portal
 * Отправляет `children` в отдельный `div` в конце `body`.
 * При анмаунте, удаляет за собой созданный `div`
 */
export const Portal = forwardRef(function WithPortal({ children, portalClassName, portalTarget, ...props }, ref) {
    const [renderNode, setRenderNode] = useState(null);
    const prevClassName = usePrevious(portalClassName);
    /**
     * Поддерживаем актуальный класс на дом-ноде
     */
    useEffect(() => {
        if (!renderNode) {
            return;
        }
        if (prevClassName) {
            renderNode.classList.remove(...prevClassName.split(' '));
        }
        if (portalClassName) {
            renderNode.classList.add(...portalClassName.split(' '));
        }
    }, [renderNode, portalClassName, prevClassName]);
    /**
     * Не забываем удалить за собой дом-ноду при анмаунте
     */
    useLayoutEffect(() => {
        /* Ждём назначения элмента */
        if (portalTarget === null) {
            return;
        }
        const nodeEl = node(portalClassName, portalTarget);
        setRenderNode(nodeEl);
        return () => {
            nodeEl.remove();
        };
        /**
         * Не прописываем в зависимостях portalClassName,
         * потому что актуальность класса поддерживается в другом хуке
         */
    }, [portalTarget]); // eslint-disable-line react-hooks/exhaustive-deps
    if (!renderNode) {
        return null;
    }
    return ReactDOM.createPortal(React.createElement("div", { ...props, ref: ref }, children), renderNode);
});
/**
 * Создаёт div для портала
 */
function node(className, portalTarget) {
    const el = document.createElement('div');
    if (className) {
        el.classList.add(...className.split(' '));
    }
    return (portalTarget || document.body).appendChild(el);
}
//# sourceMappingURL=Portal.js.map