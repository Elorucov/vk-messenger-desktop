import P from 'parsimmon';
import { IRouter } from '../env/IRouter';
import { createBrowserHistory, createMemoryHistory, parsePath } from 'history';
import { exhaustivenessCheck, safeDecodeURI } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
import * as Comment from '../../core/model/Comment';
import * as Folder from '../../core/model/Folder';
import * as Peer from '../../core/model/Peer';
import * as Message from '../../core/model/Message';
import * as Post from '../../core/model/Post';
import * as Space from '../../core/model/Space';
import * as Attach from '../../core/model/Attach';
import * as Tag from '../../core/model/Tag';
import { WEB_VK_ME_DOMAIN, VK_DOMAINS, SFERUM_DOMAIN, SFERUM_RELATED_DOMAINS, VKCOM_DOMAIN, } from '../../core/config/config';
import { getCallJoinHash, getCallJoinId, getChatJoinHash, getSferumMiniAppParams, prepareLink, } from '../../core/utils/links';
/**
 * Включаем отдельные типы сниппетов в Сферуме
 * @see https://jira.mvk.com/browse/ME-64522
 */
const SUPPORTED_SFERUM_SNIPPETS_TYPES = [
    'Article',
    'Link',
    'Poll',
    'MiniApp',
    'Gift',
    'Geo',
];
export class Router {
    featureFlags;
    vkDomain;
    basePath;
    withNewChannels;
    parseUtils;
    history;
    runtimeRoute = null;
    listeners = new Set();
    constructor(featureFlags, vkDomain, basePath, isMemoryHistory, globalHistory, withNewChannels) {
        this.featureFlags = featureFlags;
        this.vkDomain = vkDomain;
        this.basePath = basePath;
        this.withNewChannels = withNewChannels;
        this.parseUtils = new ParseUtils(featureFlags);
        this.push = this.push.bind(this);
        this.toUrl = this.toUrl.bind(this);
        this.fromProxyRoute = this.fromProxyRoute.bind(this);
        if (globalHistory) {
            this.history = globalHistory;
        }
        else {
            this.history = isMemoryHistory
                ? createMemoryHistory()
                : createBrowserHistory();
        }
    }
    screenRouteMemo = {
        path: '',
        route: {
            kind: 'MainRoute',
        },
    };
    get screenRoute() {
        const path = getPath(this.history.location);
        if (this.screenRouteMemo.path !== path) {
            this.screenRouteMemo.path = path;
            this.screenRouteMemo.route = this.fromUrl(path);
        }
        return this.screenRouteMemo.route;
    }
    checkIsolation = () => false;
    notifyListeners = (route, action) => {
        /**
         * Не берем переменную напрямую из замыкания, чтоб в будущем избежать зацикливания
         * в итераторе, с которым столкнулись в https://jira.mvk.com/browse/ME-38470 .
         */
        const listeners = [...this.listeners];
        listeners.forEach((listener) => listener(route, action));
    };
    handleRuntimeRouteChange = (route, action) => {
        this.runtimeRoute = route.kind === 'EmptyRuntimeRoute' ? null : route;
        // Так как RuntimeRoute не меняет урл в браузере,
        // руками уведомляем слушателей об изменениях
        this.notifyListeners({ ...this.screenRoute }, action);
    };
    handleScreenRouteChange = () => {
        this.runtimeRoute = null;
    };
    addBasePath = (path) => {
        return this.basePath ? `${this.basePath}${path === '/' ? '' : path}` : path;
    };
    removeBasePath = (path) => {
        return this.basePath
            ? path.replace(new RegExp(`^${escapeRegExp(this.basePath)}`), '')
            : path;
    };
    getStackUtils(route = this.screenRoute) {
        return new StackUtils(route);
    }
    fromEntity = (entity, action) => {
        if (IRouter.isProxyRoute(entity)) {
            const route = this.fromProxyRoute(entity);
            if (!route) {
                return {
                    route: null,
                    url: this.toUrl(entity),
                };
            }
            if (IRouter.isRuntimeRoute(route)) {
                return {
                    route,
                    url: this.toUrl(entity),
                };
            }
            return {
                route: {
                    ...route,
                    /* Не скидываем текущий органайзер */
                    organiser: this.screenRoute.organiser,
                },
                url: this.toUrl(entity) || this.toUrl(route),
            };
        }
        if (IRouter.isStackable(entity)) {
            let route;
            const utils = this.getStackUtils();
            switch (action) {
                case IRouter.Action.Push:
                    route = utils.push(entity);
                    break;
                case IRouter.Action.Replace:
                    route = utils.replace(entity);
                    break;
                case IRouter.Action.Pop:
                    route = utils.pop();
                    break;
                default:
                    exhaustivenessCheck(action);
            }
            return {
                route,
                url: this.toUrl(route),
            };
        }
        return {
            route: entity,
            url: IRouter.isRuntimeRoute(entity) ? null : this.toUrl(entity),
        };
    };
    go = (entity, action) => {
        const { route, url } = this.fromEntity(entity, action);
        if (IRouter.isRuntimeRoute(route)) {
            return this.handleRuntimeRouteChange(route, action);
        }
        if (route && url) {
            switch (action) {
                case IRouter.Action.Push:
                case IRouter.Action.Pop:
                    return this.history.push(url);
                case IRouter.Action.Replace:
                    return this.history.replace(url);
                default:
                    exhaustivenessCheck(action);
            }
        }
        if (url) {
            window.open(prepareLink(this.vkDomain, url), '_blank');
        }
    };
    /**
     * Не используем стрелочную функцию чтобы в инстансах класса роутера
     * была возможность использовать ссылку на super
     **/
    push(entity) {
        this.go(entity, IRouter.Action.Push);
    }
    replace = (entity) => {
        this.go(entity, IRouter.Action.Replace);
    };
    pop = () => {
        this.go(this.getStackUtils().pop(), IRouter.Action.Push);
    };
    subscribe = (listener) => {
        const unsub = this.history.listen(({ location }) => {
            const route = this.fromUrl(getPath(location));
            this.handleScreenRouteChange();
            listener(route);
        });
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
            unsub();
        };
    };
    fromExternalUrl = (url) => {
        const route = this.fromUrl(url);
        if (route.kind !== 'NotFoundRoute') {
            return route;
        }
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        }
        catch (err) {
            return route;
        }
        // web.vk.me/convo/123 -> ['', 'convo', '123']
        const pathNames = parsedUrl.pathname.split('/');
        const screenName = pathNames[1] || '';
        /**
         * Обработка web.vk.me ссылок
         */
        if (parsedUrl.hostname === WEB_VK_ME_DOMAIN) {
            const internalUrl = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
            const parsedRoute = this.fromUrl(internalUrl);
            switch (parsedRoute.kind) {
                case 'ChannelsFolderRoute':
                case 'ChannelRoute':
                case 'ConvoRoute':
                    return parsedRoute;
                default:
                    if (parsedRoute.modal?.length || parsedRoute.rp?.length) {
                        return {
                            ...this.screenRoute,
                            modal: parsedRoute.modal,
                            rp: parsedRoute.rp,
                            sferum: parsedRoute.sferum,
                        };
                    }
            }
        }
        /**
         * Обработка vk.com / vk.ru / vkDomain ссылок
         */
        if (VK_DOMAINS.includes(parsedUrl.hostname) ||
            parsedUrl.hostname === this.vkDomain) {
            if (screenName === 'reforged.php') {
                return route;
            }
            const wallParam = parsedUrl.searchParams.get('w') || '';
            /**
             * Ссылка такого вида ведет в список чатов сообщества, открываем как есть
             * https://vk.com/public214408998?w=chats-214408998
             */
            if (wallParam.startsWith('chats')) {
                return route;
            }
            if (wallParam.startsWith('wall') || screenName.startsWith('wall')) {
                const [channelId, postCmid, commentCmid] = parseWallParam(wallParam || screenName);
                if (channelId && !this.withNewChannels) {
                    return {
                        ...route,
                        kind: 'ChannelRoute',
                        channelId,
                        postCmid,
                        commentCmid,
                        search: parsedUrl.searchParams.get('q') || undefined,
                    };
                }
            }
            if (screenName === 'groups') {
                return {
                    kind: 'ChannelsFolderRoute',
                };
            }
            return {
                kind: 'ScreenNameProxyRoute',
                screenName,
            };
        }
        /**
         * Обработка sferum.ru и me.sferum.ru ссылок
         */
        if (SFERUM_RELATED_DOMAINS.includes(parsedUrl.hostname)) {
            const isChannel = parsedUrl.searchParams.get('p') === 'channel';
            const isChat = parsedUrl.searchParams.get('p') === 'messages';
            const isMiniApp = parsedUrl.searchParams.get('p') === 'miniapp';
            const callIdFromSferum = parsedUrl.searchParams.get('call_link');
            if (isChannel) {
                const channelIdFromSferum = parsedUrl.searchParams.get('channelId');
                const postIdFromSferum = parsedUrl.searchParams.get('postId');
                if (channelIdFromSferum) {
                    return {
                        kind: 'ChannelRoute',
                        edu: true,
                        sferum: true,
                        channelId: Channel.resolveId(parseInt(channelIdFromSferum)),
                        ...(postIdFromSferum && {
                            postCmid: Post.resolveCmid(parseInt(postIdFromSferum)),
                        }),
                    };
                }
            }
            if (isChat) {
                const joinHash = parsedUrl.searchParams.get('join');
                const rawPeerId = parsedUrl.searchParams.get('peerId');
                if (joinHash) {
                    return {
                        kind: 'MainRoute',
                        chatJoinHash: joinHash,
                    };
                }
                if (rawPeerId) {
                    return {
                        kind: 'ConvoRoute',
                        peerId: Peer.resolveId(parseInt(rawPeerId)),
                        entrypoint: 'list_all',
                        sferum: true,
                    };
                }
            }
            if (callIdFromSferum) {
                return {
                    kind: 'MainRoute',
                    callJoinHash: callIdFromSferum,
                };
            }
            if (isMiniApp) {
                const miniAppParams = getSferumMiniAppParams(parsedUrl.href);
                if (miniAppParams) {
                    return {
                        ...this.screenRoute,
                        modal: [
                            {
                                kind: 'MiniAppModal',
                                miniAppId: miniAppParams.miniAppId,
                                hash: miniAppParams.hash,
                            },
                        ],
                        sferum: true,
                    };
                }
            }
        }
        function resolveWallParts(rawChannelId, rawPostCmid, rawCommentCmid) {
            const reply = parsedUrl.searchParams.get('reply');
            let commentCmid = undefined;
            if (rawCommentCmid) {
                commentCmid = Comment.resolveCmid(parseInt(rawCommentCmid));
            }
            else if (reply) {
                commentCmid = Comment.resolveCmid(parseInt(reply));
            }
            return [
                rawChannelId ? Channel.resolveId(parseInt(rawChannelId)) : undefined,
                rawPostCmid ? Post.resolveCmid(parseInt(rawPostCmid)) : undefined,
                commentCmid,
            ];
        }
        function parseWallParam(wallParam) {
            const [rawChannelId, rawPostCmid, rawCommentCmid] = wallParam
                .slice(4)
                .split('_');
            return resolveWallParts(rawChannelId, rawPostCmid, rawCommentCmid);
        }
        return route;
    };
    fromUrl = (url) => {
        return this.parseUtils.fromUrl(this.removeBasePath(url));
    };
    toUrl(route) {
        if (IRouter.isProxyRoute(route)) {
            const fromProxy = this.fromProxyRoute(route);
            if (fromProxy) {
                if (IRouter.isRuntimeRoute(fromProxy)) {
                    return null;
                }
                return this.toUrlInternal(fromProxy);
            }
            switch (route.kind) {
                case 'AttachMediaProxyRoute':
                case 'VkProxyRoute':
                case 'StickersStoreProxyRoute':
                    return null;
                case 'AttachProxyRoute':
                    if (this.checkIsolation() &&
                        !SUPPORTED_SFERUM_SNIPPETS_TYPES.includes(route.attach.kind)) {
                        return null;
                    }
                    const link = this.parseUtils.getAttachLink(route.attach, this.vkDomain);
                    return link || route.fallbackUrl || null;
                case 'HashtagProxyRoute':
                    if (this.checkIsolation()) {
                        return null;
                    }
                    return `https://${this.vkDomain}/feed?q=${encodeURIComponent(route.tag)}&section=search`;
                case 'ChatJoinProxyRoute':
                    // Проверка изоляции не требуется, ссылки должны быть доступны учебным профилям
                    return `https://vk.me/join/${route.joinHash}`;
                case 'CallJoinProxyRoute':
                    return `https://${this.vkDomain}/call/join/${encodeURIComponent(route.callJoinHash)}`;
                case 'CallJoinShortenedProxyRoute':
                    if (this.checkIsolation()) {
                        return `https://${SFERUM_DOMAIN}/?call=${route.callJoinId}${route.password ? `&p=${route.password}` : ''}`;
                    }
                    else {
                        return `https://${WEB_VK_ME_DOMAIN}/call/${route.callJoinId}${route.password ? `?p=${route.password}` : ''}`;
                    }
                case 'ChannelJoinProxyRoute':
                    const channelLink = `https://${this.vkDomain}/club${route.channelId}`;
                    // Проверка изоляции не требуется, ссылки должны быть доступны учебным профилям
                    return route.postCmid
                        ? `${channelLink}?w=wall${route.postCmid}`
                        : channelLink;
                case 'GiftsCatalogProxyRoute':
                    if (this.checkIsolation()) {
                        return null;
                    }
                    const searchParams = new URLSearchParams();
                    if (route.send) {
                        searchParams.append('act', 'send');
                    }
                    if (route.peerId) {
                        searchParams.append('mid', String(route.peerId));
                    }
                    if (route.ref) {
                        searchParams.append('ref', route.ref);
                    }
                    return `https://${this.vkDomain}/gifts?${searchParams}`;
                case 'GiftDetailsProxyRoute':
                    if (this.checkIsolation()) {
                        return null;
                    }
                    const pathname = `im/convo/${route.peerId}`;
                    const receiverParam = route.receiverId ? `to-${route.receiverId}` : '';
                    const senderParam = route.senderId ? `_from-${route.senderId}` : '';
                    return `https://${this.vkDomain}/${pathname}?w=gift-details${route.giftId}${receiverParam}${senderParam}`;
                case 'VmojiAvatarModelProxyRoute':
                    if (this.checkIsolation()) {
                        return null;
                    }
                    let wPath = `w=vmoji${route.ownerId}_${route.characterId}`;
                    if (route.packId) {
                        wPath += `_${route.packId}`;
                    }
                    return `https://${this.vkDomain}/stickers?${wPath}`;
                case 'HashtagMentionProxyRoute':
                    if (this.checkIsolation() || !route.authorId) {
                        return null;
                    }
                    return `https://${this.vkDomain}/wall${route.authorId}?q=${encodeURIComponent(route.tag)}`;
                case 'ScreenNameProxyRoute':
                    if (this.checkIsolation()) {
                        return null;
                    }
                    return `https://${this.vkDomain}/${route.screenName}`;
                case 'StickerPackProxyRoute':
                    if (this.checkIsolation()) {
                        return null;
                    }
                    const url = new URL(route.externalUrl
                        ? route.externalUrl
                        : `https://${this.vkDomain}/stickers/${route.stickerPackName}`);
                    if (route.ref) {
                        url.searchParams.append('ref', route.ref);
                    }
                    return url.href;
                case 'SferumChannelProxyRoute':
                    const base = `https://${SFERUM_DOMAIN}/?p=channel&channelId=${route.channelId}`;
                    return route.postCmid ? `${base}&postId=${route.postCmid}` : base;
                case 'CommunityChannelProxyRoute':
                    const baseUrl = `https://${VKCOM_DOMAIN}/im/channels/${route.channelId}`;
                    return route.postCmid ? `${baseUrl}&cmid=${route.postCmid}` : baseUrl;
                default:
                    exhaustivenessCheck(route);
            }
        }
        return this.toUrlInternal(route);
    }
    toUrlInternal(route) {
        return this.addBasePath(this.parseUtils.toUrl(route));
    }
    fromProxyRoute(proxyRoute) {
        switch (proxyRoute.kind) {
            case 'AttachProxyRoute':
                switch (proxyRoute.attach.kind) {
                    case 'MiniApp':
                        switch (proxyRoute.attach.type) {
                            // Типы соответсвующие играм в миниаппах, которые должны открываться в vkcom
                            case 'app':
                            case 'game':
                            case 'html5_game':
                                return null;
                            default:
                                const rawMiniAppGroupId = Number(proxyRoute.attach.appLink.match(/_(-\d+)/)?.[1]);
                                const resolvedParsedMiniAppGroupId = !isNaN(rawMiniAppGroupId)
                                    ? Peer.resolveId(rawMiniAppGroupId)
                                    : undefined;
                                const miniAppGroupId = resolvedParsedMiniAppGroupId &&
                                    Peer.isGroupPeerId(resolvedParsedMiniAppGroupId)
                                    ? resolvedParsedMiniAppGroupId
                                    : undefined;
                                return this.getStackUtils().push({
                                    kind: 'MiniAppModal',
                                    miniAppId: proxyRoute.attach.id,
                                    hash: proxyRoute.attach.hash,
                                    groupPeerId: miniAppGroupId,
                                });
                        }
                    case 'Wall':
                    case 'WallHistory': {
                        if (this.withNewChannels) {
                            return null;
                        }
                        // Может быть id из другого диапазона, например id пользователя
                        if (!Channel.isChannelId(proxyRoute.attach.authorId)) {
                            return null;
                        }
                        return {
                            kind: 'ChannelRoute',
                            channelId: Channel.resolveId(proxyRoute.attach.authorId),
                            postCmid: Post.resolveCmid(proxyRoute.attach.id),
                            organiser: proxyRoute.organiser,
                        };
                    }
                    case 'Normal': {
                        if (!this.withNewChannels) {
                            return null;
                        }
                        // Может быть id из другого диапазона, например id пользователя
                        if (!Channel.isChannelId(proxyRoute.attach.channelId)) {
                            return null;
                        }
                        return {
                            kind: 'ChannelRoute',
                            channelId: Channel.resolveId(proxyRoute.attach.channelId),
                            postCmid: Post.resolveCmid(proxyRoute.attach.cmid),
                            organiser: proxyRoute.organiser,
                        };
                    }
                    case 'WallReply': {
                        if (this.withNewChannels) {
                            return null;
                        }
                        // Может быть id из другого диапазона, например id пользователя
                        if (!Channel.isChannelId(proxyRoute.attach.ownerId)) {
                            return null;
                        }
                        return {
                            kind: 'ChannelRoute',
                            channelId: Channel.resolveId(proxyRoute.attach.ownerId),
                            postCmid: Post.resolveCmid(proxyRoute.attach.postId),
                            commentCmid: Comment.resolveCmid(proxyRoute.attach.id),
                            organiser: proxyRoute.organiser,
                        };
                    }
                    case 'Event': {
                        if (this.withNewChannels) {
                            return null;
                        }
                        return {
                            kind: 'ChannelRoute',
                            channelId: Channel.resolveId(proxyRoute.attach.id),
                        };
                    }
                    case 'Link': {
                        const callJoinHash = getCallJoinHash(proxyRoute.attach.url);
                        if (callJoinHash) {
                            return {
                                kind: 'CallJoinRoute',
                                callJoinHash,
                            };
                        }
                        const callJoinId = getCallJoinId(proxyRoute.attach.url);
                        if (callJoinId) {
                            return {
                                kind: 'CallJoinShortenedRoute',
                                callJoinId: callJoinId.callJoinId,
                            };
                        }
                        const chatJoinHash = getChatJoinHash(proxyRoute.attach.url);
                        if (chatJoinHash) {
                            return {
                                kind: 'ChatJoinRoute',
                                chatJoinHash,
                            };
                        }
                        const sferumMiniAppParams = getSferumMiniAppParams(proxyRoute.attach.url);
                        if (sferumMiniAppParams) {
                            return {
                                ...this.screenRoute,
                                modal: [
                                    {
                                        kind: 'MiniAppModal',
                                        miniAppId: sferumMiniAppParams.miniAppId,
                                        hash: sferumMiniAppParams.hash,
                                    },
                                ],
                                sferum: true,
                            };
                        }
                        return null;
                    }
                    case 'Audio':
                    case 'Album':
                    case 'AudioPlaylist':
                    case 'Artist':
                    case 'Podcast':
                    case 'Doc':
                    case 'Sticker':
                    case 'UgcSticker':
                    case 'Voice':
                    case 'Market':
                    case 'MoneyTransfer':
                    case 'MoneyRequest':
                    case 'Gift':
                    case 'Graffiti':
                    case 'MarketAlbum':
                    case 'FinishedCall':
                    case 'Poll':
                    case 'Story':
                    case 'Narrative':
                    case 'Article':
                    case 'Geo':
                    case 'ActiveCall':
                    case 'DonutLink':
                    case 'InviteLink':
                    case 'VideoMessage':
                    case 'Curator':
                    case 'MiniAppWidget':
                    case 'Question':
                    case 'StickerPack':
                    case 'Widget':
                    case 'ChannelStubPhoto':
                    case 'ChannelStubVideo':
                    case 'ChannelStubAudio':
                    case 'ChannelStubDoc': {
                        return null;
                    }
                    default: {
                        return exhaustivenessCheck(proxyRoute.attach);
                    }
                }
            case 'AttachMediaProxyRoute': {
                let source;
                if (proxyRoute.source) {
                    switch (proxyRoute.source.kind) {
                        case 'message':
                            source = {
                                kind: IRouter.RouteSourceKind.Message,
                                cmid: proxyRoute.source.cmid,
                                peerId: proxyRoute.source.peerId,
                                mediaViewerItemPosition: proxyRoute.source.mediaViewerItemPosition,
                                messageAccessKey: proxyRoute.attach.messageAccessKey,
                            };
                            break;
                        case 'postponedMessage':
                            source = {
                                kind: IRouter.RouteSourceKind.PostponedMessage,
                                cmid: proxyRoute.source.cmid,
                                peerId: proxyRoute.source.peerId,
                                messageAccessKey: proxyRoute.attach.messageAccessKey,
                            };
                            break;
                        case 'post':
                            source = {
                                kind: IRouter.RouteSourceKind.Post,
                                cmid: proxyRoute.source.cmid,
                                channelId: proxyRoute.source.channelId,
                                mediaViewerItemPosition: proxyRoute.source.mediaViewerItemPosition,
                            };
                            break;
                        case 'postponedPost':
                            source = {
                                kind: IRouter.RouteSourceKind.PostponedPost,
                                cmid: proxyRoute.source.cmid,
                                channelId: proxyRoute.source.channelId,
                            };
                            break;
                        case 'comment':
                            source = {
                                kind: IRouter.RouteSourceKind.Comment,
                                commentCmid: proxyRoute.source.commentCmid,
                                postCmid: proxyRoute.source.postCmid,
                                channelId: proxyRoute.source.channelId,
                            };
                            break;
                        case 'composer':
                            source = {
                                kind: IRouter.RouteSourceKind.Composer,
                            };
                            break;
                        case 'channelComposer':
                            source = {
                                kind: IRouter.RouteSourceKind.ChannelComposer,
                            };
                            break;
                        case 'commentsComposer':
                            source = {
                                kind: IRouter.RouteSourceKind.CommentsComposer,
                            };
                            break;
                        default:
                            exhaustivenessCheck(proxyRoute.source);
                    }
                }
                const kinds = {
                    Photo: 'PhotoModal',
                    Video: 'VideoModal',
                };
                return this.getStackUtils().push({
                    kind: kinds[proxyRoute.attach.kind],
                    id: proxyRoute.attach.id,
                    ownerId: proxyRoute.attach.ownerId,
                    accessKey: proxyRoute.attach.accessKey,
                    source,
                    organiser: proxyRoute.organiser,
                });
            }
            case 'StickersStoreProxyRoute':
                return {
                    kind: 'RedirectRuntimeRoute',
                    redirectUrl: `https://${this.vkDomain}/stickers`,
                };
            case 'HashtagProxyRoute':
            case 'ChatJoinProxyRoute':
            case 'CallJoinProxyRoute':
            case 'CallJoinShortenedProxyRoute':
            case 'ChannelJoinProxyRoute':
            case 'GiftsCatalogProxyRoute':
            case 'GiftDetailsProxyRoute':
            case 'VmojiAvatarModelProxyRoute':
            case 'HashtagMentionProxyRoute':
            case 'ScreenNameProxyRoute':
            case 'VkProxyRoute':
            case 'StickerPackProxyRoute':
            case 'SferumChannelProxyRoute':
            case 'CommunityChannelProxyRoute':
                return null;
            default:
                exhaustivenessCheck(proxyRoute);
        }
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        // пока здесь нечего подчищать
    }
}
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
function getPath(location) {
    /**
     * ME-31173, по дефолту пакет "history" при получении hash = '' считает что хеш не нужен и не устанавливает его
     * в URL, хотя нативно такое поведение поддерживается (window.history.pushState({}, '', '#'))
     *
     * Такое поведение тоже валидно, поскольку отсутствие хеша в URL означает пустое значение (что мы и получаем
     * в location.hash, пустую строку), но поскольку роутер ожидает все символы, в таком случае добавляем
     * явно хеш в URL, чтобы исключить разные вариации итогового URL
     */
    return `${location.pathname}${location.search}${location.hash || '#'}`;
}
class ParseUtils {
    featureFlags;
    /**
     * Разделитель, который используется для энкодинга/декодинга роута,
     * сформированного без использования query-параметров
     *
     * Например, роут фото /photo/214865335_457241585_2b18af3101d3dd8f35_0_2000000061_37354_mail12345-565589
     * декодируется в объект роута
     * {
     *   kind: 'PhotoModal',
     *   accessKey: '2b18af3101d3dd8f35',
     *   id: 457241585,
     *   ownerId: 214865335,
     *   source: {
     *     cmid: 37354,
     *     kind: 0,
     *     messageAccessKey: 'mail12345-565589',
     *     peerId: 2000000061,
     *   },
     * }
     **/
    routeParamsDelimiter = '_';
    routeParamsDelimiterParser = P.string(this.routeParamsDelimiter);
    routeParamsOptionalDelimiterParser = this.routeParamsDelimiterParser.or(P.string(''));
    constructor(featureFlags) {
        this.featureFlags = featureFlags;
    }
    parser = P.createLanguage({
        Modal: (r) => P.alt(r.Poll, r.NewFolder, r.EditFolder, r.Important, r.MiniApp, r.MiniAppCatalog, r.SpaceRoomCreate, r.SpaceRoomUpdate, r.SpaceSectionCreate, r.ChatInvite, r.CallJoinById, r.CallJoinByShortId, 
        // Photo parsers
        r.PhotoSourceMessage, r.PhotoSourcePostponedMessage, r.PhotoSourcePost, r.RouteSourcePostponedPost, r.PhotoSourceComment, r.PhotoSourceComposer, r.PhotoSourceChannelComposer, r.PhotoSourceCommentsComposer, r.PhotoSourceLess, 
        // Video parsers
        r.VideoSourceMessage, r.VideoSourcePostponedMessage, r.VideoSourcePost, r.VideoSourcePostponedPost, r.VideoSourceComment, r.VideoSourceComposer, r.VideoSourceChannelComposer, r.VideoSourceCommentsComposer, r.VideoSourceLess),
        RightPanel: (r) => P.alt(r.Peer, r.ChannelPanel, r.SpacePanel),
        ScreenRoutes: (r) => P.alt(r.Convo, r.Channel, r.ChannelsFolder, r.CallJoin, r.CallJoinShortened, r.ChatJoin, r.Settings, r.SpaceRoomRoute, r.SpaceRoute, r.Main),
        /**
         * Screen parsers
         **/
        Main: () => P.regexp(/\/?/).map(() => {
            return {
                kind: 'MainRoute',
            };
        }),
        CallJoin: () => P.seqObj(P.string('/call/join/'), [
            'callJoinHash',
            P.regexp(/^(.*)+$/),
        ]).map((value) => {
            return {
                kind: 'CallJoinRoute',
                callJoinHash: value.callJoinHash,
            };
        }),
        CallJoinShortened: () => P.seqObj(P.string('/call/'), [
            'callJoinId',
            P.regexp(/^(.*)+$/),
        ]).map((value) => {
            return {
                kind: 'CallJoinShortenedRoute',
                callJoinId: value.callJoinId,
            };
        }),
        ChatJoin: () => P.seqObj(P.string('/chat/join/'), [
            'chatJoinHash',
            P.regexp(/^(.*)+$/),
        ]).map((value) => {
            return {
                kind: 'ChatJoinRoute',
                chatJoinHash: value.chatJoinHash,
            };
        }),
        Convo: () => P.seqObj(P.string('/convo/'), [
            'peerId',
            P.regexp(/(-)?\d+$/),
        ]).map((value) => {
            return {
                kind: 'ConvoRoute',
                peerId: Peer.resolveId(Number(value.peerId)),
                entrypoint: 'unknown',
            };
        }),
        Channel: () => P.seqObj(P.string('/channels/'), [
            'channelId',
            P.regexp(/(-)\d+$/),
        ]).map((value) => {
            return {
                kind: 'ChannelRoute',
                channelId: Channel.resolveId(Number(value.channelId)),
            };
        }),
        ChannelsFolder: () => P.regexp(/\/channels\/?/).map(() => {
            return {
                kind: 'ChannelsFolderRoute',
            };
        }),
        Settings: () => P.seqObj(P.regexp(/\/settings\/?/), [
            'section',
            P.alt(...IRouter.SettingsRouteSectionKeys.map((key) => P.string(key)), 
            /**
             * Если мы не смогли распарсить секцию, то выставим main по умолчанию.
             * Это связано с лэйаутом вкком. Сам мессенджер в вкком спозиционирован фиксированным, но страница с настройками не фиксированная и скроллится вместе со всем сайтом вкком.
             * Фризить или не фризить вкком мы определяем по роуту. Именно из-за этого может появляться баг, когда путь вида 'im/settings/abrakadabra'
             * считывается в вкком как валидный, а внутри рефорджеда падает с ошибкой в парсере и выставляется в MainRoute.
             * Как итог вьюпорт не зафиксирован в вкком, так как мы ожидаем увидеть экран настроек, а реф отрисовывает MainRoute.
             */
            P.seq(P.all, P.succeed('start')).map((value) => value[1])),
        ], 
        /**
         * Чтобы парсер не ожидал конца строки если нашёл совпадение с секцией (начало строки совпадает с названием секции - для нас достаточно)
         */
        P.all).map((value) => {
            return {
                kind: 'SettingsRoute',
                section: value.section,
            };
        }),
        SpaceRoute: () => P.seqObj(P.string('/space'), [
            'spaceId',
            P.regexp(/\d*/),
        ]).map((value) => {
            return {
                kind: 'SpaceRoute',
                spaceId: Space.resolveId(Number(value.spaceId)),
            };
        }),
        SpaceRoomRoute: () => P.seqObj(P.string('/space'), ['spaceId', P.regexp(/\d*/)], P.string('/room'), [
            'roomId',
            P.regexp(/\d*/),
        ]).map((value) => {
            const spaceId = Space.resolveId(Number(value.spaceId));
            const roomId = Space.resolveRoomId(Number(value.roomId));
            return {
                kind: 'SpaceRoomRoute',
                spaceId,
                roomId,
            };
        }),
        /**
         * Modal parsers
         **/
        Peer: () => P.seqObj(P.string('peer'), ['peerId', P.regexp(/(-)?\d*/)], [
            'section',
            P.alt(P.eof, P.seq(this.routeParamsDelimiterParser, P.alt(...IRouter.PeerPanelTabKeys.map((key) => P.string(key)))).map((value) => value[1])),
        ]).map((value) => {
            return {
                kind: 'PeerPanel',
                peerId: Peer.resolveId(Number(value.peerId)),
                section: value.section,
            };
        }),
        ChannelPanel: () => P.seqObj(P.string('channel'), ['channelId', P.regexp(/(-)\d+/)], [
            'section',
            P.alt(P.eof, P.seq(this.routeParamsDelimiterParser, P.alt(...IRouter.ChannelPanelSectionKeys.map((key) => P.string(key)))).map((value) => value[1])),
        ]).map((value) => {
            return {
                kind: 'ChannelPanel',
                channelId: Channel.resolveId(Number(value.channelId)),
                section: value.section,
            };
        }),
        SpacePanel: () => P.seqObj(P.string('space'), ['spaceId', P.regexp(/\d*/)]).map((value) => {
            return {
                kind: 'SpacePanel',
                spaceId: Space.resolveId(Number(value.spaceId)),
            };
        }),
        Poll: () => P.seqObj(P.string('poll'), ['ownerId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['pollId', P.regexp(/(-)?\d*/)]).map((value) => {
            return {
                kind: 'PollModal',
                ownerId: Peer.resolveId(Number(value.ownerId)),
                pollId: Number(value.pollId),
            };
        }),
        NewFolder: () => P.seqObj(P.string('newFolder'), [
            'peerId',
            P.regexp(/(-)?\d*/),
        ]).map((value) => {
            const peerId = value.peerId && Peer.resolveId(Number(value.peerId));
            return {
                kind: 'NewFolderModal',
                ...(peerId && { peerId }),
            };
        }),
        EditFolder: () => P.seqObj(P.string('editFolder'), [
            'folderId',
            P.regexp(/(-)?\d*/),
        ]).map((value) => {
            const folderId = Folder.resolveId(Number(value.folderId));
            return {
                kind: 'EditFolderModal',
                ...(folderId && { folderId }),
            };
        }),
        Important: () => P.string('important').map(() => ({
            kind: 'ImportantMessagesModal',
        })),
        MiniAppCatalog: () => P.string('services').map(() => ({
            kind: 'MiniAppCatalogModal',
        })),
        SpaceRoomCreate: () => P.seqObj(P.string('space-room-create'), this.routeParamsDelimiterParser, ['spaceId', P.regexp(/\d*/)], this.routeParamsOptionalDelimiterParser, ['sectionId', P.regexp(/\d*/)]).map((value) => {
            const sectionId = value.sectionId && Space.resolveSectionId(Number(value.sectionId));
            return {
                kind: 'SpaceRoomCreateModal',
                spaceId: Space.resolveId(Number(value.spaceId)),
                ...(sectionId && {
                    sectionId,
                }),
            };
        }),
        SpaceRoomUpdate: () => P.seqObj(P.string('space-room-update'), this.routeParamsDelimiterParser, ['spaceId', P.regexp(/\d*/)], this.routeParamsDelimiterParser, ['roomId', P.regexp(/\d*/)]).map((value) => ({
            kind: 'SpaceRoomUpdateModal',
            spaceId: Space.resolveId(Number(value.spaceId)),
            roomId: Space.resolveRoomId(Number(value.roomId)),
        })),
        SpaceSectionCreate: () => P.seqObj(P.string('space-section-create'), this.routeParamsDelimiterParser, ['spaceId', P.regexp(/\d*/)]).map((value) => {
            return {
                kind: 'SpaceSectionCreateModal',
                spaceId: Space.resolveId(Number(value.spaceId)),
            };
        }),
        MiniApp: () => P.seqObj(P.string('miniapp'), ['miniAppId', P.regexp(/(-)?\d+/)], [
            'groupPeerId',
            P.alt(P.eof, P.seq(this.routeParamsDelimiterParser, P.regexp(/(-\d+)?/)).map((value) => value[1])),
        ]).map((value) => {
            const parsedGroupId = value.groupPeerId && Number(value.groupPeerId);
            const resolvedPeerId = parsedGroupId
                ? Peer.resolveId(parsedGroupId)
                : undefined;
            const groupPeerId = resolvedPeerId && Peer.isGroupPeerId(resolvedPeerId)
                ? resolvedPeerId
                : undefined;
            return {
                kind: 'MiniAppModal',
                miniAppId: Attach.resolveMiniAppId(Number(value.miniAppId)),
                ...(groupPeerId && {
                    groupPeerId,
                }),
            };
        }),
        ChatInvite: () => P.seqObj(P.string('chat_invite'), this.routeParamsDelimiterParser, ['hash', P.regexp(/.+$/)]).map((value) => ({
            kind: 'ChatInviteModal',
            hash: value.hash,
        })),
        CallJoinById: () => P.seqObj(P.string('call_join'), this.routeParamsDelimiterParser, ['callId', P.regexp(/[^/]+/)]).map((value) => ({
            kind: 'CallJoinByIdModal',
            callId: value.callId,
        })),
        CallJoinByShortId: () => P.seqObj(P.string('call_id'), this.routeParamsDelimiterParser, ['shortId', P.regexp(/[^/]+/)]).map((value) => ({
            kind: 'CallJoinByShortIdModal',
            shortId: value.shortId,
        })),
        /**
         * Photo modal route parsers
         **/
        Photo: (r) => P.seqObj(P.string('photo'), ['ownerId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['id', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['accessKey', r.AccessKey]),
        PhotoSourceLess: (r) => P.seqObj(['photo', r.Photo]).map((value) => {
            return {
                kind: 'PhotoModal',
                ownerId: Peer.resolveId(Number(value.photo.ownerId)),
                id: Number(value.photo.id),
                accessKey: value.photo.accessKey,
            };
        }),
        PhotoSourceMessage: (r) => P.seqObj(['photo', r.PhotoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.Message.toString()), this.routeParamsDelimiterParser, ['peerId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['cmid', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['messageAccessKey', r.AccessKey], 
        // Опциональный разделитель, чтобы поддержать url без mediaViewerItemPosition параметра
        this.routeParamsOptionalDelimiterParser, ['mediaViewerItemPosition', P.regexp(/\d*/)]).map((value) => {
            return {
                ...value.photo,
                source: {
                    kind: IRouter.RouteSourceKind.Message,
                    peerId: Peer.resolveId(Number(value.peerId)),
                    cmid: Message.resolveCmid(Number(value.cmid)),
                    messageAccessKey: value.messageAccessKey,
                    ...(value.mediaViewerItemPosition && {
                        mediaViewerItemPosition: parseInt(value.mediaViewerItemPosition, 10),
                    }),
                },
            };
        }),
        PhotoSourcePostponedMessage: (r) => P.seqObj(['photo', r.PhotoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.PostponedMessage.toString()), this.routeParamsDelimiterParser, ['peerId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['cmid', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['messageAccessKey', r.AccessKey]).map((value) => {
            return {
                ...value.photo,
                source: {
                    kind: IRouter.RouteSourceKind.PostponedMessage,
                    peerId: Peer.resolveId(Number(value.peerId)),
                    cmid: Message.resolveCmid(Number(value.cmid)),
                    messageAccessKey: value.messageAccessKey,
                },
            };
        }),
        PhotoSourcePost: (r) => P.seqObj(['photo', r.PhotoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.Post.toString()), this.routeParamsDelimiterParser, ['channelId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['cmid', P.regexp(/(-)?\d*/)], 
        // Опциональный разделитель, чтобы поддержать url без mediaViewerItemPosition параметра
        this.routeParamsOptionalDelimiterParser, ['mediaViewerItemPosition', P.regexp(/\d*/)]).map((value) => {
            return {
                ...value.photo,
                source: {
                    kind: IRouter.RouteSourceKind.Post,
                    channelId: Channel.resolveId(Number(value.channelId)),
                    cmid: Post.resolveCmid(Number(value.cmid)),
                    ...(value.mediaViewerItemPosition && {
                        mediaViewerItemPosition: parseInt(value.mediaViewerItemPosition, 10),
                    }),
                },
            };
        }),
        RouteSourcePostponedPost: (r) => P.seqObj(['photo', r.PhotoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.PostponedPost.toString()), this.routeParamsDelimiterParser, ['channelId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['cmid', P.regexp(/(-)?\d*/)]).map((value) => {
            return {
                ...value.photo,
                source: {
                    kind: IRouter.RouteSourceKind.PostponedPost,
                    channelId: Channel.resolveId(Number(value.channelId)),
                    cmid: Post.resolveCmid(Number(value.cmid)),
                },
            };
        }),
        PhotoSourceComment: (r) => P.seqObj(['photo', r.PhotoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.Comment.toString()), this.routeParamsDelimiterParser, ['channelId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['postCmid', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['commentCmid', P.regexp(/(-)?\d*/)]).map((value) => {
            return {
                ...value.photo,
                source: {
                    kind: IRouter.RouteSourceKind.Comment,
                    channelId: Channel.resolveId(Number(value.channelId)),
                    postCmid: Post.resolveCmid(Number(value.postCmid)),
                    commentCmid: Comment.resolveCmid(Number(value.commentCmid)),
                },
            };
        }),
        PhotoSourceComposer: (r) => P.seqObj(['photo', r.PhotoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.Composer.toString())).map((value) => {
            return {
                ...value.photo,
                source: {
                    kind: IRouter.RouteSourceKind.Composer,
                },
            };
        }),
        PhotoSourceChannelComposer: (r) => P.seqObj(['photo', r.PhotoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.ChannelComposer.toString())).map((value) => {
            return {
                ...value.photo,
                source: {
                    kind: IRouter.RouteSourceKind.ChannelComposer,
                },
            };
        }),
        PhotoSourceCommentsComposer: (r) => P.seqObj(['photo', r.PhotoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.CommentsComposer.toString())).map((value) => {
            return {
                ...value.photo,
                source: {
                    kind: IRouter.RouteSourceKind.CommentsComposer,
                },
            };
        }),
        /**
         * Video modal route parsers
         **/
        Video: (r) => P.seqObj(P.string('video'), ['ownerId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['id', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['accessKey', r.AccessKey]),
        VideoSourceLess: (r) => P.seqObj(['video', r.Video]).map((value) => {
            return {
                kind: 'VideoModal',
                /**
                 * https://jira.mvk.com/browse/ME-44547
                 * Для данного парсера нет возможности резолвить ownerId через Peer.resolveId.
                 * Peer.resolveId используется для защиты типа, а в данном случае ownerId может быть
                 * владельцем UMA контента (овнерами являются фейковые боты), для которой отсутствует
                 * соответствующая сущность в модели Peer и поэтому мы не может задать функцию для защиты типа,
                 * чтобы дальше использовать её в Peer.resolveId.
                 * В случае если все же использовать Peer.resolveId, у нас для UMA контента всегда будет возвращаться ownerId = 0.
                 **/
                ownerId: Number(value.video.ownerId),
                id: Number(value.video.id),
                accessKey: value.video.accessKey,
            };
        }),
        VideoSourceMessage: (r) => P.seqObj(['video', r.VideoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.Message.toString()), this.routeParamsDelimiterParser, ['peerId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['cmid', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['messageAccessKey', r.AccessKey], 
        // Опциональный разделитель, чтобы поддержать url без mediaViewerItemPosition параметра
        this.routeParamsOptionalDelimiterParser, ['mediaViewerItemPosition', P.regexp(/\d*/)]).map((value) => {
            return {
                ...value.video,
                source: {
                    kind: IRouter.RouteSourceKind.Message,
                    peerId: Peer.resolveId(Number(value.peerId)),
                    cmid: Message.resolveCmid(Number(value.cmid)),
                    messageAccessKey: value.messageAccessKey,
                    ...(value.mediaViewerItemPosition && {
                        mediaViewerItemPosition: parseInt(value.mediaViewerItemPosition, 10),
                    }),
                },
            };
        }),
        VideoSourcePostponedMessage: (r) => P.seqObj(['video', r.VideoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.PostponedMessage.toString()), this.routeParamsDelimiterParser, ['peerId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['cmid', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['messageAccessKey', r.AccessKey]).map((value) => {
            return {
                ...value.video,
                source: {
                    kind: IRouter.RouteSourceKind.PostponedMessage,
                    peerId: Peer.resolveId(Number(value.peerId)),
                    cmid: Message.resolveCmid(Number(value.cmid)),
                    messageAccessKey: value.messageAccessKey,
                },
            };
        }),
        VideoSourcePost: (r) => P.seqObj(['video', r.VideoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.Post.toString()), this.routeParamsDelimiterParser, ['channelId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['cmid', P.regexp(/(-)?\d*/)], 
        // Опциональный разделитель, чтобы поддержать url без mediaViewerItemPosition параметра
        this.routeParamsOptionalDelimiterParser, ['mediaViewerItemPosition', P.regexp(/\d*/)]).map((value) => {
            return {
                ...value.video,
                source: {
                    kind: IRouter.RouteSourceKind.Post,
                    channelId: Channel.resolveId(Number(value.channelId)),
                    cmid: Post.resolveCmid(Number(value.cmid)),
                    ...(value.mediaViewerItemPosition && {
                        mediaViewerItemPosition: parseInt(value.mediaViewerItemPosition, 10),
                    }),
                },
            };
        }),
        VideoSourcePostponedPost: (r) => P.seqObj(['video', r.VideoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.PostponedPost.toString()), this.routeParamsDelimiterParser, ['channelId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['cmid', P.regexp(/(-)?\d*/)]).map((value) => {
            return {
                ...value.video,
                source: {
                    kind: IRouter.RouteSourceKind.PostponedPost,
                    channelId: Channel.resolveId(Number(value.channelId)),
                    cmid: Post.resolveCmid(Number(value.cmid)),
                },
            };
        }),
        VideoSourceComment: (r) => P.seqObj(['video', r.VideoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.Comment.toString()), this.routeParamsDelimiterParser, ['channelId', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['postCmid', P.regexp(/(-)?\d*/)], this.routeParamsDelimiterParser, ['commentCmid', P.regexp(/(-)?\d*/)]).map((value) => {
            return {
                ...value.video,
                source: {
                    kind: IRouter.RouteSourceKind.Comment,
                    channelId: Channel.resolveId(Number(value.channelId)),
                    postCmid: Post.resolveCmid(Number(value.postCmid)),
                    commentCmid: Comment.resolveCmid(Number(value.commentCmid)),
                },
            };
        }),
        VideoSourceComposer: (r) => P.seqObj(['video', r.VideoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.Composer.toString())).map((value) => {
            return {
                ...value.video,
                source: {
                    kind: IRouter.RouteSourceKind.Composer,
                },
            };
        }),
        VideoSourceChannelComposer: (r) => P.seqObj(['video', r.VideoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.ChannelComposer.toString())).map((value) => {
            return {
                ...value.video,
                source: {
                    kind: IRouter.RouteSourceKind.ChannelComposer,
                },
            };
        }),
        VideoSourceCommentsComposer: (r) => P.seqObj(['video', r.VideoSourceLess], this.routeParamsDelimiterParser, P.string(IRouter.RouteSourceKind.CommentsComposer.toString())).map((value) => {
            return {
                ...value.video,
                source: {
                    kind: IRouter.RouteSourceKind.CommentsComposer,
                },
            };
        }),
        AccessKey: () => P.regexp(/[-0-9a-zA-Z]*/),
    });
    fromUrl = (url) => {
        const path = parsePath(url);
        const params = new URLSearchParams(path.search);
        const globalParams = this.parseParams(params);
        if (!path.pathname) {
            return {
                kind: 'MainRoute',
                ...globalParams,
            };
        }
        try {
            const screenRoute = this.parser.ScreenRoutes.tryParse(path.pathname);
            switch (screenRoute.kind) {
                case 'MainRoute': {
                    const callJoinHash = !this.featureFlags.vkm_router_modal_unification
                        ? params.get('call')
                        : null;
                    const callJoinId = !this.featureFlags.vkm_router_modal_unification
                        ? params.get('call_id')
                        : null;
                    const chatJoinHash = !this.featureFlags.vkm_router_modal_unification
                        ? params.get('chat')
                        : null;
                    return {
                        kind: 'MainRoute',
                        ...(callJoinHash && { callJoinHash }),
                        ...(chatJoinHash && { chatJoinHash }),
                        ...(callJoinId && { callJoinId }),
                        ...this.parseConvoRouteExtraParams(params),
                        ...globalParams,
                    };
                }
                case 'CallJoinRoute': {
                    return {
                        kind: 'CallJoinRoute',
                        callJoinHash: screenRoute.callJoinHash,
                        ...globalParams,
                    };
                }
                case 'ChatJoinRoute': {
                    return {
                        kind: 'ChatJoinRoute',
                        chatJoinHash: screenRoute.chatJoinHash,
                        ...globalParams,
                    };
                }
                case 'CallJoinShortenedRoute': {
                    return {
                        kind: 'CallJoinShortenedRoute',
                        callJoinId: screenRoute.callJoinId,
                        ...globalParams,
                    };
                }
                case 'ConvoRoute': {
                    const search = params.get('search');
                    const callJoinHash = !this.featureFlags.vkm_router_modal_unification
                        ? params.get('call_join')
                        : null;
                    const callJoinId = !this.featureFlags.vkm_router_modal_unification
                        ? params.get('call_id')
                        : null;
                    const chatJoinHash = !this.featureFlags.vkm_router_modal_unification
                        ? params.get('chat_invite')
                        : null;
                    const cmid = params.get('cmid');
                    const ref = params.get('ref');
                    const ref_source = params.get('ref_source');
                    const highlightQuery = params.get('highlight');
                    const parentRouteString = params.get('parent_route');
                    const sferum = params.get('sferum');
                    const entrypoint = params.get('entrypoint') || 'unknown';
                    const postponed = getConvoPostponedParam(params);
                    let parentRoute;
                    if (parentRouteString) {
                        const route = this.fromUrl(window.atob(parentRouteString));
                        if (route.kind === 'ConvoRoute' || route.kind === 'ChannelRoute') {
                            parentRoute = route;
                        }
                    }
                    return {
                        kind: 'ConvoRoute',
                        peerId: Peer.resolveId(Number(screenRoute.peerId)),
                        sferum: sferum ? Boolean(sferum) : undefined,
                        postponed,
                        ...(entrypoint && { entrypoint }),
                        ...(ref && { ref }),
                        ...(ref_source && { refSource: ref_source }),
                        ...(chatJoinHash && { chatJoinHash }),
                        ...(callJoinHash && { callJoinHash }),
                        ...(callJoinId && { callJoinId }),
                        ...(search !== undefined && search !== null ? { search } : {}),
                        ...(cmid && { cmid: Message.resolveCmid(Number(cmid)) }),
                        ...(highlightQuery && { highlightQuery }),
                        ...this.parseConvoRouteExtraParams(params),
                        ...(parentRoute && { parentRoute }),
                        ...globalParams,
                    };
                    function getConvoPostponedParam(params) {
                        const postponedFromParams = params.get('postponed');
                        if (!postponedFromParams) {
                            return undefined;
                        }
                        const postponedCmid = Message.resolveCmid(Number(postponedFromParams));
                        if (postponedCmid > 0) {
                            return postponedCmid;
                        }
                        return true;
                    }
                }
                case 'ChannelRoute': {
                    const postCmid = params.get('cmid');
                    const commentCmid = params.get('comment');
                    const sferum = params.get('sferum');
                    const search = params.get('search');
                    const edu = params.get('edu');
                    const postponed = getPostponedParam(params);
                    const searchTrackCode = params.get('search_track_code');
                    const parentRouteString = params.get('parent_route');
                    const entrypoint = params.get('entrypoint') || undefined;
                    let parentRoute;
                    if (parentRouteString) {
                        const route = this.fromUrl(window.atob(parentRouteString));
                        if (route.kind === 'ConvoRoute' || route.kind === 'ChannelRoute') {
                            parentRoute = route;
                        }
                    }
                    return {
                        kind: 'ChannelRoute',
                        channelId: Channel.resolveId(Number(screenRoute.channelId)),
                        postCmid: postCmid !== null
                            ? Post.resolveCmid(Number(postCmid))
                            : undefined,
                        commentCmid: commentCmid !== null
                            ? Comment.resolveCmid(Number(commentCmid))
                            : undefined,
                        edu: edu ? Boolean(edu) : undefined,
                        sferum: sferum ? Boolean(sferum) : undefined,
                        postponed,
                        ...(entrypoint ? { entrypoint } : {}),
                        ...(search !== undefined && search !== null ? { search } : {}),
                        ...(searchTrackCode ? { searchTrackCode } : {}),
                        ...this.parseConvoRouteExtraParams(params),
                        ...(parentRoute && { parentRoute }),
                        ...globalParams,
                    };
                    function getPostponedParam(params) {
                        const postponedFromParams = params.get('postponed');
                        if (!postponedFromParams) {
                            return undefined;
                        }
                        const postponedCmid = Post.resolveCmid(Number(postponedFromParams));
                        if (postponedCmid > 0) {
                            return postponedCmid;
                        }
                        return true;
                    }
                }
                case 'ChannelsFolderRoute': {
                    return {
                        kind: 'ChannelsFolderRoute',
                        ...this.parseConvoRouteExtraParams(params),
                        ...globalParams,
                    };
                }
                case 'NotFoundRoute': {
                    return {
                        kind: 'NotFoundRoute',
                        ...globalParams,
                    };
                }
                case 'SettingsRoute': {
                    const backStr = params.get('back');
                    let back;
                    if (backStr) {
                        back = this.fromUrl(window.atob(backStr));
                    }
                    if (!this.featureFlags.vkm_settings_experimental &&
                        screenRoute.section === 'experimental') {
                        return {
                            ...screenRoute,
                            back,
                            ...globalParams,
                            section: 'main',
                        };
                    }
                    return {
                        ...screenRoute,
                        back,
                        ...globalParams,
                    };
                }
                case 'SpaceRoute': {
                    if (!this.featureFlags.vkm_prds) {
                        return {
                            kind: 'MainRoute',
                            ...this.parseConvoRouteExtraParams(params),
                            ...globalParams,
                        };
                    }
                    return {
                        kind: 'SpaceRoute',
                        spaceId: screenRoute.spaceId,
                        ...globalParams,
                    };
                }
                case 'SpaceRoomRoute': {
                    if (!this.featureFlags.vkm_prds) {
                        return {
                            kind: 'MainRoute',
                            ...this.parseConvoRouteExtraParams(params),
                            ...globalParams,
                        };
                    }
                    const messageCmid = params.get('cmid');
                    return {
                        kind: screenRoute.kind,
                        spaceId: screenRoute.spaceId,
                        roomId: screenRoute.roomId,
                        cmid: messageCmid
                            ? Message.resolveCmid(Number(messageCmid))
                            : undefined,
                        ...globalParams,
                    };
                }
                default:
                    exhaustivenessCheck(screenRoute);
            }
        }
        catch (error) {
            // do nothing
        }
        return {
            kind: 'NotFoundRoute',
            ...globalParams,
        };
    };
    toUrl = (route) => {
        const getParams = (query = new URLSearchParams()) => {
            const finalQuery = this.createGlobalQueryFromRoute(route, query);
            const search = [];
            for (const [key, value] of finalQuery.entries()) {
                search.push(`${key}=${encodeURIComponent(value) || ''}`);
            }
            return search.length ? `?${search.join('&')}` : '';
        };
        switch (route.kind) {
            case 'ConvoRoute': {
                const query = this.createConvoExtraParamsQueryFromRoute(route);
                if (route.search !== undefined) {
                    query.append('search', String(route.search));
                }
                if (route.highlightQuery !== undefined) {
                    query.append('highlight', route.highlightQuery);
                }
                if (route.cmid) {
                    query.append('cmid', String(route.cmid));
                }
                if (!this.featureFlags.vkm_router_modal_unification) {
                    if (route.chatJoinHash) {
                        query.append('chat_invite', route.chatJoinHash);
                    }
                    if (route.callJoinHash) {
                        query.append('call_join', route.callJoinHash);
                    }
                    if (route.callJoinId) {
                        query.append('call_id', route.callJoinId);
                    }
                }
                if (route.parentRoute) {
                    query.append('parent_route', window.btoa(this.toUrl(route.parentRoute)));
                }
                if (route.entrypoint) {
                    query.append('entrypoint', route.entrypoint);
                }
                if (route.postponed !== undefined) {
                    query.append('postponed', route.postponed.toString());
                }
                return `/convo/${route.peerId}${getParams(query)}`;
            }
            case 'ChannelsFolderRoute': {
                const query = this.createConvoExtraParamsQueryFromRoute(route);
                return `${Channel.CHANNELS_BASE_PATH}${getParams(query)}`;
            }
            case 'ChannelRoute': {
                const query = new URLSearchParams();
                if (route.commentCmid !== undefined) {
                    query.append('comment', route.commentCmid.toString());
                }
                if (route.search !== undefined) {
                    query.append('search', String(route.search));
                }
                if (route.postCmid !== undefined) {
                    query.append('cmid', route.postCmid.toString());
                }
                if (route.postponed !== undefined) {
                    query.append('postponed', route.postponed.toString());
                }
                if (route.parentRoute) {
                    query.append('parent_route', window.btoa(this.toUrl(route.parentRoute)));
                }
                if (route.edu !== undefined) {
                    query.append('edu', route.edu.toString());
                }
                if (route.entrypoint) {
                    query.append('entrypoint', route.entrypoint);
                }
                if (route.searchTrackCode) {
                    query.append('search_track_code', route.searchTrackCode);
                }
                return `${Channel.CHANNELS_BASE_PATH}/${route.channelId}${getParams(query)}`;
            }
            case 'MainRoute': {
                const query = this.createConvoExtraParamsQueryFromRoute(route);
                if (!this.featureFlags.vkm_router_modal_unification) {
                    if (route.callJoinHash) {
                        query.set('call', route.callJoinHash);
                    }
                    if (route.callJoinId) {
                        query.set('call_id', route.callJoinId);
                    }
                    if (route.chatJoinHash) {
                        query.set('chat', route.chatJoinHash);
                    }
                }
                return `/${getParams(query)}`;
            }
            case 'CallJoinRoute': {
                return `/call/join/${route.callJoinHash}${getParams()}`;
            }
            case 'CallJoinShortenedRoute': {
                return `/call/${route.callJoinId}${getParams()}`;
            }
            case 'ChatJoinRoute': {
                return `/chat/join/${route.chatJoinHash}${getParams()}`;
            }
            case 'SettingsRoute':
                const query = new URLSearchParams();
                if (route.back) {
                    query.append('back', window.btoa(this.toUrl(route.back)));
                }
                return `/settings/${route.section}` + getParams(query);
            case 'NotFoundRoute': {
                return `/${getParams()}`;
            }
            case 'SpaceRoute': {
                const url = `/space${route.spaceId}`;
                return `${url}${getParams()}`;
            }
            case 'SpaceRoomRoute': {
                const query = new URLSearchParams();
                if (route.cmid !== undefined) {
                    query.append('cmid', route.cmid.toString());
                }
                const url = `/space${route.spaceId}/room${route.roomId}`;
                return `${url}${getParams(query)}`;
            }
            default:
                exhaustivenessCheck(route);
        }
    };
    toRightPanelParam = (route) => {
        const kind = route.kind;
        switch (kind) {
            case 'PeerPanel': {
                return route.section
                    ? `peer${route.peerId}${this.routeParamsDelimiter}${route.section}`
                    : `peer${route.peerId}`;
            }
            case 'ChannelPanel': {
                return route.section
                    ? `channel${route.channelId}${this.routeParamsDelimiter}${route.section}`
                    : `channel${route.channelId}`;
            }
            case 'SpacePanel': {
                return `space${route.spaceId}`;
            }
            default:
                exhaustivenessCheck(kind);
        }
    };
    toModalParam = (route) => {
        switch (route.kind) {
            case 'MiniAppModal': {
                const query = new URLSearchParams();
                if (route.referer) {
                    query.append('vk_ref', route.referer);
                }
                if (this.featureFlags.vkm_webview_url) {
                    if (route.cmid) {
                        query.append('cmid', String(route.cmid));
                    }
                }
                else {
                    if (route.webviewUrl) {
                        query.append('webview_url', route.webviewUrl);
                    }
                }
                if (route.hash) {
                    query.append('hash', encodeURIComponent(route.hash));
                }
                if (route.sferum) {
                    query.append('sferum', String(route.sferum));
                }
                return {
                    param: `miniapp${route.miniAppId}${route.groupPeerId
                        ? `${this.routeParamsDelimiter}${route.groupPeerId}`
                        : ''}`,
                    query,
                };
            }
            case 'MiniAppCatalogModal':
                return { param: `services` };
            case 'SpaceRoomCreateModal': {
                const params = [route.spaceId];
                if (route.sectionId) {
                    params.push(route.sectionId);
                }
                return {
                    param: `space-room-create_${params.join(this.routeParamsDelimiter)}`,
                };
            }
            case 'SpaceRoomUpdateModal': {
                return {
                    param: `space-room-update_${route.spaceId}${this.routeParamsDelimiter}${route.roomId}`,
                };
            }
            case 'SpaceSectionCreateModal': {
                return {
                    param: `space-section-create${this.routeParamsDelimiter}${route.spaceId}`,
                };
            }
            case 'PollModal':
                return {
                    param: `poll${route.ownerId}${this.routeParamsDelimiter}${route.pollId}`,
                };
            case 'NewFolderModal':
                return {
                    param: `newFolder${route.peerId ? `${route.peerId}` : ''}`,
                };
            case 'EditFolderModal':
                return {
                    param: `editFolder${route.folderId}`,
                };
            case 'ImportantMessagesModal':
                return { param: `important` };
            case 'ChatInviteModal': {
                return { param: `chat_invite_${route.hash}` };
            }
            case 'CallJoinByIdModal': {
                return { param: `call_join_${route.callId}` };
            }
            case 'CallJoinByShortIdModal': {
                return { param: `call_id_${route.shortId}` };
            }
            case 'PhotoModal':
            case 'VideoModal':
                const prefix = route.kind === 'PhotoModal' ? 'photo' : 'video';
                const params = [
                    route.ownerId.toString(),
                    route.id.toString(),
                    route.accessKey || '',
                ];
                if (route.source) {
                    params.push(route.source.kind.toString());
                    switch (route.source.kind) {
                        case IRouter.RouteSourceKind.Message:
                            params.push(route.source.peerId.toString(), route.source.cmid.toString(), route.source.messageAccessKey || '', (route.source.mediaViewerItemPosition ?? 0).toString());
                            break;
                        case IRouter.RouteSourceKind.PostponedMessage:
                            params.push(route.source.peerId.toString(), route.source.cmid.toString(), route.source.messageAccessKey || '');
                            break;
                        case IRouter.RouteSourceKind.Post:
                            params.push(route.source.channelId.toString(), route.source.cmid.toString(), (route.source.mediaViewerItemPosition ?? 0).toString());
                            break;
                        case IRouter.RouteSourceKind.PostponedPost:
                            params.push(route.source.channelId.toString(), route.source.cmid.toString());
                            break;
                        case IRouter.RouteSourceKind.Comment:
                            params.push(route.source.channelId.toString(), route.source.postCmid.toString(), route.source.commentCmid.toString());
                            break;
                        case IRouter.RouteSourceKind.Composer:
                        case IRouter.RouteSourceKind.ChannelComposer:
                        case IRouter.RouteSourceKind.CommentsComposer:
                            break;
                        default:
                            exhaustivenessCheck(route.source);
                    }
                }
                return {
                    param: `${prefix}${params.join(this.routeParamsDelimiter)}`,
                };
            default:
                exhaustivenessCheck(route);
        }
    };
    parseParams = (params) => {
        const result = {};
        IRouter.globalParamsKeys.reduce((acc, param) => {
            switch (param) {
                case 'createPoll': {
                    result[param] = Boolean(params.get(param));
                    break;
                }
                case 'organiser':
                    const tab = resolveTab(params.get('tab'));
                    const folderIdRaw = params.get('folder');
                    const folderId = folderIdRaw
                        ? Folder.resolveId(Number(folderIdRaw))
                        : undefined;
                    const tagsRaw = params.get('tags');
                    const tags = tagsRaw ? Tag.resolveMask(Number(tagsRaw)) : undefined;
                    if (Number.isInteger(tags)) {
                        result.organiser = { tags };
                    }
                    else if (tab) {
                        result.organiser = {
                            filter: tab,
                            folderId,
                        };
                    }
                    break;
                case 'sferum':
                    result.sferum = params.get('sferum') === 'true';
                    break;
                case 'p':
                    const password = params.get('p');
                    if (password) {
                        result.p = password;
                    }
                    break;
                case 'modal':
                    const modals = [];
                    for (const modalParam of params.getAll('modal')) {
                        try {
                            const modal = this.parser.Modal.tryParse(modalParam);
                            if (modal.kind === 'MiniAppModal') {
                                if (params.has('hash')) {
                                    modal.hash =
                                        safeDecodeURI(params.get('hash') || '') || undefined;
                                }
                                if (params.has('vk_ref')) {
                                    modal.referer = params.get('vk_ref') || undefined;
                                }
                                if (this.featureFlags.vkm_webview_url) {
                                    if (params.get('cmid')) {
                                        modal.cmid =
                                            Message.resolveCmid(Number(params.get('cmid'))) ||
                                                undefined;
                                    }
                                }
                                else {
                                    if (params.has('webview_url')) {
                                        modal.webviewUrl = params.get('webview_url') || undefined;
                                    }
                                }
                            }
                            modals.push(modal);
                        }
                        catch (err) {
                            // do nothing
                        }
                    }
                    if (modals.length) {
                        result.modal = modals;
                    }
                    break;
                case 'rp':
                    const panels = [];
                    for (const panel of params.getAll('rp')) {
                        try {
                            panels.push(this.parser.RightPanel.tryParse(panel));
                        }
                        catch (err) {
                            // do nothing
                        }
                    }
                    if (panels.length) {
                        result.rp = panels;
                    }
                    break;
                case 'chat': {
                    if (!this.featureFlags.vkm_router_modal_unification)
                        break;
                    const hash = params.get('invite_link');
                    if (!hash)
                        break;
                    const modals = result.modal ? [...result.modal] : [];
                    modals.push({ kind: 'ChatInviteModal', hash });
                    result.modal = modals;
                    break;
                }
                case 'call': {
                    if (!this.featureFlags.vkm_router_modal_unification)
                        break;
                    const callId = params.get('call');
                    if (!callId)
                        break;
                    const modals = result.modal ? [...result.modal] : [];
                    modals.push({ kind: 'CallJoinByIdModal', callId });
                    result.modal = modals;
                    break;
                }
                case 'call_id': {
                    if (!this.featureFlags.vkm_router_modal_unification)
                        break;
                    const shortId = params.get('call_id');
                    if (!shortId)
                        break;
                    const modals = result.modal ? [...result.modal] : [];
                    modals.push({ kind: 'CallJoinByShortIdModal', shortId });
                    result.modal = modals;
                    break;
                }
                default:
                    exhaustivenessCheck(param);
            }
            return acc;
        }, {});
        return result;
    };
    parseConvoRouteExtraParams = (searchParams) => {
        return IRouter.convoRouteExtraParamsKeys.reduce((extraParams, extraParamsKey) => {
            if (searchParams.has(extraParamsKey)) {
                extraParams[extraParamsKey] = true;
            }
            return extraParams;
        }, {});
    };
    createGlobalQueryFromRoute = (route, query = new URLSearchParams()) => {
        IRouter.globalParamsKeys.forEach((extraParam) => {
            if (!(extraParam in route)) {
                return;
            }
            switch (extraParam) {
                case 'createPoll':
                case 'sferum':
                case 'p': {
                    const value = route[extraParam];
                    if (value) {
                        query.append(extraParam, value.toString());
                    }
                    else {
                        query.delete(extraParam);
                    }
                    break;
                }
                case 'organiser': {
                    const tab = route.organiser?.filter;
                    if (tab) {
                        query.append('tab', tab);
                    }
                    else {
                        query.delete('tab');
                    }
                    const folder = route.organiser?.folderId;
                    if (folder) {
                        query.append('folder', String(folder));
                    }
                    else {
                        query.delete('folder');
                    }
                    const tags = route.organiser?.tags;
                    if (tags) {
                        query.append('tags', String(tags));
                    }
                    else {
                        query.delete('tags');
                    }
                    break;
                }
                case 'modal':
                    route.modal?.forEach((modalRoute) => {
                        const value = this.toModalParam(modalRoute);
                        query.append(extraParam, value.param);
                        value.query?.forEach((val, key) => query.append(key, val));
                    });
                    break;
                case 'rp': {
                    route.rp?.forEach((rp) => {
                        const value = this.toRightPanelParam(rp);
                        query.append(extraParam, value);
                    });
                    break;
                }
                case 'call':
                case 'call_id':
                case 'chat':
                    break;
                default:
                    exhaustivenessCheck(extraParam);
            }
        });
        return query;
    };
    createConvoExtraParamsQueryFromRoute = (route, query = new URLSearchParams()) => {
        IRouter.convoRouteExtraParamsKeys.forEach((extraParam) => {
            if (!(extraParam in route)) {
                return;
            }
            if (route[extraParam]) {
                query.append(extraParam, '');
            }
            else {
                query.delete(extraParam);
            }
        });
        return query;
    };
    getAttachLink = (attach, vkDomain) => {
        switch (attach.kind) {
            case 'Audio':
                return `https://${vkDomain}/audio${attach.ownerId}_${attach.id}`;
            case 'AudioPlaylist':
                const accessKey = attach.accessKey ? `_${attach.accessKey}` : '';
                return `https://${vkDomain}/music/${attach.type}/${attach.ownerId}_${attach.id}${accessKey}`;
            case 'Artist':
                return `https://${vkDomain}/artist/${attach.id}`;
            case 'Podcast':
                return `https://${vkDomain}/im?z=podcast${attach.ownerId}_${attach.id}`;
            case 'Doc':
                return `https://${vkDomain}/doc${attach.ownerId}_${attach.id}`;
            case 'Sticker':
                return `https://${vkDomain}/stickers`;
            case 'Link':
                return attach.url;
            case 'StickerPack':
                return attach.url;
            case 'Market':
                return `https://${vkDomain}/market${attach.ownerId}?w=product${attach.ownerId}_${attach.id}`;
            case 'Gift':
                // vk.com/gifts отредиректит на страницу с подарками пира
                return `https://${vkDomain}/gifts`;
            case 'Graffiti':
                return '';
            case 'MarketAlbum':
                return `https://${vkDomain}/market${attach.ownerId}?section=album_${attach.id}`;
            case 'Poll':
                return `https://${vkDomain}/im?w=poll${attach.ownerId}_${attach.id}`;
            case 'Story':
                return `https://${vkDomain}/im?w=story${attach.ownerId}_${attach.id}/${attach.ownerId}_${attach.id}`;
            case 'Narrative':
                return `https://${vkDomain}/narrative${attach.ownerId}_${attach.id}`;
            case 'Album':
                return `https://${vkDomain}/album${attach.ownerId}_${attach.id}`;
            case 'Event':
                return `https://${vkDomain}/public${Peer.toRealId(attach.id)}`;
            case 'Article':
                try {
                    const url = new URL(attach.url);
                    url.searchParams.set('ref', 'im');
                    return url.toString();
                }
                catch {
                    return attach.url;
                }
            case 'Wall':
            case 'WallHistory':
                return `https://${vkDomain}/wall${attach.ownerId}_${attach.id}`;
            case 'WallReply':
                return (`https://${vkDomain}/wall${attach.ownerId}_${attach.postId}?reply=${attach.id}` +
                    (attach.parentsStack && attach.parentsStack.length > 0
                        ? `&thread=${attach.parentsStack.join('_')}`
                        : ''));
            case 'Normal':
                return `https://${VKCOM_DOMAIN}/im/channels/${attach.channelId}?cmid=${attach.cmid}`;
            case 'MiniApp':
            case 'MiniAppWidget':
                switch (attach.type) {
                    // Типы соответсвующие играм в миниаппах, которые должны открываться в vkcom
                    case 'app':
                    case 'game':
                    case 'html5_game':
                        return `https://${vkDomain}/${attach.appLink}`;
                    default:
                        return `https://${vkDomain}/im?w=${attach.appLink}`;
                }
            case 'DonutLink':
                return `https://${vkDomain}/donut/club${Peer.toRealId(attach.ownerId)}`;
            case 'InviteLink':
                return attach.url;
            case 'Curator':
                return attach.url;
            case 'Voice':
            case 'UgcSticker':
            case 'MoneyRequest':
            case 'MoneyTransfer':
            case 'Geo':
            case 'FinishedCall':
            case 'ActiveCall':
            case 'VideoMessage':
            case 'Widget':
            case 'Question':
            case 'ChannelStubPhoto':
            case 'ChannelStubVideo':
            case 'ChannelStubAudio':
            case 'ChannelStubDoc':
                return '';
            default:
                return exhaustivenessCheck(attach);
        }
    };
}
function resolveTab(tab) {
    switch (tab) {
        case 'adTag':
        case 'all':
        case 'archive':
        case 'unread':
        case 'businessNotify':
        case 'important':
        case 'messageRequest':
        case 'chats':
        case 'unanswered':
        case 'allChannels':
        case 'archiveChannels':
        case 'unreadChannels':
            return tab;
        default:
            return undefined;
    }
}
class StackUtils {
    route;
    constructor(route) {
        this.route = route;
    }
    mutate(stackFields) {
        return {
            ...this.route,
            ...stackFields,
        };
    }
    push = (entity) => {
        if (IRouter.isModal(entity)) {
            return this.mutate({
                modal: this._push(entity, this.route.modal),
            });
        }
        if (IRouter.isRightPanel(entity)) {
            return this.mutate({
                modal: undefined,
                /**
                 * Изначально RightPanel хотели сделать стеком,
                 * но в ходе долгих обсуждений решили так не поступать
                 * из-за проблем с логикой закрытия/сброса стека для RightPanel.
                 * Делаем перманентный replace чтобы сущность жила в единственном экземпляре.
                 *
                 * С вопросами по этому поводу обращаться к @xl, @isaev_marat или @fn
                 **/
                rp: this._replace(entity, this.route.rp),
            });
        }
        exhaustivenessCheck(entity);
    };
    replace = (entity) => {
        if (IRouter.isModal(entity)) {
            return this.mutate({
                modal: this._replace(entity, this.route.modal),
            });
        }
        if (IRouter.isRightPanel(entity)) {
            return this.mutate({
                modal: undefined,
                rp: this._replace(entity, this.route.rp),
            });
        }
        exhaustivenessCheck(entity);
    };
    pop = () => {
        for (const level of IRouter.stackableLevels) {
            switch (level) {
                case IRouter.StackableType.Modal:
                    if (this.route.modal?.length) {
                        const currentModal = this.route.modal.slice(-1).pop();
                        const clearCmid = currentModal && 'cmid' in currentModal && currentModal.cmid;
                        return this.mutate({
                            ...(clearCmid ? { cmid: undefined } : {}),
                            modal: this._pop(this.route.modal),
                        });
                    }
                    break;
                case IRouter.StackableType.RightPanel:
                    if (this.route.rp?.length) {
                        return this.mutate({
                            rp: this._pop(this.route.rp),
                        });
                    }
                    break;
                default:
                    exhaustivenessCheck(level);
            }
        }
        return this.mutate();
    };
    _push(entity, stack) {
        return (stack || []).concat(entity);
    }
    _replace(entity, stack) {
        return (stack || []).slice(0, -1).concat(entity);
    }
    _pop(stack) {
        return stack?.length && stack.length > 1 ? stack.slice(0, -1) : undefined;
    }
}
export const applyParentRouteParam = (from, to) => {
    const currentRoute = { ...from };
    const isSwitchingFromConvoToConvoRoute = currentRoute.kind === 'ConvoRoute' &&
        to.kind === 'ConvoRoute' &&
        currentRoute.peerId !== to.peerId;
    const isSwitchingFromChannelToChannelRoute = currentRoute.kind === 'ChannelRoute' &&
        to.kind === 'ChannelRoute' &&
        currentRoute.channelId !== to.channelId;
    const isSwitchingFromChannelToConvoRoute = currentRoute.kind === 'ChannelRoute' && to.kind === 'ConvoRoute';
    const isSwitchingFromConvoToChannelRoute = currentRoute.kind === 'ConvoRoute' && to.kind === 'ChannelRoute';
    if (isSwitchingFromConvoToConvoRoute ||
        isSwitchingFromChannelToChannelRoute ||
        isSwitchingFromChannelToConvoRoute ||
        isSwitchingFromConvoToChannelRoute) {
        // cmid cбрасываем (иначе вернёмся к сообщению с cmid, а не к сообщению до которого доскролили и перешли в другую беседу)
        if (currentRoute.kind === 'ConvoRoute' && currentRoute.cmid) {
            currentRoute.cmid = undefined;
        }
        // cmid cбрасываем (иначе вернёмся к сообщению с cmid, а не к сообщению до которого доскролили и перешли в другую беседу)
        if (currentRoute.kind === 'ChannelRoute' && currentRoute.postCmid) {
            currentRoute.postCmid = undefined;
        }
        return {
            ...to,
            parentRoute: currentRoute,
        };
    }
    return to;
};
//# sourceMappingURL=Router.js.map