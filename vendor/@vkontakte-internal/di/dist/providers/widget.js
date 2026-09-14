import { jsx as _jsx } from "react/jsx-runtime";
export const createWidget = (Provider, Component) => function Widget(props) {
    return (_jsx(Provider, { ...props, children: _jsx(Component, { children: props.children }) }));
};
//# sourceMappingURL=widget.js.map