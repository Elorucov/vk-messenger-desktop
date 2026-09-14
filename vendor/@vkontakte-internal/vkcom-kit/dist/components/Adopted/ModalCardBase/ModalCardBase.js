import { jsx as _jsx } from "react/jsx-runtime";
import { ModalCardBase as VKUIModalCardBase, } from '@vkontakte/vkui';
export const ModalCardBase = ({ header, headerComponent, subheader, subheaderComponent, title, titleComponent = 'h2', description, descriptionComponent = 'h5', ...restProps }) => {
    return (_jsx(VKUIModalCardBase, { title: header || title, titleComponent: headerComponent || titleComponent, description: subheader || description, descriptionComponent: subheaderComponent || descriptionComponent, ...restProps }));
};
//# sourceMappingURL=ModalCardBase.js.map