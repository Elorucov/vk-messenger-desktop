export var PlayerEventTypes;
(function (PlayerEventTypes) {
    PlayerEventTypes["STATE_UPDATED"] = "stateupdated";
    PlayerEventTypes["START_NEW_TRACK"] = "startNewTrack";
    PlayerEventTypes["START_NEXT_TRACK"] = "startNextTrack";
    PlayerEventTypes["START_PREV_TRACK"] = "startPrevTrack";
    PlayerEventTypes["RESUME_TRACK"] = "resumeTrack";
    PlayerEventTypes["START_NEXT_TRACK_AUTOMATICALLY"] = "startNextTrackAutomatically";
    PlayerEventTypes["STOP_CURRENT_TRACK_AUTOMATICALLY"] = "stopCurrentTrackAutomatically";
    PlayerEventTypes["PLAYLIST_ENDED"] = "playlistEnded";
    PlayerEventTypes["STOP_CURRENT_TRACK_BEFORE_STARTING_NEW_TRACK"] = "stopCurrentTrackBeforeStartingNewTrack";
    PlayerEventTypes["STOP_CURRENT_TRACK_BY_ERROR"] = "stopCurrentTrackByError";
    PlayerEventTypes["PAUSE_CURRENT_TRACK"] = "pauseCurrentTrack";
})(PlayerEventTypes || (PlayerEventTypes = {}));
export var VideoMessagePlayerEventTypes;
(function (VideoMessagePlayerEventTypes) {
    VideoMessagePlayerEventTypes["SCROLL_TO_MESSAGE"] = "scrollToMessage";
    VideoMessagePlayerEventTypes["STATE_UPDATED"] = "stateUpdated";
})(VideoMessagePlayerEventTypes || (VideoMessagePlayerEventTypes = {}));
//# sourceMappingURL=IPlayer.js.map