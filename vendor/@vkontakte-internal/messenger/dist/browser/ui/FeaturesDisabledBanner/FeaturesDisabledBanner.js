import React, { useState } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { Button, ButtonGroup, Headline, Subhead, Text, Spacing, } from '@vkontakte-internal/vkcom-kit';
import { Icon28SpeedometerMaxOutline } from '@vkontakte/icons';
import { FeaturesDisabledBannerModal } from '../../ui/FeaturesDisabledBanner/FeaturesDisabledBannerModal';
import '../../ui/FeaturesDisabledBanner/FeaturesDisabledBanner.css';
export const FeaturesDisabledBanner = (props) => {
    const { bannerInfo, isModalExist = false, className } = props;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const bannerPopupInfo = bannerInfo.button?.popup ?? null;
    const closeModal = () => {
        setIsModalVisible(false);
    };
    const openModal = () => {
        setIsModalVisible(true);
    };
    return (React.createElement("div", { className: cx('FeaturesDisabledBanner', className) },
        React.createElement(Icon28SpeedometerMaxOutline, { className: "FeaturesDisabledBanner__icon" }),
        React.createElement("div", { className: "FeaturesDisabledBanner__wrapper" },
            React.createElement(Headline, null, bannerInfo.title),
            React.createElement(Text, { className: "FeaturesDisabledBanner__text" }, bannerInfo.text),
            isModalExist && !!bannerPopupInfo && (React.createElement(React.Fragment, null,
                React.createElement(Spacing, { size: 16 }),
                React.createElement(ButtonGroup, { mode: "horizontal" },
                    React.createElement(Button, { mode: "link", onClick: openModal },
                        React.createElement(Subhead, { weight: "2" }, bannerInfo.button?.text))))),
            isModalExist && !!bannerPopupInfo && isModalVisible && (React.createElement(FeaturesDisabledBannerModal, { title: bannerPopupInfo.title, text: bannerPopupInfo.text, buttonText: bannerPopupInfo.buttonText, closeModal: closeModal })))));
};
//# sourceMappingURL=FeaturesDisabledBanner.js.map