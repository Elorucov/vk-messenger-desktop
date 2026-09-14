import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"article":["global",{"className":1}],"section":["global",{"className":1}],"div":["global",{"className":2}]} */
import { useMemo } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { AppearanceProvider, getColorClass, Placeholder, Spinner, Appearance, } from '@vkontakte-internal/vkcom-kit';
import { ID_CALLS_PARTICIPANTS_BOX } from '../../constants';
import { CallSubtitles } from '../../features/callSubtitles';
export const CallGridNew = ({ participantsCount, participantsShiftCount, participnanstListLength, isFullScreen, isSubtitlesEnabled, children, containerRef, }) => {
    const classes = cx('CallGridNew', `CallGridNew--c${participantsCount}`, {
        'CallGridNew--subtitles': isSubtitlesEnabled,
    });
    const shift = useMemo(() => new Array(participantsShiftCount)
        .fill(0)
        .map((_, id) => _jsx("article", { className: "CallGridNew__item CallGridNew__item--empty" }, -id)), [participantsShiftCount]);
    const isNotEnd = participantsCount - participantsShiftCount - participnanstListLength > 0;
    return (_jsx(AppearanceProvider, { value: Appearance.DARK, children: _jsxs("section", { className: classes, id: ID_CALLS_PARTICIPANTS_BOX, ref: containerRef, children: [_jsxs("div", { className: "CallGridNew__in", "data-testid": "calls_grid_view", children: [shift, children] }), isNotEnd && (_jsx(Placeholder, { children: _jsx(Spinner, { className: getColorClass('color_icon_contrast'), size: "large" }) })), isSubtitlesEnabled && (_jsx("div", { className: "CallGridNew__subtitles", children: _jsx(CallSubtitles, { isGridView: true, isFullScreen: isFullScreen }) }))] }) }));
};
//# sourceMappingURL=CallGridNew.js.map