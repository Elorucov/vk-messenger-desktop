import { VK_RELATED_DOMAINS, SFERUM_RELATED_DOMAINS, CALL_JOIN_LINK_URL_BASE, SFERUM_DOMAIN, CHAT_INVITE_LINK_URL_BASE, VKME_CHAT_INVITE_LINK_URL_BASE, ISOLATED_CALL_JOIN_SHORTENED_LINK_URL_BASE, CALL_JOIN_SHORTENED_LINK_URL_BASE, VK_DOMAINS, VK_SHORTENING_DOMAIN, SFERUM_SHORTENING_DOMAIN, } from '../config/config';
import * as Attach from '../model/Attach';
export function prepareLink(vkDomain, link) {
    if (isMailto(link) || isTel(link)) {
        return link;
    }
    if (!link.startsWith('/') &&
        !link.startsWith('http://') &&
        !link.startsWith('https://')) {
        link = 'https://' + link;
    }
    if (isInternalLink(vkDomain, link)) {
        return link;
    }
    return wrapAway(vkDomain, link);
}
/**
 * С появлением возможности форматирования текста наткнулись на угрозу фишинга
 * из-за того, что любую ссылку можно спрятать под текст, и юзер при клике не будет знать,
 * куда переходит. Поэтому проверяем, ведёт ли ссылка на внешний источник,
 * и при положительном ответе отображаем модалку с предупреждением
 */
export function checkLeadsOut(vkDomain, link, externalWhitelist) {
    if (isMailto(link) || isTel(link)) {
        return false;
    }
    if (!link.startsWith('/') &&
        !link.startsWith('http://') &&
        !link.startsWith('https://')) {
        link = 'https://' + link;
    }
    try {
        const { hostname, pathname } = new URL(link);
        const baseDomain = VK_DOMAINS.some((domain) => domain === hostname || hostname.endsWith('.' + domain));
        if (baseDomain && pathname === '/away.php') {
            return true;
        }
        if (hostname === VK_SHORTENING_DOMAIN ||
            hostname === SFERUM_SHORTENING_DOMAIN) {
            return true;
        }
        const internalDomains = [
            vkDomain,
            ...VK_RELATED_DOMAINS,
            ...SFERUM_RELATED_DOMAINS,
        ];
        if (externalWhitelist) {
            internalDomains.push(...externalWhitelist);
        }
        return !internalDomains.some((domain) => {
            return hostname === domain || hostname.endsWith('.' + domain);
        });
    }
    catch (err) {
        return true;
    }
}
function wrapAway(vkDomain, link) {
    return `https://${vkDomain}/away.php?to=${encodeURIComponent(link)}&utf=1`;
}
export function isInternalLink(vkDomain, link) {
    if (link.startsWith('/')) {
        return !link.startsWith('//');
    }
    try {
        const { hostname } = new URL(link);
        const internalDomains = [
            ...VK_RELATED_DOMAINS,
            vkDomain,
            ...SFERUM_RELATED_DOMAINS,
        ];
        return internalDomains.some((domain) => {
            return hostname === domain || hostname.endsWith('.' + domain);
        });
    }
    catch (err) {
        return false;
    }
}
function isMailto(link) {
    return link.startsWith('mailto:');
}
function isTel(link) {
    return link.startsWith('tel:');
}
export function isSferumCallInviteLink(url) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    }
    catch (err) {
        return false;
    }
    return (parsedUrl.hostname === SFERUM_DOMAIN &&
        parsedUrl.searchParams.has('call_link'));
}
export function isSferumCallShortenedInviteLink(url) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    }
    catch (err) {
        return false;
    }
    return (parsedUrl.hostname === SFERUM_DOMAIN && parsedUrl.searchParams.has('call'));
}
export function createSferumShortenedCallUrl(callId, password) {
    return `${ISOLATED_CALL_JOIN_SHORTENED_LINK_URL_BASE}?call=${callId}${password ? `&p=${password}` : ''}`;
}
export function createShortenedCallUrl(callId, password) {
    return `${CALL_JOIN_SHORTENED_LINK_URL_BASE}${callId}${password ? `?p=${password}` : ''}`;
}
export function getCallJoinId(url, isEduAvailable) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    }
    catch (err) {
        return;
    }
    if (isSferumCallShortenedInviteLink(url)) {
        if (isEduAvailable) {
            const id = parsedUrl.searchParams.get('call');
            const password = parsedUrl.searchParams.get('p') ?? undefined;
            if (!id) {
                return;
            }
            return {
                callJoinId: id,
                password,
            };
        }
        return;
    }
    if (parsedUrl.href.startsWith(CALL_JOIN_SHORTENED_LINK_URL_BASE)) {
        const [, id] = parsedUrl.pathname.split('/call/');
        const password = parsedUrl.searchParams.get('p') ?? undefined;
        if (!id) {
            return;
        }
        return {
            callJoinId: id,
            password,
        };
    }
    return;
}
export function getCallJoinHash(url, isEduAvailable) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    }
    catch (err) {
        return;
    }
    if (isSferumCallInviteLink(url)) {
        if (isEduAvailable) {
            return parsedUrl.searchParams.get('call_link') || undefined;
        }
        return;
    }
    if (parsedUrl.href.startsWith(CALL_JOIN_LINK_URL_BASE)) {
        const [, hash] = parsedUrl.href.split('/join/');
        return hash;
    }
    return;
}
export function isSferumChatInviteLink(url) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    }
    catch (err) {
        return false;
    }
    return (parsedUrl.hostname === SFERUM_DOMAIN &&
        parsedUrl.searchParams.get('p') === 'messages' &&
        parsedUrl.searchParams.has('join'));
}
export function getChatJoinHash(url, isEduAvailable) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    }
    catch (err) {
        return;
    }
    if (isSferumChatInviteLink(url)) {
        if (isEduAvailable) {
            return parsedUrl.searchParams.get('join') || undefined;
        }
        return;
    }
    if (parsedUrl.href.startsWith(CHAT_INVITE_LINK_URL_BASE) ||
        parsedUrl.href.startsWith(VKME_CHAT_INVITE_LINK_URL_BASE)) {
        const [, hash] = parsedUrl.href.split('/join/');
        return hash;
    }
    return;
}
const isSferumMiniAppLink = (url) => {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    }
    catch (err) {
        return false;
    }
    return (SFERUM_RELATED_DOMAINS.includes(parsedUrl.hostname) &&
        parsedUrl.searchParams.get('p') === 'miniapp');
};
export function getSferumMiniAppParams(url) {
    try {
        const parsedUrl = new URL(url);
        if (isSferumMiniAppLink(url)) {
            const idFromParams = parsedUrl.searchParams.get('id');
            const hash = parsedUrl.searchParams.get('hash') ||
                parsedUrl.hash.substring(1) ||
                undefined;
            if (idFromParams) {
                const id = parseInt(idFromParams);
                if (!Number.isNaN(id)) {
                    return {
                        miniAppId: Attach.resolveMiniAppId(id),
                        hash,
                    };
                }
            }
        }
    }
    catch { }
    return;
}
//# sourceMappingURL=links.js.map