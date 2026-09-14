import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { OnboardingFeature } from '@vkontakte-internal/calls-core';
import { Icon28VmojiOutline } from '@vkontakte-internal/icons-private';
import { Icon28HandHeartOutline, Icon28LogoVkVideoOutline } from '@vkontakte/icons';
export const OnboardingIcon = ({ featureType, className }) => {
    switch (featureType) {
        case OnboardingFeature.WATCH_TOGETHER: {
            return _jsx(Icon28LogoVkVideoOutline, { className: className });
        }
        case OnboardingFeature.REACTIONS: {
            return _jsx(Icon28HandHeartOutline, { className: className });
        }
        case OnboardingFeature.VMOJI: {
            return _jsx(Icon28VmojiOutline, { className: className });
        }
        default: {
            return _jsx(_Fragment, {});
        }
    }
};
//# sourceMappingURL=OnboardingIcon.js.map