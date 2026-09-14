import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Subhead, Title } from '../../Adopted';
import { TextClamp } from '../../TextClamp/TextClamp';
import { SnippetCard } from '../SnippetCard/SnippetCard';
import styles from './EntitySnippet.module.css';
export const EntitySnippet = ({ header, caption, after, ...restProps }) => {
    return (_jsx(SnippetCard, { ...restProps, children: _jsxs("div", { className: styles.container, children: [_jsxs("div", { className: styles.body, children: [_jsx(TextClamp, { TypographyComponent: Title, className: styles.header, weight: "1", level: "3", lines: 2, children: header }), Boolean(caption) && (_jsx(TextClamp, { TypographyComponent: Subhead, className: styles.caption, weight: "3", lines: 1, children: caption }))] }), after] }) }));
};
//# sourceMappingURL=EntitySnippet.js.map