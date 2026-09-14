import { jsx as _jsx } from "react/jsx-runtime";
// eslint-disable-next-line no-restricted-imports
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { OnboardingHighlighter as OnboardingHighlighterComponent } from '@vkontakte-internal/vkcom-kit';
import { useOnboardingHighlighterModel, OnboardingHighlighterModelProvider, } from './model';
import { useEffect, useState } from 'react';
const OnboardingHighlighterSDKView = observer(function OnboardingHighlighterSDK({ children, }) {
    const [visible, setVisible] = useState(false);
    const model = useOnboardingHighlighterModel();
    useEffect(() => {
        if (model.isHighlighterVisible)
            setVisible(true);
    }, [model.isHighlighterVisible, children]);
    const onHideHandler = () => {
        model.restProps.onHide?.();
        model.onHide();
    };
    if (!visible)
        return children;
    return (_jsx(OnboardingHighlighterComponent, { ...model.restProps, animated: true, onHide: onHideHandler, children: children }));
});
export const OnboardingHighlighter = createWidget(OnboardingHighlighterModelProvider, OnboardingHighlighterSDKView);
//# sourceMappingURL=OnboardingHighlighter.js.map