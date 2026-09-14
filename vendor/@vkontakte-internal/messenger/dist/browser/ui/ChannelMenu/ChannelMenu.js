import React from 'react';
import './ChannelMenu.css';
import { ExternalLink } from '../../ui/Link/Link';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon28PictureOutline } from '@vkontakte/icons';
import { HorizontalScroll } from '../../ui/HorizontalScroll/HorizontalScroll';
import { IRouter } from '../../../data/env/IRouter';
import { useRouter } from '../../ui/Router/Router';
export const ChannelMenu = ({ items }) => {
    const { router } = useBrowserEnv();
    const { navigate } = useRouter();
    const itemCssWidth = 135;
    const itemCssHeight = 92;
    const onClick = async (event, url) => {
        const route = router.fromExternalUrl(url);
        const to = IRouter.isProxyRoute(route)
            ? router.fromProxyRoute(route)
            : route;
        // Просто откроем ссылку
        if (!to || to.kind === 'NotFoundRoute') {
            return;
        }
        // Откроем внутренний роут
        event?.preventDefault();
        event?.stopPropagation();
        navigate(to);
    };
    return (React.createElement("div", { className: "ChannelMenu" },
        React.createElement(HorizontalScroll, { showArrows: true, arrowSize: "s", arrowsTopOffset: -26, arrowScrollStep: itemCssWidth },
            React.createElement("div", { className: "ChannelMenu__items" }, items.map((item, i) => {
                const preferredWidth = itemCssWidth * window.devicePixelRatio;
                const preferredHeight = itemCssHeight * window.devicePixelRatio;
                const image = item.cover &&
                    (item.cover.find((img) => img.width >= preferredWidth &&
                        img.height >= preferredHeight) || item.cover[item.cover.length - 1])?.url;
                return (React.createElement(ExternalLink, { key: i, href: item.url, onClick: (e) => onClick(e, item.url), className: "ChannelMenu__item ChannelMenuItem" },
                    React.createElement("div", { className: "ChannelMenuItem__imageWrapper" },
                        React.createElement("div", { className: "ChannelMenuItem__imageStub" },
                            React.createElement(Icon28PictureOutline, null)),
                        image && (React.createElement("img", { className: "ChannelMenuItem__image", src: image, alt: item.title }))),
                    React.createElement("span", { className: "ChannelMenuItem__title" }, item.title)));
            })))));
};
//# sourceMappingURL=ChannelMenu.js.map