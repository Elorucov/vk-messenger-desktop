import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Footnote":["Adopted",{"className":1}],"Headline":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Footnote, Headline, Title } from '../../Adopted';
import styles from './ModalTextLayout.module.css';
export function ModalTextLayout({ preheader, children, subheader, subheaderMode = 'secondary', noPadding, titleWeight = '2', 'data-testid': dataTestId, }) {
    return (_jsxs("div", { className: classNames(styles.root, !noPadding && styles.rootPadded), "data-testid": dataTestId, children: [Boolean(preheader) && _jsx(Footnote, { className: styles.preheader, children: preheader }), _jsx(Title, { level: "2", weight: titleWeight, children: children }), Boolean(subheader) && (_jsx(Headline, { level: "1", className: classNames(styles.subheader, subheaderMode === 'primary' && styles.subheaderPrimary), children: subheader }))] }));
}
//# sourceMappingURL=ModalTextLayout.js.map