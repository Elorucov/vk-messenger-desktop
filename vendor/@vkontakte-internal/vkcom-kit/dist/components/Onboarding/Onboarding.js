import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Title":["Adopted",{"className":1}],"Footnote":["Adopted",{"className":1}],"ButtonGroup":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { useState } from 'react';
import { Button, ButtonGroup, Footnote, Spacing, Title } from '../Adopted';
import { Bullets } from '../Bullets/Bullets';
import { LoadableMedia } from '../LoadableMedia/LoadableMedia';
import { useIsDesktop } from './hooks/useIsDesktop';
import styles from './Onboarding.module.css';
const isVideo = (media) => {
    return 'video' in media;
};
const stepModifiers = {
    24: undefined,
    80: styles.stepSpacing80,
};
export const Onboarding = ({ steps, startButtonLabel, nextButtonLabel: globalNextButtonLabel, endButtonLabel, skipButtonLabel: globalSkipButtonLabel, fixedHeight, onNextClick, onDone, onSkip, onStepChange, loadingErrorMessage, loadingErrorActionLabel, textSpacing = 8, contentSpacing = 24, formatBulletsAriaLabel, noBullets, }) => {
    const isDesktop = useIsDesktop();
    const [stepIndex, setStepIndex] = useState(0);
    if (!steps.length) {
        return null;
    }
    const isLastStep = stepIndex === steps.length - 1;
    const isFirstStep = stepIndex === 0;
    const currentStep = steps[stepIndex];
    const handleChangeStep = (step) => {
        const newStepId = steps[step]?.id;
        if (newStepId) {
            onStepChange?.(newStepId, currentStep.id);
            setStepIndex(step);
        }
    };
    const renderStepText = (step) => (_jsxs("div", { className: classNames(styles.step, stepModifiers[contentSpacing]), children: [_jsx(Title, { level: "2", className: styles.title, children: step.title }), _jsx(Spacing, { size: textSpacing }), _jsx(Footnote, { className: styles.text, children: step.text })] }, step.id));
    const renderContent = () => {
        if (!fixedHeight) {
            return _jsx("div", { className: styles.content, children: renderStepText(currentStep) });
        }
        return (_jsx("div", { className: styles.content, children: _jsx("div", { className: styles.steps, style: { width: `${steps.length * 100}%`, marginLeft: `${stepIndex * -100}%` }, children: steps.map(renderStepText) }) }));
    };
    const nextButtonLabel = (() => {
        if (currentStep.nextButtonLabel) {
            return currentStep.nextButtonLabel;
        }
        if (isLastStep && endButtonLabel) {
            return endButtonLabel;
        }
        if (isFirstStep && startButtonLabel) {
            return startButtonLabel;
        }
        return globalNextButtonLabel;
    })();
    const skipButtonLabel = currentStep.skipButtonLabel ?? globalSkipButtonLabel;
    const canSkip = Boolean(skipButtonLabel && (currentStep.skipButtonLabel || (currentStep.canSkip ?? isFirstStep)));
    const handleNext = (event) => {
        currentStep.onNextClick?.(event);
        if (!event.isPropagationStopped()) {
            onNextClick?.(currentStep.id);
        }
        if (isLastStep) {
            onDone();
            return;
        }
        handleChangeStep(stepIndex + 1);
    };
    const handleSkip = () => {
        const handler = currentStep.onSkip ?? onSkip ?? onDone;
        handler(currentStep.id);
    };
    const buttonSize = isDesktop ? 'm' : 'l';
    return (_jsxs("div", { className: classNames(styles.root, 'vkuiInternalRoundedMedia'), children: [_jsx("div", { className: styles.media, children: steps.map(({ onNextClick: _, title, ...media }, index) => {
                    const isVideoMedia = isVideo(media);
                    const isCurrent = index === stepIndex;
                    return (_jsx(LoadableMedia, { type: isVideoMedia ? 'video' : 'image', src: isVideoMedia ? media.video : media.image, loadingErrorMessage: loadingErrorMessage, loadingErrorActionLabel: loadingErrorActionLabel, ...media, "data-testid": isCurrent ? 'onboarding-media-current' : undefined, visible: isCurrent }, media.id));
                }) }), renderContent(), _jsx(Spacing, { size: 4 }), _jsxs(ButtonGroup, { mode: "vertical", gap: "s", align: "center", className: classNames(styles.buttons, isDesktop && styles.buttonsDesktop), stretched: !isDesktop, children: [nextButtonLabel && (_jsx(Button, { size: buttonSize, onClick: handleNext, stretched: true, children: nextButtonLabel })), canSkip && (_jsx(Button, { mode: "tertiary", size: buttonSize, onClick: handleSkip, stretched: true, children: skipButtonLabel })), !noBullets && steps.length > 1 && (_jsx(Bullets, { amount: steps.length, current: stepIndex, onChange: handleChangeStep, className: styles.bullets, formatAriaLabel: formatBulletsAriaLabel }))] })] }));
};
//# sourceMappingURL=Onboarding.js.map