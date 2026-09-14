import React from 'react';
import { Button, ButtonLayout, Headline, Spacing, ModalMedia, ModalBox, ModalBody, ModalTextLayout, ModalDismissButton, Title, } from '@vkontakte-internal/vkcom-kit';
import { IconIllustrationExceedingLimit120h } from '@vkontakte-internal/icons-private';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import '../../ui/FeaturesDisabledBanner/FeaturesDisabledBanner.css';
export const FeaturesDisabledBannerModal = (props) => {
    const { text, title, buttonText, closeModal } = props;
    return (React.createElement(ModalView, null,
        React.createElement(ModalBackdrop, { onClick: closeModal },
            React.createElement(ModalPanel, null,
                React.createElement(ModalBox, { width: 420 },
                    React.createElement(ModalDismissButton, { onClick: closeModal }),
                    React.createElement(ModalMedia, { type: "image" },
                        React.createElement(IconIllustrationExceedingLimit120h, null)),
                    React.createElement(ModalBody, { insetLevel: 1 },
                        React.createElement(ModalTextLayout, null,
                            React.createElement(Title, { level: "2" }, title),
                            React.createElement(Spacing, { size: 8 }),
                            React.createElement(Headline, { className: "FeaturesDisabledBannerModal__text" }, text)),
                        React.createElement(Spacing, { size: 24 }),
                        React.createElement(ButtonLayout, null,
                            React.createElement(Button, { onClick: closeModal },
                                React.createElement(Headline, { level: "2" }, buttonText)))))))));
};
//# sourceMappingURL=FeaturesDisabledBannerModal.js.map