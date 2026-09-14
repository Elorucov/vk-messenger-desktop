import { jsx as _jsx } from "react/jsx-runtime";
/**
 * иконка "уголок", для расположения в углу контейнера, в котором
 * пользователь видит опции по фонам. Сделан для того, чтобы можно было
 * сделать а-ля `border-top-right-radius` поведение, не задевая при этом сроллбар
 *
 * @see https://www.figma.com/file/OL0LuM1PbyTniF3X3V29HW/Calls-%C2%B7-Core?node-id=19070%3A284346
 */
export const BorderCornerIcon = ({ className }) => {
    return (_jsx("svg", { className: className, width: "4", height: "4", viewBox: "0 0 4 4", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M4 4V0H0C2.20898 0 4 1.79077 4 4Z", fill: "white" }) }));
};
//# sourceMappingURL=BorderCornerIcon.js.map