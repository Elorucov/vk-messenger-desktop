import React from 'react';
import { Icon24ChevronRight } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import './ChannelsOnboardingBanner.css';
import cx from 'classnames';
export const ChannelsOnboardingBanner = ({ onClick, className, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx('ChannelsOnboardingBanner', className), onClick: onClick },
        React.createElement("div", { className: "ChannelsOnboardingBanner__text" }, lang.use('me_channels_onboarding_banner_text')),
        React.createElement("div", { className: "ChannelsOnboardingBanner__action" },
            React.createElement("button", { className: "ChannelsOnboardingBanner__actionButton" },
                React.createElement("span", { className: "ChannelsOnboardingBanner__actionText" }, lang.use('me_channels_onboarding_banner_action')),
                React.createElement(Icon24ChevronRight, { className: "ChannelsOnboardingBanner__actionIcon" })))));
};
//# sourceMappingURL=ChannelsOnboardingBanner.js.map