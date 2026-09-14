import '../../ui/FieldGroup/FieldGroup.css';
import React, { useId } from 'react';
import { Group, Header, SimpleCell } from '@vkontakte/vkui';
export const FieldGroup = ({ title, titleId, aside, children, }) => {
    const id = useId();
    return (React.createElement(Group, { "aria-labelledby": id, className: "FieldGroup", mode: "card", padding: "m", header: title ? (React.createElement(Header, { id: titleId, size: "s", after: aside }, title)) : null }, children));
};
export const FieldGroupItem = ({ children, hasHover = false, hasActive = false, multiline = true, ...rest }) => {
    return (React.createElement(SimpleCell, { ...rest, hasHover: hasHover, hasActive: hasActive, multiline: multiline }, children));
};
//# sourceMappingURL=FieldGroup.js.map