import { jsx as _jsx } from "react/jsx-runtime";
/** тултипу из `vkui` для отрисовки нужен якорь-компонент с пропом `getRootRef` */
export const DivWithRootRef = ({ children, getRootRef, className }) => {
    return (_jsx("div", { ref: getRootRef, className: className, children: children }));
};
//# sourceMappingURL=DivWithRootRef.js.map