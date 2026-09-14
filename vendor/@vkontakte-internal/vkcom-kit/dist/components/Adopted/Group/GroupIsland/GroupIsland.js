import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Footnote } from '../../Typography/Typography';
import { useGroupLayoutContext } from '../GroupLayout/GroupLayoutContext';
import styles from './GroupIsland.module.css';
const paddingModifiersMap = {
    s: styles.groupPaddingS,
    m: undefined,
    none: styles.groupPaddingNone,
};
export const GroupIsland = ({ className, header, children, padding, description, noTopRounded, noBottomRounded, stretched, ...restProps }) => {
    const { padding: contextPadding, mode: groupLayout } = useGroupLayoutContext();
    const islandPadding = padding ?? contextPadding;
    return (_jsx(_Fragment, { children: _jsxs("div", { ...restProps, className: classNames(styles.group, paddingModifiersMap[islandPadding], groupLayout === 'sticked' && styles.groupSticked, noTopRounded && styles.groupNoTopRounded, noBottomRounded && styles.groupNoBottomRounded, stretched && styles.groupStretched, className), children: [header, children, !!description && _jsx(Footnote, { className: styles.description, children: description })] }) }));
};
//# sourceMappingURL=GroupIsland.js.map