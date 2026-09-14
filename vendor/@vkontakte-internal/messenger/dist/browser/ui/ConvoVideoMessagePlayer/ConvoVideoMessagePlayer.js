import React, { useCallback, useEffect, useState } from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { VideoMessagePlayerEventTypes, } from '../../../data/env/IPlayer';
import { AVAILABLE_PLAYBACK_RATES, ConvoPlayer, getUserFriendlyTimestamp, } from '../../ui/ConvoPlayer/ConvoPlayer';
import { useNow } from '../../hooks/useNow';
export const ConvoVideoMessagePlayer = () => {
    const { lang, videoMessagePlayer } = useBrowserEnv();
    const peers = usePeers();
    const now = useNow();
    const videoMessagePlayerState = videoMessagePlayer.getState();
    const [status, setStatus] = useState(videoMessagePlayerState.status);
    const [progress, setProgress] = useState(videoMessagePlayerState.currentVideoMessageTrack?.progress ?? 0);
    const [volume, setVolume] = useState(videoMessagePlayerState.settings.volume * 100);
    const [playbackRate, setPlaybackRate] = useState(videoMessagePlayerState.settings.playbackRate);
    const [muted, setMuted] = useState(videoMessagePlayerState.settings.muted);
    const restedTime = (videoMessagePlayerState.currentVideoMessageTrack?.duration ?? 0) *
        (1 - progress);
    const changeVolume = useCallback((volume) => {
        videoMessagePlayer.setVolume(volume / 100);
    }, [videoMessagePlayer]);
    const changePlaybackRate = useCallback((rate) => {
        videoMessagePlayer.setPlaybackRate(rate);
    }, [videoMessagePlayer]);
    const changeMuted = useCallback((value) => {
        videoMessagePlayer.setMuted(value);
    }, [videoMessagePlayer]);
    const handleSeekChange = useCallback((value) => {
        videoMessagePlayer.setProgress(value);
    }, [videoMessagePlayer]);
    const handleVideoMessagePlayerStateUpdated = useCallback((state) => {
        setProgress(state.currentVideoMessageTrack?.progress || 0);
        setStatus(state.status);
        volume !== state.settings.volume && setVolume(state.settings.volume * 100);
        playbackRate !== state.settings.playbackRate &&
            setPlaybackRate(state.settings.playbackRate);
        muted !== state.settings.muted && setMuted(state.settings.muted);
    }, [volume, playbackRate, muted]);
    useEffect(() => {
        videoMessagePlayer.subscribe(VideoMessagePlayerEventTypes.STATE_UPDATED, handleVideoMessagePlayerStateUpdated);
        return () => {
            videoMessagePlayer.unsubscribe(VideoMessagePlayerEventTypes.STATE_UPDATED, handleVideoMessagePlayerStateUpdated);
        };
    }, [videoMessagePlayer, handleVideoMessagePlayerStateUpdated]);
    const move = (backward) => videoMessagePlayer.move(backward);
    if (!videoMessagePlayerState.currentVideoMessageTrack ||
        !videoMessagePlayerState.currentVideoMessageTrack.messageAuthorId ||
        !videoMessagePlayerState.currentVideoMessageTrack.messageSentAt) {
        return null;
    }
    const author = Peer.safeGet(peers, videoMessagePlayerState.currentVideoMessageTrack.messageAuthorId);
    const sendTime = getUserFriendlyTimestamp(lang, now, videoMessagePlayerState.currentVideoMessageTrack.messageSentAt);
    return (React.createElement(ConvoPlayer, { progress: progress, status: status, volume: volume, restedTime: restedTime, playbackRate: playbackRate, isMuted: muted, title: Peer.name(author), subTitle: sendTime, availablePlaybackRates: AVAILABLE_PLAYBACK_RATES, onPlay: () => {
            videoMessagePlayer.resume();
        }, onPause: () => {
            videoMessagePlayer.pause();
        }, onVolumeChange: changeVolume, onCancelClick: () => {
            videoMessagePlayer.stop();
        }, onSkipForward: () => move(false), onSkipBack: () => move(true), onDescriptionClick: () => {
            videoMessagePlayer.scrollToMessage();
        }, onPlaybackRateChange: changePlaybackRate, onProgressChange: handleSeekChange, onMute: changeMuted }));
};
//# sourceMappingURL=ConvoVideoMessagePlayer.js.map