export var VideoSuspendMode;
(function (VideoSuspendMode) {
    /** не показывать камеры/анимоджи других участников */
    VideoSuspendMode["ALWAYS"] = "always";
    /** видео потоки могут быть остановлены бэком в плохой сети */
    VideoSuspendMode["AUTO"] = "auto";
    /** стандартный режим приёма потоков, ничего не останавливать */
    VideoSuspendMode["NEVER"] = "never";
})(VideoSuspendMode || (VideoSuspendMode = {}));
export var VideoSuspendReason;
(function (VideoSuspendReason) {
    VideoSuspendReason["NETWORK"] = "network";
    VideoSuspendReason["SETTINGS"] = "settings";
})(VideoSuspendReason || (VideoSuspendReason = {}));
export var VideoResolutionTypes;
(function (VideoResolutionTypes) {
    VideoResolutionTypes["SD"] = "SD";
    VideoResolutionTypes["HD"] = "HD";
    VideoResolutionTypes["FHD"] = "FHD";
})(VideoResolutionTypes || (VideoResolutionTypes = {}));
//# sourceMappingURL=video.js.map