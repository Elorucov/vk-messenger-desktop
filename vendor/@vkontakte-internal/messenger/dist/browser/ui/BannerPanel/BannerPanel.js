import '../../ui/BannerPanel/BannerPanel.css';
import React, { useLayoutEffect, useRef, useState, } from 'react';
import cx from 'classnames';
import { ExternalLink } from '../../ui/Link/Link';
import { Button } from '@vkontakte/vkui';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Icon16Cancel } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { useApiFetch } from '../../hooks/useApiFetch';
export const BannerPanel = ({ children, isVisible, isCompact = false, isLarge = false, onBannerClose, mode, noBottomBorder, noTransition, contentStyles, onClick, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { role: "banner", hidden: !isVisible, className: cx('BannerPanel', {
            'BannerPanel--compact': isCompact,
            'BannerPanel--large': isLarge,
            'BannerPanel--withoutBottomBorder': noBottomBorder,
            'BannerPanel--withoutTransition': noTransition,
            'BannerPanel--clickable': onClick,
        }), onClick: onClick },
        React.createElement("div", { className: cx('BannerPanel__content', `BannerPanel__content--${mode}`), style: contentStyles },
            children,
            onBannerClose && (React.createElement(BannerClose, { onCloseClick: onBannerClose.bind(this, { source: 'close' }), tooltipText: lang.use('me_convo_banner_close') })))));
};
export const BannerIcon = ({ icon, title, }) => {
    if (!icon) {
        return null;
    }
    return React.createElement("img", { className: "BannerPanel__icon", src: icon, alt: title });
};
export const BannerText = ({ children, title, isWrapping = false, isSecondary = false, onTextOverflowing, }) => {
    const textRef = useRef(null);
    useLayoutEffect(() => {
        const el = textRef.current;
        if (!el) {
            return;
        }
        onTextOverflowing(el.scrollWidth > el.clientWidth);
    }, [onTextOverflowing]);
    return (React.createElement("div", { ref: textRef, className: cx('BannerPanel__text', {
            'BannerPanel__text--wrapText': isWrapping,
        }) },
        title && React.createElement("h4", { className: "BannerPanel__textTitle" }, title),
        children && (React.createElement("span", { className: cx('BannerPanel__textContent', {
                'BannerPanel__textContent--secondary': isSecondary,
            }) }, children))));
};
export const BannerButtons = ({ buttons, styles, }) => {
    return (React.createElement("div", { className: "BannerPanel__buttons", style: styles }, buttons));
};
export const BannerButton = ({ link, mode, appearance, text, loading, handleClick, }) => {
    if (!link) {
        return (React.createElement(Button, { size: "s", mode: mode, appearance: appearance, onClick: handleClick, loading: loading }, text));
    }
    return (React.createElement(ExternalLink, { onClick: handleClick, href: link },
        React.createElement(Button, { mode: mode, appearance: appearance, loading: loading }, text)));
};
export const BannerButtonTypeCallback = ({ peerId, callbackData, closeBanner, ...props }) => {
    const apiFetch = useApiFetch();
    const [isLoading, setIsLoading] = useState(false);
    const handleClick = async () => {
        try {
            setIsLoading(true);
            const response = await apiFetch('messages.conversationBarCallback', {
                peer_id: peerId,
                callback_data: callbackData,
            });
            if (response === 1) {
                closeBanner?.({ source: 'action' });
            }
        }
        finally {
            setIsLoading(false);
        }
        props.handleClick();
    };
    return (React.createElement(BannerButton, { ...props, loading: isLoading, handleClick: handleClick }));
};
export const BannerClose = ({ tooltipText, onCloseClick, }) => {
    return (React.createElement(Tooltip, { position: "top", content: tooltipText },
        React.createElement("button", { className: "BannerPanel__close", onClick: onCloseClick, "aria-label": tooltipText },
            React.createElement(Icon16Cancel, null))));
};
//# sourceMappingURL=BannerPanel.js.map