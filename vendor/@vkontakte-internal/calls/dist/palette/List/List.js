import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
const List = ({ border = true, className, children, style }) => {
    const modifiers = {
        'List--border': border,
    };
    return (_jsx("ul", { className: classNames('List', modifiers, className), style: style, children: children }));
};
export default List;
//# sourceMappingURL=List.js.map