import { jsx as _jsx } from "react/jsx-runtime";
// eslint-disable-next-line no-restricted-imports
import { observer } from 'mobx-react-lite';
import { Button, OnboardingBanner as OnboardingBannerComponent } from '@vkontakte-internal/vkcom-kit';
import { createWidget } from '@vkontakte-internal/di';
import { OnboardingBannerModelProvider, useOnboardingBannerModel, } from './model';
export const OnboardingBannerSDKView = observer(function OnboardingBannerSDK({ children, }) {
    const model = useOnboardingBannerModel();
    const onDismissHandler = (event) => {
        model.restProps.onDismiss?.(event);
        model.onDismiss();
    };
    if (!model.isBannerVisible)
        return null;
    return (_jsx(OnboardingBannerComponent, { ...model.restProps, action: _jsx(Button, { ...model.buttonProps }), onDismiss: onDismissHandler, onClick: model.onBannerClick, onActionClick: model.onActionClick, dismissLabel: model.restProps.dismissLabel || 'dismiss', children: children }));
});
export const OnboardingBanner = createWidget(OnboardingBannerModelProvider, OnboardingBannerSDKView);
//# sourceMappingURL=OnboardingBanner.js.map