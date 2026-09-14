import { jsx as _jsx } from "react/jsx-runtime";
import { Icon56VideocamOutline } from '@vkontakte/icons';
import { InnerHTML, Placeholder, useAdaptivityMediaQueries } from '@vkontakte-internal/vkcom-kit';
import { placeholderHeightMediaQuery, placeholderWidthMediaQuery } from './constants';
import { useLang } from '../../../../hooks/useLang';
export const JoinScreenPlaceholder = ({ insidePopup }) => {
    const { getLang } = useLang();
    const showIcon = useAdaptivityMediaQueries({
        [placeholderHeightMediaQuery]: false,
        [placeholderWidthMediaQuery]: false,
    }, true);
    const icon = !insidePopup || showIcon ? _jsx(Icon56VideocamOutline, {}) : undefined;
    return (_jsx(Placeholder, { icon: icon, "data-testid": "calls_preview_cam_preview_disabled", children: _jsx(InnerHTML, { children: getLang('calls_turn_on_camera_to_see_video') }) }));
};
//# sourceMappingURL=JoinScreenPlaceholder.js.map