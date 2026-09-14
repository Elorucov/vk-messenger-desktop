import { jsx as _jsx } from "react/jsx-runtime";
// eslint-disable-next-line no-restricted-imports
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { OnboardingTooltipModelProvider, useOnboardingTooltipModel, } from './model';
import { OnboardingMarkedTooltip } from '@vkontakte-internal/vkcom-kit';
const OnboardingTooltipSDKView = observer(function OnboardingTooltipSDK({ children, }) {
    const model = useOnboardingTooltipModel();
    const onCloseHandler = () => {
        model.onClickOutside();
        model.restProps.onClose?.();
    };
    const onMarkerClickHandler = () => {
        model.onClickMarker();
        model.restProps.onClose?.();
        model.restProps.onMarkerClick?.();
    };
    const onTooltipClickHandler = () => {
        model.onClick();
        model.restProps.onClose?.();
        model.restProps.onClick?.();
    };
    return (_jsx(OnboardingMarkedTooltip, { ...model.restProps, shown: model.isTooltipVisible, onClick: onTooltipClickHandler, onMarkerClick: onMarkerClickHandler, onClose: onCloseHandler, children: children }));
});
export const OnboardingTooltip = createWidget(OnboardingTooltipModelProvider, OnboardingTooltipSDKView);
//# sourceMappingURL=OnboardingTooltip.js.map