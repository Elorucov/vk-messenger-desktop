var ConfigAuthMode;
(function(ConfigAuthMode) {
    ConfigAuthMode["Redirect"] = 'redirect';
    ConfigAuthMode["InNewTab"] = 'new_tab';
})(ConfigAuthMode || (ConfigAuthMode = {}));
var ConfigResponseMode;
(function(ConfigResponseMode) {
    ConfigResponseMode["Redirect"] = 'redirect';
    ConfigResponseMode["Callback"] = 'callback';
})(ConfigResponseMode || (ConfigResponseMode = {}));

export { ConfigAuthMode, ConfigResponseMode };
