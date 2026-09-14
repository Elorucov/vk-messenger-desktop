export var CallStatFailReason;
(function (CallStatFailReason) {
    CallStatFailReason["REMOTE_NO_CONNECT"] = "push_not_delivered";
    CallStatFailReason["REMOTE_FAILED_ACCEPT"] = "cant_connect";
    CallStatFailReason["REMOTE_DECLINE"] = "declined_remote";
    CallStatFailReason["LOCAL_DECLINE"] = "declined_local";
    CallStatFailReason["REMOTE_TIMEOUT"] = "declined_timeout";
    CallStatFailReason["REMOTE_BUSY"] = "busy";
    CallStatFailReason["CONNECTION_LOST"] = "lost_connection";
})(CallStatFailReason || (CallStatFailReason = {}));
export var CallStatReachedType;
(function (CallStatReachedType) {
    CallStatReachedType["AUDIO"] = "ok_audio";
    CallStatReachedType["AUDIO_TO_VIDEO"] = "ok_video";
    CallStatReachedType["VIDEO"] = "ok_started_as_video";
    CallStatReachedType["GROUP_AUDIO"] = "group_audio";
    CallStatReachedType["GROUP_AUDIO_TO_VIDEO"] = "group_video";
    CallStatReachedType["GROUP_VIDEO"] = "group_started_as_video";
    // AUDIO_TO_VIDEO_WITH_MASK = 'video_with_mask',
    // VIDEO_WITH_MASK = 'started_as_video_with_mask',
})(CallStatReachedType || (CallStatReachedType = {}));
export var CallStatResult;
(function (CallStatResult) {
    CallStatResult["SUCCESS"] = "success";
    CallStatResult["FAIL"] = "fail";
})(CallStatResult || (CallStatResult = {}));
//# sourceMappingURL=statlogs.js.map