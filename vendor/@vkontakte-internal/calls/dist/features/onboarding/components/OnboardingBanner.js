import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"span":["global",{"dangerouslySetInnerHTML":1}]} */
import { useCallback } from 'react';
import { useLang } from '../../../hooks/useLang';
import { CallsBanner, useControlledState } from '../../../components/CallsBanner';
import { OnboardingFeature } from '@vkontakte-internal/calls-core';
import { Button, ButtonGroup } from '@vkontakte-internal/vkcom-kit';
import { OnboardingIcon } from './OnboardingIcon';
import { useOnboardingTranslations } from './useOnboardingTranslations';
export const OnboardingBanner = ({ featureType, onPrimaryClick, onSecondaryClick, onClose, setHtmlSubtitle, }) => {
    const { getLang } = useLang();
    const { title, subTitle, primaryBtnText, secondaryBtnText } = useOnboardingTranslations(featureType);
    const [isOpen, closeBanner] = useControlledState();
    const featuresWithIcon = [
        OnboardingFeature.WATCH_TOGETHER,
        OnboardingFeature.REACTIONS,
        OnboardingFeature.VMOJI,
    ];
    const withIcon = featuresWithIcon.includes(featureType);
    const handleClickPrimary = useCallback(() => {
        onPrimaryClick?.();
        closeBanner();
    }, [onPrimaryClick, closeBanner]);
    const handleClickSecondary = useCallback(() => {
        onSecondaryClick?.();
        closeBanner();
    }, [onSecondaryClick, closeBanner]);
    return (_jsx("div", { className: "CallsOnboardingBanner", "data-testid": "calls_onboarding_banner", children: _jsx(CallsBanner, { autoDismissDelay: false, isOpen: isOpen, header: _jsx("span", { "data-testid": "calls_onboarding_banner_header", children: title }), subheader: setHtmlSubtitle ? (_jsx("span", { dangerouslySetInnerHTML: { __html: subTitle }, "data-testid": "calls_onboarding_banner_subheader" })) : (_jsx("span", { "data-testid": "calls_onboarding_banner_subheader", children: subTitle })), onDismiss: closeBanner, onExited: onClose, mode: "image", background: _jsx("div", { className: "CallsOnboardingBanner__background" }), before: withIcon ? _jsx(OnboardingIcon, { featureType: featureType }) : undefined, asideMode: "dismiss", actions: onPrimaryClick || onSecondaryClick ? (_jsxs(ButtonGroup, { mode: "vertical", gap: "s", children: [onPrimaryClick && (_jsx(Button, { onClick: handleClickPrimary, appearance: "overlay", mode: "primary", "data-testid": "calls_onboarding_banner_try", children: primaryBtnText ?? getLang('calls_try_onboarding_button') })), onSecondaryClick && (_jsx(Button, { onClick: handleClickSecondary, appearance: "overlay", mode: "secondary", "data-testid": "calls_onboarding_banner_try", children: secondaryBtnText ?? getLang('calls_try_onboarding_button') }))] })) : null }) }));
};
//# sourceMappingURL=OnboardingBanner.js.map