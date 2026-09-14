import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"img":["global",{"className":1}]} */
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getReactionsHistoryState, getReactionsIcons } from '../../../selectors';
export const ReactionsHistoryContainer = () => {
    const iconsConfig = useTypedSelector(getReactionsIcons);
    const { total, popularReactions } = useTypedSelector(getReactionsHistoryState);
    if (!iconsConfig || !iconsConfig[24] || !total || !popularReactions.length) {
        return null;
    }
    const icons = iconsConfig[24];
    return (_jsxs("div", { className: "VoiceRoom__reactionsHistoryContainer", children: [popularReactions.map((reaction) => (
            // eslint-disable-next-line react/forbid-elements
            _jsx("img", { className: "VoiceRoom__reactionsHistoryImg", src: icons[reaction], alt: reaction }, reaction))), _jsx("div", { className: "VoiceRoom__reactionsHistoryCounter", children: total })] }));
};
//# sourceMappingURL=ReactionsHistoryContainer.js.map