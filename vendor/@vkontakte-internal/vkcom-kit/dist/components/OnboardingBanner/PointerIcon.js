import { jsx as _jsx } from "react/jsx-runtime";
import { Icon1OnboardingGraffitiArrow, Icon2OnboardingGraffitiArrow, IconOnboardingGraffitiKitten, IconOnboardingGraffitiShake, } from '@vkontakte-internal/icons-private';
import { expectNever } from '@vkontakte-internal/utils';
export const PointerIcon = ({ pattern, ...restProps }) => {
    switch (pattern) {
        case 'upward-arrow':
            return _jsx(Icon1OnboardingGraffitiArrow, { ...restProps });
        case 'downward-arrow':
            return _jsx(Icon2OnboardingGraffitiArrow, { ...restProps });
        case 'kitten':
            return _jsx(IconOnboardingGraffitiKitten, { ...restProps });
        case 'shake':
            return _jsx(IconOnboardingGraffitiShake, { ...restProps });
        default:
            return expectNever(pattern);
    }
};
//# sourceMappingURL=PointerIcon.js.map