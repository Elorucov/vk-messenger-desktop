import React, { useEffect, useState } from 'react';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { AVAILABLE_PLAYBACK_RATES, ConvoPlayer, getUserFriendlyTimestamp, useCanSkipForwardAndBackward, } from '../../ui/ConvoPlayer/ConvoPlayer';
import { useNow } from '../../hooks/useNow';
export const ConvoVoicePlayer = ({ onDescriptionClick, }) => {
    const { voicePlayer, lang } = useBrowserEnv();
    const now = useNow();
    const peers = usePeers();
    const [playerState, setPlayerState] = useState(voicePlayer.getState());
    const { status, shuffle, repeatMode, volume, currentTrackEntity, playlist, mute, playbackRate, } = playerState;
    const currentAudioTrack = currentTrackEntity?.audioTrack;
    const { canSkipBackward, canSkipForward } = useCanSkipForwardAndBackward(shuffle, repeatMode, currentTrackEntity, playlist);
    useEffect(() => {
        voicePlayer.subscribe('stateupdated', setPlayerState);
        return () => {
            voicePlayer.unsubscribe('stateupdated', setPlayerState);
        };
    }, [voicePlayer]);
    if (!currentAudioTrack) {
        return null;
    }
    const handleGoToMessage = () => {
        if (currentTrackEntity.kind === 'RecordedConvoVoiceTrack') {
            return;
        }
        const { source } = currentTrackEntity;
        onDescriptionClick(source);
    };
    const authorPeer = currentTrackEntity.authorId
        ? Peer.safeGet(peers, currentTrackEntity.authorId)
        : undefined;
    const authorName = authorPeer ? Peer.name(authorPeer) : '';
    const { duration, progress } = currentAudioTrack;
    const sentAt = currentTrackEntity.kind === 'MessagedConvoVoiceTrack'
        ? currentTrackEntity.sentAt
        : undefined;
    const restedTime = duration * (1 - progress);
    const timestamp = sentAt ? getUserFriendlyTimestamp(lang, now, sentAt) : '';
    const handleSkipBack = canSkipBackward
        ? () => {
            voicePlayer.playPrev(currentTrackEntity, playlist);
        }
        : undefined;
    const handleSkipForward = canSkipForward
        ? () => {
            voicePlayer.playNext(currentTrackEntity, playlist);
        }
        : undefined;
    return (React.createElement(ConvoPlayer, { progress: progress, status: status, volume: volume, restedTime: restedTime, duration: duration, title: authorName, subTitle: timestamp, isMuted: mute, playbackRate: playbackRate, availablePlaybackRates: AVAILABLE_PLAYBACK_RATES, onPlay: () => {
            voicePlayer.play(currentTrackEntity, playlist);
        }, onPause: () => {
            voicePlayer.pause();
        }, onVolumeChange: (val) => voicePlayer.setVolume(val), onCancelClick: () => {
            voicePlayer.stopPlayer();
        }, onSkipForward: handleSkipForward, onSkipBack: handleSkipBack, onMute: (val) => voicePlayer.setMute(val), onProgressChange: (val) => voicePlayer.seek(val), onDescriptionClick: handleGoToMessage, onPlaybackRateChange: (val) => voicePlayer.setPlaybackRate(val) }));
};
//# sourceMappingURL=ConvoVoicePlayer.js.map