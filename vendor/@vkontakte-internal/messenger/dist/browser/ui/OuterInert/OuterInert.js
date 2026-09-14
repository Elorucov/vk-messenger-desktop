import '../../ui/OuterInert/OuterInert.css';
import React, { useRef, useEffect } from 'react';
import cx from 'classnames';
import { useInertAttr } from '../../hooks/useInertAttr';
import { useLayer } from '../../ui/Layer/Layer';
/**
 * При маунте добавляет атрибут `inert` / `aria-disabled` к элементам, которые
 * не входят в белый список или которые находятся на другом UI-слое. При
 * анмаунте возвращает всё в прежнее состояние.
 *
 * @see {@link useInertAttr}
 */
export const OuterInert = ({ whitelist, onActivation, onDeactivation, className, style, children, ...inertAttrOptions }) => {
    const $ref = useRef(null);
    const layer = useLayer();
    const { apply, remove } = useInertAttr(inertAttrOptions);
    useEffect(() => {
        const target = Array.isArray(whitelist) ? [...whitelist] : [];
        // Добавляем текущий UI-слой в белый список.
        void target.push(layer ? layer : $ref);
        apply(target);
        onActivation?.();
        return () => {
            remove();
            onDeactivation?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (layer)
        return React.createElement(React.Fragment, null, children);
    return (React.createElement("div", { ref: $ref, role: "presentation", className: cx('OuterInert', className), style: style }, children));
};
//# sourceMappingURL=OuterInert.js.map