import { Icon20MessageTextOutline } from '@vkontakte/icons';
import { Icon142IllustrationChannel } from '@vkontakte-internal/icons-private';
import { useBrowserEnv } from '../../hooks/misc';
import React from 'react';
import cx from 'classnames';
import { Card, RichCell, Link } from '@vkontakte-internal/vkcom-kit';
import '../../ui/ChannelEmpty/ChannelEmpty.css';
export const ChannelEmpty = ({ isThemed }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx('ChannelEmpty', {
            'ChannelEmpty--themed': isThemed,
        }) },
        React.createElement(Icon142IllustrationChannel, null),
        React.createElement("div", { className: "ChannelEmpty__info" },
            React.createElement("span", { className: "ChannelEmpty__title" }, lang.use('me_channel_empty_title')),
            React.createElement("span", { className: "ChannelEmpty__description" }, lang.use('me_channel_empty_description'))),
        React.createElement(Card, null,
            React.createElement(RichCell, { extraSubtitle: React.createElement(React.Fragment, null,
                    React.createElement("p", null, lang.use('me_channel_empty_first_post_promotion')),
                    React.createElement("br", null),
                    React.createElement(Link, { target: "_blank", href: "https://vk.cc/channel_post" }, lang.use('me_channel_empty_how_does_create_good_post'))), multiline: true, before: React.createElement(Icon20MessageTextOutline, { color: "var(--vkui--color_icon_secondary)" }) }, lang.use('me_channel_empty_first_post_is_important')))));
};
//# sourceMappingURL=ChannelEmpty.js.map