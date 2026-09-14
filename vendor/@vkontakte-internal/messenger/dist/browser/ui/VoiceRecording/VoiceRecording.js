import '../../ui/VoiceRecording/VoiceRecording.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { useFluidWave } from '../../hooks/useFluidWave';
import cx from 'classnames';
import { formatDuration } from '../../../core/utils/misc';
import { Icon16Pause, Icon16Play } from '@vkontakte/icons';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { useVoicePlayer } from '../../hooks/useVoicePlayer';
import { getAudioWave } from '../../utils/audio';
import { toRecordedConvoVoiceTrack } from '../../env/AudioPlayer/ConvoVoicesPlaylist';
const TOOLTIPS_APPEARING_DELAY = 1000;
export const VoiceRecording = ({ voice, children, }) => {
    const { id: viewerId } = useViewer();
    const { duration = 0, waveform = [] } = voice || {};
    const blob = voice !== undefined && 'blob' in voice ? voice.blob : undefined;
    const isUploaded = voice !== undefined && 'kind' in voice && voice.kind === 'Voice';
    const [status, setStatus] = useState('stopped');
    const [progress, setProgress] = useState(0);
    const track = useMemo(() => blob
        ? mapBlobIntoConvoVoiceTrack(blob, duration, 0, viewerId)
        : isUploaded
            ? toRecordedConvoVoiceTrack(0, voice, viewerId)
            : undefined, [blob, duration, isUploaded, viewerId, voice]);
    useEffect(() => () => {
        /**
         * Очищаем таблицу objectURL для этого урла.
         * Зачем: https://stackoverflow.com/a/49346614
         * Если там другая ссылка вместо objectURL,
         * то ничего не произойдет
         */
        if (track) {
            URL.revokeObjectURL(track.audioTrack.url);
        }
    }, [track]);
    const canPlay = useMemo(() => (blob && new Audio().canPlayType(blob.type) !== '') || isUploaded, [blob, isUploaded]);
    const strokeW = 2;
    const height = 21;
    const density = 1 / 2;
    const { waveWidth, waveCurve, isMeasuringActive, $container } = useFluidWave(duration, waveform, strokeW, height, density, true);
    /**
     * Добавить пустую волну на фон, чтобы избавиться от мерцания в момент,
     * когда волна не имеет достаточной длины, чтобы заполнить весь контейнер.
     */
    const emptyLine = useMemo(() => getAudioWave([], 1, strokeW, 2, height), []);
    const isPlaying = status === 'playing';
    const isAfoot = isPlaying || status === 'paused';
    const formattedDuration = formatDuration(duration || 1);
    return (React.createElement("div", { className: cx('VoiceRecording', {
            'VoiceRecording--active': isAfoot,
            'VoiceRecording--playing': isPlaying,
        }) },
        track && canPlay ? (React.createElement(RecordedVoice, { onProgressChanged: setProgress, onStatusChanged: setStatus, track: track }, children)) : (React.createElement("div", { className: "VoiceRecording__adornment" }, children)),
        React.createElement("div", { className: "VoiceRecording__track", ref: $container }, !isMeasuringActive && (React.createElement(React.Fragment, null,
            React.createElement("svg", { className: "VoiceRecording__svg VoiceRecording__svg--shadow", width: waveWidth, height: height, strokeWidth: strokeW, style: isAfoot
                    ? {
                        clipPath: `inset(0 ${(1 - progress) * waveWidth}px 0 0)`,
                    }
                    : undefined },
                React.createElement("path", { className: "VoiceRecording__progress", d: isAfoot ? waveCurve : emptyLine })),
            React.createElement("svg", { className: "VoiceRecording__svg", width: waveWidth, height: height, strokeWidth: strokeW },
                React.createElement("path", { className: "VoiceRecording__path", d: waveCurve }))))),
        React.createElement("div", { className: "VoiceRecording__duration", style: { width: formattedDuration.length + 'ch' } }, isAfoot
            ? formatDuration(Math.floor(duration * progress))
            : formattedDuration)));
};
function mapBlobIntoConvoVoiceTrack(blob, duration, progress, viewerId) {
    const localId = Math.random();
    return {
        kind: 'RecordedConvoVoiceTrack',
        authorId: viewerId,
        audioTrack: {
            duration: duration,
            progress,
            url: URL.createObjectURL(blob),
            id: String(localId),
        },
    };
}
const RecordedVoice = ({ track: trackEntity, children, onProgressChanged, onStatusChanged }) => {
    const { voicePlayer, status, progress } = useVoicePlayer(trackEntity);
    const { lang } = useBrowserEnv();
    useEffect(() => onProgressChanged(progress), [onProgressChanged, progress]);
    useEffect(() => onStatusChanged(status), [onStatusChanged, status]);
    const isPlaying = status === 'playing';
    const toggle = useCallback(() => {
        if (status === 'playing') {
            voicePlayer.pause();
        }
        else {
            voicePlayer.play({
                ...trackEntity,
                audioTrack: { ...trackEntity.audioTrack, progress },
            });
        }
    }, [status, voicePlayer, trackEntity, progress]);
    useEffect(() => () => {
        onProgressChanged(0);
        onStatusChanged('stopped');
        voicePlayer.stopPlayer();
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    return (React.createElement("div", { className: "VoiceRecording__buttons" },
        children,
        React.createElement("button", { className: cx('VoiceRecording__play', {
                'VoiceRecording__play--withMargin': !!children,
            }), onClick: toggle, "aria-label": lang.use('me_composer_play_recording_label') },
            React.createElement(Tooltip, { content: isPlaying
                    ? lang.use('me_voice_recording_pause_tooltip')
                    : lang.use('me_voice_recording_play_tooltip'), align: "center", position: "top", delay: TOOLTIPS_APPEARING_DELAY },
                React.createElement("i", { role: "img", className: "Composer__buttonIcon" }, isPlaying ? React.createElement(Icon16Pause, null) : React.createElement(Icon16Play, null))))));
};
//# sourceMappingURL=VoiceRecording.js.map