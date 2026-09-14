import './SferumOffboardingModal.css';
import React, { useCallback, useEffect } from 'react';
import { Text } from '@vkontakte/vkui';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Button, ButtonLayout, ModalBody, Title, } from '@vkontakte-internal/vkcom-kit';
import { AssetImg } from '../../ui/AssetImg/AssetImg';
import { Icon16CheckOutline } from '@vkontakte/icons';
export const SferumOffboardingModal = React.memo(function SferumOffboarding({ banner, onClose }) {
    const { lang, stats } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const renderContent = useCallback(() => {
        const items = [];
        banner.content.forEach((item) => {
            if (item.kind === 'text') {
                switch (item.style) {
                    case 'title':
                        items.push(React.createElement(Title, { key: item.text, level: "2" }, item.text));
                        break;
                    case 'note':
                        items.push(React.createElement("div", { key: item.text, className: "SferumOffboardingModal__note" }, item.text));
                        break;
                    case 'subtitle':
                        items.push(React.createElement("div", { key: item.text, className: "SferumOffboardingModal__subtitle" }, item.text));
                        break;
                    case 'bullet_point':
                        items.push(React.createElement("div", { key: item.text, className: "SferumOffboardingModal__bullet" },
                            React.createElement(Icon16CheckOutline, null),
                            React.createElement(Text, { className: "SferumOffboardingModal__bulletText" }, item.text)));
                        break;
                    default:
                        break;
                }
            }
        });
        return items;
    }, [banner]);
    const renderButtons = useCallback(() => {
        const items = banner.content
            .filter((item) => item.kind === 'button')
            .map((item) => (React.createElement(Button, { key: item.text, mode: item.style === 'primary' ? 'primary' : 'tertiary', className: item.style === 'primary'
                ? 'SferumOffboardingModal__button'
                : undefined, href: item.link, target: "_blank", size: isMobileLayout ? 'm' : 'l', onClick: () => stats.logEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_im_conversations_banner_item',
                    type_im_conversations_banner_item: {
                        event_type: 'click',
                        banner_name: banner.entrypoint,
                    },
                },
            }) }, item.text)));
        if (!items.length) {
            return null;
        }
        return React.createElement(ButtonLayout, { mode: "vertical" }, items);
    }, [banner, isMobileLayout, stats]);
    useEffect(() => {
        stats.logEvent({
            type: 'type_view',
            screen: 'other',
            type_view: {
                item: {
                    type: 'banner',
                },
                position: 0,
                start_view: '',
                end_view: '',
                type: 'type_im_conversations_banner_view',
                type_im_conversations_banner_view: {
                    banner_name: banner.entrypoint,
                },
            },
        });
    }, [banner.entrypoint, stats]);
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), headerClass: cx(!isMobileLayout && 'SferumOffboardingModal__headerReset'), panelClass: cx('SferumOffboardingModal__panel', !isMobileLayout && 'SferumOffboardingModal__panelDesktop'), withCustomLayout: true, contextClass: "MEConfig" },
        React.createElement(ModalBody, { insetLevel: 1 },
            React.createElement("div", { className: "SferumOffboardingModal__illustration" },
                React.createElement(AssetImg, { width: 75, height: 75, fileName: "static/png/drawable-xxhdpi/logo_max_x_sferum_80.png" })),
            React.createElement("div", { className: "SferumOffboardingModal__content" }, renderContent()),
            renderButtons())));
});
//# sourceMappingURL=SferumOffboardingModal.js.map