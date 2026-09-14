import { useBrowserEnv } from '../hooks/misc';
import { useCallback, useEffect, useState } from 'react';
export const useVoicePlayer = (voice) => {
    const { voicePlayer } = useBrowserEnv();
    const [status, setStatus] = useState('stopped');
    const [progress, setProgress] = useState(0);
    const voiceId = voice.audioTrack.id;
    const handleVoicePlayerStateUpdated = useCallback((state) => {
        if (state.currentTrackEntity?.audioTrack?.id === voiceId) {
            setStatus(state.status);
            setProgress(state.currentTrackEntity.audioTrack.progress);
        }
    }, [voiceId]);
    useEffect(() => {
        voicePlayer.subscribe('stateupdated', handleVoicePlayerStateUpdated);
        return () => {
            voicePlayer.unsubscribe('stateupdated', handleVoicePlayerStateUpdated);
        };
    }, [voice.audioTrack.id, voicePlayer, handleVoicePlayerStateUpdated]);
    // синхронизируемся с состоянием плеера при маунте
    useEffect(() => {
        handleVoicePlayerStateUpdated(voicePlayer.getState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return { voicePlayer, status, progress };
};
//# sourceMappingURL=useVoicePlayer.js.map