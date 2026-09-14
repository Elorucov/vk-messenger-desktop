import React from 'react';
import * as Attach from '../../../core/model/Attach';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { useBrowserEnv } from '../../hooks/misc';
/**
 * Кнопка действия в футере канала (Подписаться, Позвонить, Связаться и т.п.)
 */
export const ChannelActionButton = ({ isEnabled, type, title, target, className, }) => {
    const { router, calls } = useBrowserEnv();
    if (!isEnabled || type === undefined) {
        return null;
    }
    /**
     * Для некоторых типов кнопки действия нужно дополнительно обработать клик
     *
     * Например, для кнопки действия, инициирующей звонок пользователю посредством ВК Звонков
     */
    const handleClick = () => {
        if (type === undefined) {
            return;
        }
        switch (type) {
            case 'call_vk':
                if (!calls || target?.userId === undefined) {
                    return;
                }
                calls.callPeer(target.userId, 'channel_action_button');
                break;
            case 'open_app':
            case 'open_group_app':
            case 'post_youla_ad':
            case 'post_youla_native':
            case 'open_url':
            case 'send_email':
            case 'call_phone':
            case 'service_booking':
                break;
            default:
                exhaustivenessCheck(type);
        }
    };
    /**
     * Информативные комментарии о каждом типе можно найти в Channel.ts->Channel->actionButton
     */
    switch (type) {
        case 'open_url':
            if (target?.isInternal === undefined || target?.url === undefined) {
                return null;
            }
            if (target.isInternal) {
                const to = router.fromExternalUrl(target.url);
                return (React.createElement(Link, { className: className, to: to }, title));
            }
            return (React.createElement(ExternalLink, { className: className, href: target.url }, title));
        case 'open_app':
            if (target?.url === undefined) {
                return null;
            }
            return (React.createElement(ExternalLink, { className: className, href: target.url }, title));
        case 'send_email':
            if (!target?.email) {
                return null;
            }
            return (React.createElement(ExternalLink, { className: className, href: `mailto:${target.email}` }, title));
        case 'call_phone':
            if (!target?.phone) {
                return null;
            }
            return (React.createElement(ExternalLink, { className: className, href: `tel:${target.phone}` }, title));
        case 'call_vk':
            return (React.createElement("button", { className: className, onClick: handleClick }, title));
        case 'open_group_app':
            if (!target?.appId) {
                return null;
            }
            return (React.createElement(Link, { className: className, to: {
                    kind: 'MiniAppModal',
                    miniAppId: Attach.resolveMiniAppId(target.appId),
                } }, title));
        case 'service_booking':
        case 'post_youla_ad':
        case 'post_youla_native':
            /** @TODO https://jira.mvk.com/browse/ME-47127 */
            return null;
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=ChannelActionButton.js.map