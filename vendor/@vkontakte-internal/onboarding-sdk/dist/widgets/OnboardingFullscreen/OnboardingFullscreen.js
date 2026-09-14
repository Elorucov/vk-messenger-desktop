import { jsx as _jsx } from "react/jsx-runtime";
// eslint-disable-next-line no-restricted-imports
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { ModalPage, ModalRoot, Onboarding, SplitLayout } from '@vkontakte-internal/vkcom-kit';
import { OnboardingFullscreenModelProvider, useOnboardingFullscreenModel } from './model';
const OnboardingFullscreenSDKView = observer(function OnboardingFullscreenSDK() {
    const model = useOnboardingFullscreenModel();
    const onStepChangeHandler = (newStepId, oldStepId) => {
        model.restProps.onStepChange?.(newStepId, oldStepId);
        model.onStepChange(newStepId);
    };
    const onNextClickHandler = (id) => {
        model.restProps.onNextClick?.(id);
        model.onNextClick();
    };
    const onCloseHandler = () => {
        model.modalPageProps?.onClose?.();
        model.onClose();
    };
    const onDoneHandler = () => {
        model.restProps.onDone?.();
        model.onDone();
    };
    const onSkipHandler = (id) => {
        model.restProps.onSkip?.(id);
        model.onSkip();
    };
    const onboardingModal = (_jsx(ModalRoot, { activeModal: model.isFullscreenVisible ? 'onboardingFullscreen' : null, children: _jsx(ModalPage, { ...model.modalPageProps, id: "onboardingFullscreen", onClose: onCloseHandler, children: _jsx(Onboarding, { ...model.restProps, onStepChange: onStepChangeHandler, onNextClick: onNextClickHandler, onDone: onDoneHandler, onSkip: onSkipHandler }) }) }));
    return _jsx(SplitLayout, { modal: onboardingModal });
});
export const OnboardingFullscreen = createWidget(OnboardingFullscreenModelProvider, OnboardingFullscreenSDKView);
//# sourceMappingURL=OnboardingFullscreen.js.map