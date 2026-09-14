import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"GroupNative":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Group as GroupNative } from '@vkontakte/vkui';
import { GroupExpandedContent as ExpandedContent } from './GroupExpandedContent';
import { GroupIsland } from './GroupIsland/GroupIsland';
import { emptyGroupLayoutContext, GroupLayoutContextProvider, useGroupLayoutContext, } from './GroupLayout/GroupLayoutContext';
import { useDefaultMode } from './hooks/useDefaultMode';
// eslint-disable-next-line css-modules/no-unused-class
import styles from './Group.module.css';
const paddingModifierMap = {
    s: styles.groupPaddingS,
    m: styles.groupPaddingM,
    none: styles.groupPaddingNone,
};
function GroupComponent({ className, mode, padding, children, noTopRounded, noBottomRounded, stretched, ...restProps }) {
    const { computedMode } = useDefaultMode();
    const { isInsideGroupLayout } = useGroupLayoutContext();
    const groupMode = mode ?? computedMode;
    if (isInsideGroupLayout) {
        return (_jsx(GroupIsland, { className: className, padding: padding, noTopRounded: noTopRounded, noBottomRounded: noBottomRounded, stretched: stretched, ...restProps, children: _jsx(GroupLayoutContextProvider, { value: emptyGroupLayoutContext, children: children }) }));
    }
    return (_jsx(GroupLayoutContextProvider, { value: emptyGroupLayoutContext, children: _jsx(GroupNative, { className: classNames(styles.group, paddingModifierMap[padding ?? 'm'], groupMode === 'card' && styles.groupModeCard, groupMode === 'plain' && styles.groupModePlain, groupMode === 'card' && 'vkuiInternalGroupCard', noTopRounded && styles.noTopRounded, noBottomRounded && styles.noBottomRounded, stretched && styles.stretched, className), mode: groupMode, ...restProps, children: children }) }));
}
export const Group = Object.assign(GroupComponent, { ExpandedContent });
//# sourceMappingURL=Group.js.map