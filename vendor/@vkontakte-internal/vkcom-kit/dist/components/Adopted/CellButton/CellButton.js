import { jsx as _jsx } from "react/jsx-runtime";
import { CellButton as VKUICellButton } from '@vkontakte/vkui';
const ModeMap = {
    primary: 'accent',
    danger: 'negative',
    neutral: 'neutral',
};
export const CellButton = ({ mode, expandable, subhead, appearance, chevron, overTitle, ...restProps }) => {
    return (_jsx(VKUICellButton, { appearance: (mode && ModeMap[mode]) || appearance, overTitle: subhead || overTitle, chevron: expandable || chevron, ...restProps }));
};
//# sourceMappingURL=CellButton.js.map