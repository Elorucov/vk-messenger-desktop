import { jsx as _jsx } from "react/jsx-runtime";
import { ModalRootContext, ModalPage as VKUIModalPage, } from '@vkontakte/vkui';
import { useContext } from 'react';
export const ModalPage = ({ id, nav, open, settlingHeight, dynamicContentHeight, onClosed: onClosedProp, ...restProps }) => {
    const { onClosed: onClosedContext, activeModal, ...restContextProps } = useContext(ModalRootContext);
    // [VKCOMKIT-1559] С v7.0.0 `dynamicContentHeight` приоритетней `settlingHeight`. В проверке ниже мы делаем
    // наоборот, т.к. в кодовой базе применяет и `dynamicContentHeight`, и `settlingHeight`. Теперь
    // нужно применять что-то одно. В `dynamicContentHeight` должен был превратится в `settlingHeight="auto"`,
    // но в рамках рефактора не стали менять API, но поведение пришлось затронуть.
    //
    // см. https://github.com/VKCOM/VKUI/pull/6759
    //
    // FIXME в кодой базе нужно удалить `dynamicContentHeight` там где это не нужно
    const resolvedDynamicContentHeightPropToLowPriority = settlingHeight !== undefined ? undefined : dynamicContentHeight;
    return (_jsx(ModalRootContext.Provider, { value: {
            ...restContextProps,
            /** {@link file://./../ModalRoot/ModalRoot.tsx} */
            onClosed(modalId) {
                if (onClosedContext) {
                    onClosedContext(modalId);
                }
                if (onClosedProp) {
                    onClosedProp();
                }
            },
            activeModal,
        }, children: _jsx(VKUIModalPage, { id: id, nav: nav, settlingHeight: settlingHeight, dynamicContentHeight: resolvedDynamicContentHeightPropToLowPriority, open: open, ...restProps }) }));
};
//# sourceMappingURL=ModalPage.js.map