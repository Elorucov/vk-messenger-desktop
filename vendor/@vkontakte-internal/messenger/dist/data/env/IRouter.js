import { exhaustivenessCheck } from '../../core/utils/misc';
export var IRouter;
(function (IRouter) {
    let Action;
    (function (Action) {
        Action["Push"] = "PUSH";
        Action["Replace"] = "REPLACE";
        Action["Pop"] = "POP";
    })(Action = IRouter.Action || (IRouter.Action = {}));
    let StackableType;
    (function (StackableType) {
        StackableType["Modal"] = "MODAL";
        StackableType["RightPanel"] = "RIGHT_PANEL";
    })(StackableType = IRouter.StackableType || (IRouter.StackableType = {}));
    let PlainRouteType;
    (function (PlainRouteType) {
        PlainRouteType["Screen"] = "SCREEN";
        PlainRouteType["Proxy"] = "PROXY";
        PlainRouteType["Runtime"] = "RUNTIME";
    })(PlainRouteType = IRouter.PlainRouteType || (IRouter.PlainRouteType = {}));
    IRouter.stackableLevels = [
        StackableType.Modal,
        StackableType.RightPanel,
    ];
    IRouter.SettingsRouteSectionKeys = [
        'main',
        'account',
        'folders',
        'notifications',
        'theme',
        'experimental',
        'about',
        'edu',
        'schedule',
        'achievements',
        'privacy',
    ];
    IRouter.PeerPanelTabKeys = [
        'members',
        'invitations',
        'photos',
        'audios',
        'videos',
        'docs',
        'links',
    ];
    IRouter.ChannelPanelSectionKeys = ['settings'];
    let RouteSourceKind;
    (function (RouteSourceKind) {
        RouteSourceKind[RouteSourceKind["Message"] = 0] = "Message";
        RouteSourceKind[RouteSourceKind["PostponedMessage"] = 1] = "PostponedMessage";
        RouteSourceKind[RouteSourceKind["Post"] = 2] = "Post";
        RouteSourceKind[RouteSourceKind["PostponedPost"] = 3] = "PostponedPost";
        RouteSourceKind[RouteSourceKind["Composer"] = 4] = "Composer";
        RouteSourceKind[RouteSourceKind["Comment"] = 5] = "Comment";
        RouteSourceKind[RouteSourceKind["ChannelComposer"] = 6] = "ChannelComposer";
        RouteSourceKind[RouteSourceKind["CommentsComposer"] = 7] = "CommentsComposer";
    })(RouteSourceKind = IRouter.RouteSourceKind || (IRouter.RouteSourceKind = {}));
    IRouter.globalParamsKeys = [
        'organiser',
        'createPoll',
        'sferum',
        'modal',
        'rp',
        'p',
        'call_id',
        'call',
        'chat',
    ];
    IRouter.convoRouteExtraParamsKeys = [
        'settings',
    ];
    /**
     * Роуты поддерживающие работу с ConvoRouteExtraParams
     * */
    IRouter.withExtraConvoParams = (route) => {
        return (route.kind === 'MainRoute' ||
            route.kind === 'ConvoRoute' ||
            route.kind === 'ChannelRoute' ||
            route.kind === 'ChannelsFolderRoute');
    };
    IRouter.isEnabledWithCommunity = (route) => {
        if (route.kind === 'ConvoRoute' && route.chatJoinHash) {
            return false;
        }
        if (route.kind === 'PeerPanel' ||
            route.kind === 'ConvoRoute' ||
            route.kind === 'MainRoute' ||
            route.kind === 'NotFoundRoute') {
            return true;
        }
        return false;
    };
    IRouter.isStackable = (entity) => {
        return IRouter.isModal(entity) || IRouter.isRightPanel(entity);
    };
    IRouter.isModal = (entity) => getEntityType(entity) === StackableType.Modal;
    IRouter.isRightPanel = (entity) => getEntityType(entity) === StackableType.RightPanel;
    IRouter.isProxyRoute = (entity) => getEntityType(entity) === PlainRouteType.Proxy;
    IRouter.isRuntimeRoute = (entity) => entity ? getEntityType(entity) === PlainRouteType.Runtime : false;
    function getEntityType(route) {
        switch (route.kind) {
            case 'MainRoute':
            case 'ConvoRoute':
            case 'CallJoinRoute':
            case 'CallJoinShortenedRoute':
            case 'ChannelRoute':
            case 'ChannelsFolderRoute':
            case 'ChatJoinRoute':
            case 'NotFoundRoute':
            case 'SettingsRoute':
            case 'SpaceRoute':
            case 'SpaceRoomRoute':
                return PlainRouteType.Screen;
            case 'AttachProxyRoute':
            case 'AttachMediaProxyRoute':
            case 'HashtagProxyRoute':
            case 'ChatJoinProxyRoute':
            case 'HashtagMentionProxyRoute':
            case 'ScreenNameProxyRoute':
            case 'VkProxyRoute':
            case 'StickerPackProxyRoute':
            case 'StickersStoreProxyRoute':
            case 'GiftsCatalogProxyRoute':
            case 'GiftDetailsProxyRoute':
            case 'VmojiAvatarModelProxyRoute':
            case 'SferumChannelProxyRoute':
            case 'CommunityChannelProxyRoute':
            case 'CallJoinProxyRoute':
            case 'CallJoinShortenedProxyRoute':
            case 'ChannelJoinProxyRoute':
                return PlainRouteType.Proxy;
            case 'ModalMessageRuntimeRoute':
            case 'EmptyRuntimeRoute':
            case 'AudioRestrictionRuntimeRoute':
            case 'SferumMigrateToMaxRoute':
            case 'RedirectRuntimeRoute':
                return PlainRouteType.Runtime;
            case 'PhotoModal':
            case 'VideoModal':
            case 'MiniAppModal':
            case 'PollModal':
            case 'NewFolderModal':
            case 'EditFolderModal':
            case 'ImportantMessagesModal':
            case 'MiniAppCatalogModal':
            case 'SpaceRoomCreateModal':
            case 'SpaceSectionCreateModal':
            case 'SpaceRoomUpdateModal':
            case 'ChatInviteModal':
            case 'CallJoinByIdModal':
            case 'CallJoinByShortIdModal':
                return StackableType.Modal;
            case 'PeerPanel':
            case 'ChannelPanel':
            case 'SpacePanel':
                return StackableType.RightPanel;
            default:
                exhaustivenessCheck(route);
        }
    }
})(IRouter || (IRouter = {}));
//# sourceMappingURL=IRouter.js.map