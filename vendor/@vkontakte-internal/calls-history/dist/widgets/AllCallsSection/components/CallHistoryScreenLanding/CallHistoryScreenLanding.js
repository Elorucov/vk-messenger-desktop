import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon28UserOutline, Icon28ChainOutline, Icon28ArrowUpRectangleOutline } from '@vkontakte/icons';
import { CallStatSource } from '@vkontakte-internal/calls-core';
import { OnboardingBenefit, Button, Subhead, getColorClass, Spacing, Placeholder, } from '@vkontakte-internal/vkcom-kit';
import { useLangs } from '@vkontakte-internal/plugins';
export const CallHistoryScreenLanding = ({ onCreateCallClick }) => {
    const langs = useLangs();
    return (_jsxs(Placeholder, { header: langs.getLang('calls_screen_landing_header'), action: _jsx(Button, { mode: "primary", size: "l", onClick: () => onCreateCallClick(CallStatSource.HISTORY_CREATE), children: langs.getLang('calls_current_calls_create_call_by_link') }), children: [_jsx(Subhead, { className: getColorClass('color_text_secondary'), children: langs.getLang('calls_screen_landing_subheader') }), _jsx(Spacing, { size: 12, mode: "horizontal" }), _jsx(OnboardingBenefit, { before: _jsx(Icon28UserOutline, {}), children: langs.getLang('calls_screen_landing_feature_participants') }), _jsx(OnboardingBenefit, { before: _jsx(Icon28ChainOutline, {}), children: langs.getLang('calls_screen_landing_feature_anon') }), _jsx(OnboardingBenefit, { before: _jsx(Icon28ArrowUpRectangleOutline, {}), children: langs.getLang('calls_screen_landing_feature_share') })] }));
};
//# sourceMappingURL=CallHistoryScreenLanding.js.map