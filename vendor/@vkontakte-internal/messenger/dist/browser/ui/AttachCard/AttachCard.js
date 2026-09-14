import '../../ui/AttachCard/AttachCard.css';
import React from 'react';
import { Link, ExternalLink } from '../../ui/Link/Link';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import cx from 'classnames';
import { getCallJoinHash, getChatJoinHash, isSferumCallInviteLink, isSferumChatInviteLink, } from '../../../core/utils/links';
import { useRouter } from '../../ui/Router/Router';
/**
 * Универсальный компонент для отображения некоторых видов аттачей:
 * ссылок, наборов стикеров, товаров, плейлистов, статей, денежных переводов, ссылок на беседы
 */
export const AttachCard = ({ href, attach, picture, title, subtitle, alt, isInBubble, isOut, picturePlaceholder, className, }) => {
    const { calls, router, isEduAvailable } = useBrowserEnv();
    const { navigate } = useRouter();
    const { vkm_router_modal_unification } = useFeatureFlags();
    const content = (React.createElement(AttachmentCell, { isInBubble: isInBubble, isOut: isOut, alt: alt, image: picture || picturePlaceholder, title: title, subtitle: subtitle }));
    const route = attach
        ? {
            kind: 'AttachProxyRoute',
            attach,
            fallbackUrl: href || undefined,
        }
        : null;
    const convoRoute = router.screenRoute.kind === 'ConvoRoute' ? router.screenRoute : null;
    if (href && route && convoRoute && router.toUrl(route)) {
        const callJoinHash = calls && getCallJoinHash(href, isEduAvailable);
        const chatJoinHash = getChatJoinHash(href, isEduAvailable);
        if (callJoinHash || chatJoinHash) {
            return (React.createElement(ExternalLink, { href: href, onClick: (e) => {
                    e.preventDefault();
                    if (vkm_router_modal_unification) {
                        if (chatJoinHash) {
                            navigate({ kind: 'ChatInviteModal', hash: chatJoinHash });
                            return;
                        }
                        if (callJoinHash) {
                            navigate({ kind: 'CallJoinByIdModal', callId: callJoinHash });
                            return;
                        }
                    }
                    router.push({
                        ...convoRoute,
                        chatJoinHash,
                        callJoinHash,
                    });
                }, className: "AttachCard" }, content));
        }
        /**
         * Если это всё же ссылка на чат или звонок Сферума, но её нельзя открыть потому что это vk.com где нет Сферума, то
         * открываем такую ссылку в новой вкладке
         *
         * @see https://jira.mvk.com/browse/ME-62719
         */
        if (isSferumChatInviteLink(href) || isSferumCallInviteLink(href)) {
            return (React.createElement(ExternalLink, { href: href, className: cx(className, 'AttachCard') }, content));
        }
    }
    if (route) {
        return (React.createElement(Link, { to: route, className: cx(className, 'AttachCard') }, content));
    }
    return href ? (React.createElement(ExternalLink, { href: href, className: cx(className, 'AttachCard') }, content)) : (React.createElement("span", { className: "AttachCard" }, content));
};
export function getExpectedAttachPhotoWidth() {
    const size = 40;
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    return size * pixelRatio;
}
//# sourceMappingURL=AttachCard.js.map