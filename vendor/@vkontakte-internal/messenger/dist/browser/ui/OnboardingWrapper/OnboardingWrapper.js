import React from 'react';
import { OnboardingTooltip, OnboardingBanner, OnboardingFullscreen, OnboardingHighlighter, } from '@vkontakte-internal/onboarding-sdk';
import { useBrowserEnv } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
export const OnboardingWrapper = (props) => {
    const { campaignName, screen, ...rest } = props;
    const { vkcom_me } = useBrowserEnv();
    const isAllowed = !!(vkcom_me?.allowedOnboardingScreens &&
        screen &&
        vkcom_me.allowedOnboardingScreens[screen]?.find((item) => item === campaignName));
    if (!rest.shown || !isAllowed) {
        return props.children;
    }
    function renderOnboardingComponent() {
        switch (rest.type) {
            case 'tooltip': {
                const { type: _type, children, ...otherProps } = rest;
                return (React.createElement(OnboardingTooltip, { campaignName: campaignName, screen: screen, ...otherProps }, children));
            }
            case 'banner': {
                const { type: _type, children, ...otherProps } = rest;
                return (React.createElement(OnboardingBanner, { campaignName: campaignName, screen: screen, ...otherProps }, children));
            }
            case 'fullscreen': {
                const { type: _type, children, ...otherProps } = rest;
                return (React.createElement(OnboardingFullscreen, { campaignName: campaignName, screen: screen, ...otherProps }, children));
            }
            case 'highlighter': {
                const { type: _type, children, ...otherProps } = rest;
                return (React.createElement(OnboardingHighlighter, { campaignName: campaignName, screen: screen, ...otherProps }, children));
            }
            default: {
                const { type: _type } = rest;
                exhaustivenessCheck(_type);
            }
        }
    }
    return renderOnboardingComponent();
};
//# sourceMappingURL=OnboardingWrapper.js.map