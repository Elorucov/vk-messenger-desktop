import VKBridge from '@vkontakte/vk-bridge';
export var Scope;
(function (Scope) {
    Scope["WALL"] = "wall";
    Scope["DOCS"] = "docs";
    Scope["STATS"] = "stats";
    Scope["VIDEO"] = "video";
    Scope["PAGES"] = "pages";
    Scope["NOTES"] = "notes";
    Scope["MANAGE"] = "manage";
    Scope["MARKET"] = "market";
    Scope["PHOTOS"] = "photos";
    Scope["STATUS"] = "status";
    Scope["GROUPS"] = "groups";
    Scope["OFFLINE"] = "offline";
    Scope["STORIES"] = "stories";
    Scope["FRIENDS"] = "friends";
    Scope["MESSAGES"] = "messages";
    Scope["APP_WIDGET"] = "app_widget";
})(Scope || (Scope = {}));
export function getBridgeAccessToken({ appId, scope = [] }) {
    return VKBridge.send('VKWebAppGetAuthToken', {
        app_id: appId,
        scope: String(scope),
    })
        .then(({ access_token }) => access_token);
}
//# sourceMappingURL=getBridgeAccessToken.js.map