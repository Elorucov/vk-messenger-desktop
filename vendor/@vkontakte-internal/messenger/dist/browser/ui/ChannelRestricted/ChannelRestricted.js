import React from 'react';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import { IconIllustrationPlaceholderDeletedProfile64h } from '@vkontakte-internal/icons-private';
import { ExternalLink } from '../../ui/Link/Link';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
import { RestrictedChannelHeader } from '../../ui/ChannelHeader/ChannelHeader';
import { useBrowserEnv } from '../../hooks/misc';
import './ChannelRestricted.css';
export const ChannelRestricted = ({ channel }) => {
    const { lang } = useBrowserEnv();
    const { themeAppearance, themeBackground } = useCurrentThemeStyle({});
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    return (React.createElement("div", { className: "ChannelRestricted", style: {
            ...themeAppearanceStyles,
        } },
        themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
        React.createElement(RestrictedChannelHeader, { className: "ChannelRestricted__header" }),
        React.createElement("div", { className: "ChannelRestricted__main" },
            React.createElement("div", { className: "ChannelRestricted__content" },
                React.createElement("div", { className: "ChannelRestricted__icon" },
                    React.createElement(IconIllustrationPlaceholderDeletedProfile64h, { width: 48, height: 48 })),
                React.createElement("div", { className: "ChannelRestricted__title" }, lang.use('me_channels_blocked_title_text')),
                channel.message && (React.createElement("div", { className: "ChannelRestricted__message" }, channel.message.map((chunk, i) => {
                    switch (chunk.kind) {
                        case 'Text':
                        case 'Emoji':
                            return React.createElement(React.Fragment, { key: i }, chunk.text);
                        case 'Code':
                            return React.createElement(CodeBlock, { code: chunk, key: i });
                        case 'MassMention':
                        case 'ScreenNameMention':
                        case 'Mention':
                            return (React.createElement(React.Fragment, { key: i }, chunk.displayName));
                        case 'Email':
                            return (React.createElement(ExternalLink, { key: i, href: `mailto:${chunk.email}`, className: "ChannelProfile__descriptionLink" }, chunk.email));
                        case 'Url':
                            return (React.createElement(ExternalLink, { key: i, href: chunk.href, className: "ChannelProfile__descriptionLink" }, chunk.caption));
                        case 'Hashtag':
                            return React.createElement(React.Fragment, { key: i }, chunk.tag);
                        case 'HashtagMention':
                            return (React.createElement(React.Fragment, { key: i },
                                chunk.tag,
                                "@",
                                chunk.screenName));
                        case 'LineBreak':
                            return React.createElement("br", { key: i });
                        default:
                            return exhaustivenessCheck(chunk);
                    }
                })))))));
};
//# sourceMappingURL=ChannelRestricted.js.map