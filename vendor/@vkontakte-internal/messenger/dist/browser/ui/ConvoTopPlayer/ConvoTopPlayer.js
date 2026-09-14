import { useBrowserEnv } from '../../hooks/misc';
import { VideoMessagePlayerEventTypes, } from '../../../data/env/IPlayer';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConvoAudioPlayer } from '../../ui/ConvoAudioPlayer/ConvoAudioPlayer';
import { ConvoVideoMessagePlayer } from '../../ui/ConvoVideoMessagePlayer/ConvoVideoMessagePlayer';
import { ConvoVoicePlayer } from '../../ui/ConvoVoicePlayer/ConvoVoicePlayer';
import { ConvoVideoMessagesPlaylistProvider } from '../../ui/Playlists/ConvoVideoMessagesPlaylistContext';
export const ConvoTopPlayer = ({ convo, type, goToMessage }) => {
    switch (type) {
        case 'video': {
            return (React.createElement(ConvoVideoMessagesPlaylistProvider, { convo: convo },
                React.createElement(ConvoVideoMessagePlayer, null)));
        }
        case 'voice': {
            return (React.createElement(ConvoVoicePlayer, { onDescriptionClick: (source) => source && goToMessage(source.peerId, 'voice_player', source.cmid) }));
        }
        case 'audio': {
            return (React.createElement(ConvoAudioPlayer, { onDescriptionClick: (source) => source?.kind === 'message' &&
                    goToMessage(source.peerId, 'audio_player', source.cmid) }));
        }
        default:
            return null;
    }
};
export const useActiveConvoTopPlayerType = (convo) => {
    const { voicePlayer, videoMessagePlayer, player } = useBrowserEnv();
    const [isVideoMessagePlayerPlaying, setIsVideoMessagePlayerPlaying] = useState(() => videoMessagePlayer.getState().status === 'playing');
    const [isVoicePlayerPlaying, setIsVoicePlayerPlaying] = useState(() => voicePlayer.getState().status === 'playing');
    const [isAudioPlayerPlaying, setIsAudioPlayerPlaying] = useState(() => player.getState().status === 'playing');
    const [isVideoMessagePlayerHasTrack, setIsVideoMessagePlayerHasTrack] = useState(() => !!videoMessagePlayer.getState().currentVideoMessageTrack);
    const [isVoicePlayerHasTrack, setIsVoicePlayerHasTrack] = useState(() => !!voicePlayer.getState().currentTrackEntity);
    const [isAudioPlayerHasTrack, setIsAudioPlayerHasTrack] = useState(() => !!player.getState().currentTrackEntity);
    const [videoMessagePlayerConvoPeerId, setVideoMessagePlayerConvoPeerId] = useState(() => videoMessagePlayer.getState().convoPeerId);
    const isAudioPlayerPlayingRef = useRef(isAudioPlayerPlaying);
    isAudioPlayerPlayingRef.current = isAudioPlayerPlaying;
    const isAudioPlayerHasTrackRef = useRef(isAudioPlayerHasTrack);
    isAudioPlayerHasTrackRef.current = isAudioPlayerHasTrack;
    useEffect(() => {
        const handleStateUpdate = (state) => {
            const isPlaying = state.status === 'playing';
            const hasTrack = !!state.currentTrackEntity;
            if (isAudioPlayerPlayingRef.current !== isPlaying) {
                setIsAudioPlayerPlaying(isPlaying);
            }
            if (isAudioPlayerHasTrackRef.current !== hasTrack) {
                setIsAudioPlayerHasTrack(hasTrack);
            }
        };
        player.subscribe('stateupdated', handleStateUpdate);
        return () => player.unsubscribe('stateupdated', handleStateUpdate);
    }, [player]);
    const isVoicePlayerPlayingRef = useRef(isVoicePlayerPlaying);
    isVoicePlayerPlayingRef.current = isVoicePlayerPlaying;
    const isVoicePlayerHasTrackRef = useRef(isVoicePlayerHasTrack);
    isVoicePlayerHasTrackRef.current = isVoicePlayerHasTrack;
    useEffect(() => {
        const handleStateUpdate = (state) => {
            const isPlaying = state.status === 'playing';
            const hasTrack = !!state.currentTrackEntity;
            if (isVoicePlayerPlayingRef.current !== isPlaying) {
                setIsVoicePlayerPlaying(isPlaying);
            }
            if (isVoicePlayerHasTrackRef.current !== hasTrack) {
                setIsVoicePlayerHasTrack(hasTrack);
            }
        };
        voicePlayer.subscribe('stateupdated', handleStateUpdate);
        return () => voicePlayer.unsubscribe('stateupdated', handleStateUpdate);
    }, [voicePlayer]);
    const isVideoMessagePlayerPlayingRef = useRef(isVideoMessagePlayerPlaying);
    isVideoMessagePlayerPlayingRef.current = isVideoMessagePlayerPlaying;
    const isVideoMessagePlayerHasTrackRef = useRef(isVideoMessagePlayerHasTrack);
    isVideoMessagePlayerHasTrackRef.current = isVideoMessagePlayerHasTrack;
    const videoMessagePlayerConvoPeerIdRef = useRef(videoMessagePlayerConvoPeerId);
    videoMessagePlayerConvoPeerIdRef.current = videoMessagePlayerConvoPeerId;
    useEffect(() => {
        const handleStateUpdate = (state) => {
            const isPlaying = state.status === 'playing';
            const hasTrack = !!state.currentVideoMessageTrack;
            const convoPeerId = state.convoPeerId;
            if (isVideoMessagePlayerPlayingRef.current !== isPlaying) {
                setIsVideoMessagePlayerPlaying(isPlaying);
            }
            if (isVideoMessagePlayerHasTrackRef.current !== hasTrack) {
                setIsVideoMessagePlayerHasTrack(hasTrack);
            }
            if (videoMessagePlayerConvoPeerIdRef.current !== convoPeerId) {
                setVideoMessagePlayerConvoPeerId(convoPeerId);
            }
        };
        videoMessagePlayer.subscribe(VideoMessagePlayerEventTypes.STATE_UPDATED, handleStateUpdate);
        return () => videoMessagePlayer.unsubscribe(VideoMessagePlayerEventTypes.STATE_UPDATED, handleStateUpdate);
    }, [videoMessagePlayer]);
    const orderedTopPlayers = useRef([]);
    const videoMessagePlayerAvailable = convo
        ? videoMessagePlayerConvoPeerId === convo.peerId
        : false;
    const currentTopPlayerType = useMemo(() => {
        const topPlayersTracks = {
            video: isVideoMessagePlayerHasTrack,
            voice: isVoicePlayerHasTrack,
            audio: isAudioPlayerHasTrack,
        };
        const topPlayersPlaying = {
            video: isVideoMessagePlayerPlaying,
            voice: isVoicePlayerPlaying,
            audio: isAudioPlayerPlaying,
        };
        // убедиться, что все плееры, которые имеют дорожку "заряженую" в плеер присутствуют в списке
        Object.entries(topPlayersTracks).forEach(([playerType, hasTrack]) => {
            if (hasTrack &&
                !orderedTopPlayers.current.includes(playerType)) {
                orderedTopPlayers.current.push(playerType);
            }
        });
        // убрать плееры, которые не "заряжены" дорожкой в текущий момент
        orderedTopPlayers.current = orderedTopPlayers.current.filter((playerType) => topPlayersTracks[playerType]);
        // поднять текущий играющий плеер в топ
        orderedTopPlayers.current = orderedTopPlayers.current.sort((playerTypeA, playerTypeB) => Number(topPlayersPlaying[playerTypeB]) -
            Number(topPlayersPlaying[playerTypeA]));
        // отобразить топ-1 плеер
        // так же не отображаем видеоплеер в "чужой" беседе (он пока не расчитан на возможность управляться не из беседы, в которой он был запущен)
        return orderedTopPlayers.current.filter((playerType) => playerType === 'video'
            ? videoMessagePlayerAvailable && topPlayersTracks[playerType]
            : true)[0];
    }, [
        isAudioPlayerHasTrack,
        isAudioPlayerPlaying,
        isVideoMessagePlayerHasTrack,
        isVideoMessagePlayerPlaying,
        isVoicePlayerHasTrack,
        isVoicePlayerPlaying,
        videoMessagePlayerAvailable,
    ]);
    return currentTopPlayerType;
};
//# sourceMappingURL=ConvoTopPlayer.js.map