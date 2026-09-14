import '../../ui/ChannelPostDonutPlaceholder/ChannelPostDonutPlaceholder.css';
import React from 'react';
import cx from 'classnames';
import * as Post from '../../../core/model/Post';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { Icon16StarCircleFillYellow, Icon48DonateOutline, } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { useRouter } from '../../ui/Router/Router';
export const ChannelPostDonutPlaceholder = ({ paywall, placeholder, className }) => {
    const featureFlags = useFeatureFlags();
    if (featureFlags.vkm_channel_donut_redesign && paywall) {
        return (React.createElement(ChannelPostDonutPlaceholderNew, { paywall: paywall, className: className }));
    }
    return React.createElement(ChannelPostDonutPlaceholderOld, { placeholder: placeholder });
};
export const ChannelPostDonutPlaceholderNew = ({ paywall, className }) => {
    const { navigate } = useRouter();
    const url = paywall.snippet.button.action?.url;
    const photoUrl = paywall.snippet.photos?.[0]?.url;
    const vkDonutMiniappParams = Post.getVKDonutMiniappParams(paywall);
    return (React.createElement("div", { className: cx('ChannelPostDonutPlaceholderNew', {
            'ChannelPostDonutPlaceholderNew--hasPhoto': !!photoUrl,
        }, className), style: { backgroundImage: photoUrl ? `url(${photoUrl})` : undefined } },
        React.createElement("span", { className: "ChannelPostDonutPlaceholderNew__text" }, paywall.snippet.title ?? paywall.hint_text),
        url && (React.createElement(Button, { href: url, onClick: (e) => {
                /**
                 * Если можем распарсить параметры и открыть миниапп - открываем миниапп для лучшего UX
                 */
                if (vkDonutMiniappParams) {
                    e.preventDefault();
                    navigate({
                        kind: 'MiniAppModal',
                        miniAppId: vkDonutMiniappParams.miniappId,
                        hash: vkDonutMiniappParams.hash,
                    });
                }
            }, 
            /**
             * Нужно задизэйблить active/hover чтобы кнопка всегда была чёрно-белая и тематический цветовой токен не применялся
             */
            hasActive: false, hasHover: false, target: "_blank", size: "m", className: "ChannelPostDonutPlaceholderNew__actionButton", before: React.createElement(Icon16StarCircleFillYellow, null) }, paywall.snippet.button.title))));
};
export const ChannelPostDonutPlaceholderOld = ({ placeholder }) => {
    const { lang } = useBrowserEnv();
    const url = placeholder?.button?.action?.url, title = placeholder?.button?.title;
    const hasButton = !!url && !!title;
    return (React.createElement("span", { className: "ChannelPostDonutPlaceholder" },
        React.createElement(Icon48DonateOutline, { className: "ChannelPostDonutPlaceholder__icon" }),
        placeholder?.text || lang.use('me_channels_donut_post_placeholder'),
        hasButton && (React.createElement(Button, { href: url, target: "_blank" }, title))));
};
//# sourceMappingURL=ChannelPostDonutPlaceholder.js.map