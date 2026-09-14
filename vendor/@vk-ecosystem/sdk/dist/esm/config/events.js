var ConfigEvents;
(function(ConfigEvents) {
    ConfigEvents["SUPERAPP_TOKEN"] = "VKSDKGeneralSuperAppToken";
    ConfigEvents["AUTH_NEEDED"] = "VKSDKGeneralAuthNeeded";
    ConfigEvents["OPEN_APP"] = "VKSDKGeneralOpenApp";
})(ConfigEvents || (ConfigEvents = {}));
var ConfigInternalEvents;
(function(ConfigInternalEvents) {
    ConfigInternalEvents["SUPERAPP_TOKEN_CHANGE_V2"] = "superAppTokenV2";
    ConfigInternalEvents["SUPERAPP_TOKEN_CHANGE"] = "superAppToken";
})(ConfigInternalEvents || (ConfigInternalEvents = {}));

export { ConfigEvents, ConfigInternalEvents };
