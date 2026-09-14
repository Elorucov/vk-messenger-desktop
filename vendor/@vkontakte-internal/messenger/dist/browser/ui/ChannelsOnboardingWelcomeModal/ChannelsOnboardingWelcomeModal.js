import { Button } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import React from 'react';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalView } from '../../ui/ModalView/ModalView';
import './ChannelsOnboardingWelcomeModal.css';
import { ChannelsOnboardingBannerPicture } from '../../ui/ChannelsOnboarding/ChannelsOnboarding';
export const ChannelsOnboardingWelcomeModal = ({ title, subtitle, submitText, slideNumber, handleSubmit, handleSkip, handleBack, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalView, { contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, null,
            React.createElement(ModalPanel, { className: "ChannelsOnboardingWelcomeModal" },
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "ChannelsOnboardingWelcomeModal__head" },
                        React.createElement(ChannelsOnboardingBannerPicture, null)),
                    React.createElement("div", { className: "ChannelsOnboardingWelcomeModal__body" },
                        slideNumber && (React.createElement("div", { className: "ChannelsOnboardingWelcomeModal__bodySlideNumber" }, lang.use('me_n_from_c', {
                            values: {
                                num: slideNumber.current.toString(),
                                count: slideNumber.max.toString(),
                            },
                        }))),
                        React.createElement("div", { className: "ChannelsOnboardingWelcomeModal__bodyTitle" }, title),
                        React.createElement("div", { className: "ChannelsOnboardingWelcomeModal__bodyDescription" }, subtitle))),
                React.createElement(ModalFooter, null,
                    React.createElement("div", { className: "ChannelsOnboardingWelcomeModal__actions" },
                        handleSkip && (React.createElement(Button, { className: "ChannelsOnboardingWelcomeModal__action", mode: "secondary", key: "cancel", onClick: handleSkip }, lang.use('me_channels_onboarding_skip'))),
                        handleBack && (React.createElement(Button, { className: "ChannelsOnboardingWelcomeModal__action", mode: "secondary", key: "cancel", onClick: handleBack }, lang.use('me_channels_onboarding_back'))),
                        React.createElement(Button, { className: "ChannelsOnboardingWelcomeModal__action", mode: "primary", key: "submit", onClick: handleSubmit }, submitText)))))));
};
//# sourceMappingURL=ChannelsOnboardingWelcomeModal.js.map