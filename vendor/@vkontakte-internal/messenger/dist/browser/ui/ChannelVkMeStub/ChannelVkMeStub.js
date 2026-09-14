import React from 'react';
import { Button } from '@vkontakte/vkui';
import { Paragraph } from '@vkontakte-internal/vkcom-kit';
import * as Viewer from '../../../core/model/Viewer';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import { IconIllustrationTransition96h } from '@vkontakte-internal/icons-private';
import { RestrictedChannelHeader } from '../../ui/ChannelHeader/ChannelHeader';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import './ChannelVkMeStub.css';
import { VKCOM_DOMAIN } from '../../../core/config/config';
import { CHANNELS_BASE_PATH } from '../../../core/model/Channel';
export const ChannelVkMeStub = () => {
    const { themeAppearance, themeBackground } = useCurrentThemeStyle({});
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    return (React.createElement("div", { className: "ChannelVkMeStub", style: {
            ...themeAppearanceStyles,
        } },
        themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
        React.createElement(RestrictedChannelHeader, { className: "ChannelVkMeStub__header" }),
        React.createElement("div", { className: "ChannelVkMeStub__main" },
            React.createElement("div", { className: "ChannelVkMeStub__content" },
                React.createElement(ChannelVkMeStubContent, null)))));
};
export const ChannelVkMeStubContent = () => {
    const { lang } = useBrowserEnv();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    return (React.createElement("div", { className: "ChannelVkMeStubContent" },
        React.createElement(IconIllustrationTransition96h, null),
        React.createElement(Paragraph, null, lang.use('me_channel_vkme_stub_text')),
        !isEdu && (React.createElement(Button, { size: "m", href: `https://${VKCOM_DOMAIN}/im${CHANNELS_BASE_PATH}`, target: "_blank" }, lang.use('me_channel_vkme_stub_button')))));
};
//# sourceMappingURL=ChannelVkMeStub.js.map