import { jsx as _jsx } from "react/jsx-runtime";
import { Header } from '@vkontakte-internal/vkcom-kit';
export const SausageListHeader = ({ title, count, size, offset, isSticky, dataIndex }) => {
    const baseStyle = {
        height: size,
        zIndex: 1,
    };
    const style = isSticky
        ? {
            ...baseStyle,
            position: 'sticky',
        }
        : {
            ...baseStyle,
            position: 'absolute',
            transform: `translateY(${offset}px)`,
        };
    return (_jsx("div", { style: style, className: "CallsVoiceRoom_SausageUserListHeader", "data-index": dataIndex, children: _jsx(Header, { indicator: count, mode: "tertiary", children: title }) }));
};
//# sourceMappingURL=SausageListHeader.js.map