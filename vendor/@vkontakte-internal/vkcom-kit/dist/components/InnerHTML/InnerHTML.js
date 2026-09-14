import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @deprecated
 * При использовании этого компонента могут возникнуть проблемы безопасности,
 * для ключей переводов используйте компонент Interpolate.
 */
export function InnerHTML({ Component = 'span', children, getRootRef, ...restProps }) {
    return _jsx(Component, { ...restProps, ref: getRootRef, dangerouslySetInnerHTML: { __html: String(children) } });
}
//# sourceMappingURL=InnerHTML.js.map