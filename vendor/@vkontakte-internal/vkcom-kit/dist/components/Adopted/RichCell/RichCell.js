import { jsx as _jsx } from "react/jsx-runtime";
import { RichCell as VKUIRichCell } from '@vkontakte/vkui';
export const RichCell = ({ subhead, caption, text, rightAction, overTitle, subtitle, extraSubtitle, after, afterAlign, ...restProps }) => {
    const commonProps = {
        overTitle: subhead || overTitle,
        subtitle: text || subtitle,
        extraSubtitle: caption || extraSubtitle,
        ...restProps,
    };
    if (rightAction) {
        return _jsx(VKUIRichCell, { after: rightAction, afterAlign: "center", ...commonProps });
    }
    return _jsx(VKUIRichCell, { after: after, afterAlign: afterAlign, ...commonProps });
};
//# sourceMappingURL=RichCell.js.map