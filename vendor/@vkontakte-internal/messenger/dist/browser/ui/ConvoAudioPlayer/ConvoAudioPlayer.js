import React, { useEffect, useState } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { AVAILABLE_PLAYBACK_RATES, ConvoPlayer, useCanSkipForwardAndBackward, } from '../../ui/ConvoPlayer/ConvoPlayer';
export const ConvoAudioPlayer = ({ onDescriptionClick, }) => {
    const { player } = useBrowserEnv();
    const [playerState, setPlayerState] = useState(player.getState());
    const { status, volume, currentTrackEntity, playlist, mute, shuffle, repeatMode, } = playerState;
    const { canSkipBackward, canSkipForward } = useCanSkipForwardAndBackward(shuffle, repeatMode, currentTrackEntity, playlist);
    const handleGoToMessage = () => {
        if (!currentTrackEntity) {
            return;
        }
        const { source } = currentTrackEntity;
        onDescriptionClick(source);
    };
    useEffect(() => {
        player.subscribe('stateupdated', setPlayerState);
        return () => {
            player.unsubscribe('stateupdated', setPlayerState);
        };
    }, [player]);
    const currentAudioTrack = currentTrackEntity?.audioTrack;
    if (!currentAudioTrack) {
        return null;
    }
    const { duration, progress } = currentAudioTrack;
    const { title, artist, thumb } = currentTrackEntity;
    const restedTime = duration * (1 - progress);
    const handleSkipBack = canSkipBackward
        ? () => {
            player.playPrev(currentTrackEntity, playlist);
        }
        : undefined;
    const handleSkipForward = canSkipForward
        ? () => {
            player.playNext(currentTrackEntity, playlist);
        }
        : undefined;
    return (React.createElement(ConvoPlayer, { progress: progress, status: status, volume: volume, restedTime: restedTime, duration: duration, title: title, subTitle: artist, isMuted: mute, thumb: thumb, isShuffled: shuffle, repeatMode: repeatMode, availablePlaybackRates: AVAILABLE_PLAYBACK_RATES, onPlay: () => {
            player.play(currentTrackEntity, playlist);
        }, onPause: () => {
            player.pause();
        }, onVolumeChange: (val) => player.setVolume(val), onCancelClick: () => {
            player.stopPlayer();
        }, onSkipForward: handleSkipForward, onSkipBack: handleSkipBack, onMute: (val) => player.setMute(val), onProgressChange: (val) => player.seek(val), onShuffle: (val) => player.setShuffle(val), onRepeatModeChange: (val) => player.setRepeatMode(val), onDescriptionClick: handleGoToMessage }));
};
//# sourceMappingURL=ConvoAudioPlayer.js.map