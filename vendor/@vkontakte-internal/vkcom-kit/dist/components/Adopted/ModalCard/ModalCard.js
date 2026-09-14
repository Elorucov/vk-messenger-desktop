import { jsx as _jsx } from "react/jsx-runtime";
import { ModalRootContext, ModalCard as VKUIModalCard, } from '@vkontakte/vkui';
import { useContext } from 'react';
export const ModalCard = ({ header, headerComponent, subheader, subheaderComponent, title, titleComponent = 'h2', description, descriptionComponent = 'h5', id, nav, onClosed: onClosedProp, ...restProps }) => {
    const { onClosed: onClosedContext, ...restContextProps } = useContext(ModalRootContext);
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
        }, children: _jsx(VKUIModalCard, { id: id, nav: nav, title: header || title, titleComponent: headerComponent || titleComponent, description: subheader || description, descriptionComponent: subheaderComponent || descriptionComponent, ...restProps }) }));
};
//# sourceMappingURL=ModalCard.js.map