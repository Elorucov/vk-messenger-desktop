import '../../ui/AttachVoice/AttachVoice.css';
import React, { useCallback, useEffect, useRef, useState, useContext, } from 'react';
import { formatDuration, isSameYear } from '../../../core/utils/misc';
import { browser } from '../../utils/misc';
import * as Message from '../../../core/model/Message';
import { useBrowserEnv, useOwner, usePrevious } from '../../hooks/misc';
import cx from 'classnames';
import { Icon20ChevronUpOutline, Icon16Text } from '@vkontakte/icons';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { ConvoVoicesPlaylistContext } from '../../ui/Playlists/ConvoVoicesPlaylistContext';
import { useFluidWave } from '../../hooks/useFluidWave';
import { useVoicePlayer } from '../../hooks/useVoicePlayer';
import { toMessagedConvoVoiceTrackFromMessage } from '../../env/AudioPlayer/ConvoVoicesPlaylist';
import { RangeInput } from '../../ui/RangeInput/RangeInput';
import { ConvoMessageIconButton, } from '../../ui/ConvoMessageIconButton/ConvoMessageIconButton';
import { useNow } from '../../hooks/useNow';
import { getOwnerGroupId } from '../../../data/store/State';
export const AttachVoice = React.memo(function AttachVoice({ message, voice, isFavorites, onPlayed }) {
    const { lang, api, logger, stats } = useBrowserEnv();
    const owner = useOwner();
    const getConvoVoicesPlaylist = useContext(ConvoVoicesPlaylistContext);
    const fromMessage = message.kind === 'Normal' || message.kind === 'Foreign'
        ? message
        : undefined;
    const sentAt = message.sentAt;
    const authorId = message.authorId;
    const audio = useRef(toMessagedConvoVoiceTrackFromMessage(0, voice, sentAt, authorId, fromMessage));
    const { voicePlayer, status, progress } = useVoicePlayer(audio.current);
    const [seekProgress, setSeekProgress] = useState(null);
    // В процессе перетаскивания ползунка меняем прогресс только в прогресс баре.
    const isSeeking = seekProgress !== null;
    const progressBarValue = isSeeking ? seekProgress : progress;
    const peerId = message.kind === 'Foreign' ? message.rootPeerId : message.peerId;
    const cmid = Message.getCmid(message);
    const collectVoiceStat = useCallback((data) => {
        if (message.kind === 'Queued') {
            return;
        }
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_audio_message_item',
                type_messaging_audio_message_item: {
                    audio_message_id: `audio_message${voice.ownerId}_${voice.id}`,
                    peer_id: peerId,
                    cmid: cmid || 0,
                    action_source: 'fastchat_msg_list_attach',
                    playback_rate: data.action_type === 'play' ? 100 : undefined,
                    action_type: data.action_type,
                    transcription_show: data.transcription_show,
                    transcription_score: data.transcription_score,
                    actor: data.actor,
                },
            },
        });
    }, [stats, peerId, cmid, message.kind, voice.ownerId, voice.id]);
    const prevStatus = useRef(status);
    prevStatus.current = usePrevious(status) || status;
    useEffect(() => {
        if (prevStatus.current !== 'stopped' && status === 'ended') {
            collectVoiceStat({ action_type: 'finish' });
        }
    }, [collectVoiceStat, status]);
    const { isMarkedPlayed } = useMarkVoiceMessageAsPlayed(voice, message, status, isFavorites, onPlayed);
    const strokeW = 2;
    const height = 12;
    const density = 1 / 2;
    const { waveWidth, waveCurve, isMeasuringActive, $container, resetWave } = useFluidWave(voice.duration, voice.waveform, strokeW, height, density);
    /**
     * Обработчик клика по кнопке
     */
    const toggle = useCallback(() => {
        if (status === 'playing') {
            voicePlayer.pause();
            collectVoiceStat({ action_type: 'pause' });
        }
        else {
            const audioTrack = toMessagedConvoVoiceTrackFromMessage(progress, voice, sentAt, authorId, fromMessage);
            const playlist = getConvoVoicesPlaylist(audioTrack);
            voicePlayer.play(audioTrack, playlist);
            collectVoiceStat({ action_type: 'play' });
        }
    }, [
        status,
        voicePlayer,
        collectVoiceStat,
        progress,
        voice,
        sentAt,
        authorId,
        fromMessage,
        getConvoVoicesPlaylist,
    ]);
    const handleProgressChange = useCallback((progress) => {
        if (status === 'playing') {
            voicePlayer.seek(progress);
        }
        else {
            const audioTrack = toMessagedConvoVoiceTrackFromMessage(progress, voice, sentAt, authorId, fromMessage);
            const playlist = getConvoVoicesPlaylist(audioTrack);
            voicePlayer.play(audioTrack, playlist);
            collectVoiceStat({ action_type: 'play' });
        }
    }, [
        authorId,
        collectVoiceStat,
        fromMessage,
        getConvoVoicesPlaylist,
        sentAt,
        status,
        voice,
        voicePlayer,
    ]);
    const [wasASRTriggered, setASRTriggered] = useState(false);
    /**
     * Управление включаемой транскрипцией
     */
    const [isTranscriptionToggledOpen, setTranscriptionToggledOpen] = useState(false);
    const [transcriptionOpenedCount, setTranscriptionOpenedCount] = useState(0);
    const canTriggerASR = voice.isTranscriptPossible &&
        message.kind !== 'Queued' &&
        !!message.peerId;
    const handleASRClick = useCallback((e) => {
        /* Предотвращаем выделение сообщения */
        e.stopPropagation();
        const nowOpen = !isTranscriptionToggledOpen;
        if (nowOpen &&
            !voice.transcription &&
            canTriggerASR &&
            !wasASRTriggered) {
            const audioMessageId = `${message.authorId}_${voice.id.toString()}`;
            /* Транскрипция будет получена в 18-ом событии */
            api
                .fetch('messages.recogniseAudioMessage', {
                peer_id: message.peerId,
                cmid: message.cmid,
                audio_message_id: audioMessageId,
                group_id: getOwnerGroupId(owner.id),
            })
                .catch((err) => {
                logger.info('Не удалось запросить транскрипцию голосового', err);
            });
            collectVoiceStat({
                action_type: 'transcript_loading',
                actor: 'user',
            });
            setASRTriggered(true);
        }
        if (nowOpen) {
            onPlayed(message);
        }
        if (nowOpen) {
            setTranscriptionOpenedCount(transcriptionOpenedCount + 1);
        }
        /**
         * Сафари не умеет в обновление ширины контейнера в зависимости от
         * динамического контента ребенка, ввиду чего ресет волны привел бы к
         * сужению SVG, в то время как контейнер бы не уменьшился.
         * Скипаем для сафари.
         */
        if (!nowOpen && !browser.safari) {
            resetWave();
        }
        setTranscriptionToggledOpen(nowOpen);
        collectVoiceStat({
            action_type: 'transcript_toggle',
            transcription_show: nowOpen ? 1 : 0,
            actor: 'user',
        });
    }, [
        isTranscriptionToggledOpen,
        voice.transcription,
        voice.id,
        owner.id,
        canTriggerASR,
        wasASRTriggered,
        collectVoiceStat,
        api,
        message,
        logger,
        onPlayed,
        transcriptionOpenedCount,
        resetWave,
    ]);
    const isAfoot = isSeeking || status === 'playing' || status === 'paused';
    const formattedDuration = formatDuration(voice.duration || 1);
    return (React.createElement("div", { className: cx('AttachVoice', {
            'AttachVoice--active': isAfoot,
            'AttachVoice--playing': status === 'playing',
        }) },
        React.createElement("div", { className: "AttachVoice__player", onClick: (e) => {
                /* Предотвращаем выделение сообщения */
                e.stopPropagation();
            } },
            React.createElement("button", { className: "AttachVoice__play", onClick: toggle, "aria-label": lang.use('me_voice_message_toggle') },
                React.createElement(AttachVoicePlayerIcon, { isPlaying: status === 'playing', isMarkedPlayed: isMarkedPlayed })),
            React.createElement(RangeInput, { onChange: setSeekProgress, onChangeEnd: (progressValue) => {
                    handleProgressChange(progressValue);
                    setSeekProgress(null);
                }, rangeClassName: "AttachVoice__trackContainer" },
                React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "AttachVoice__track", ref: $container }, !isMeasuringActive && (React.createElement(React.Fragment, null,
                        isAfoot && (React.createElement("svg", { className: cx('AttachVoice__svg', 'AttachVoice__svg--shadow', {
                                'AttachVoice__svg--animatable': !isSeeking,
                            }), width: waveWidth, height: height, strokeWidth: strokeW, style: {
                                clipPath: `inset(0 ${(1 - progressBarValue) * waveWidth}px 0 0)`,
                            } },
                            React.createElement("path", { className: "AttachVoice__progress", d: waveCurve }))),
                        React.createElement("svg", { className: "AttachVoice__svg", width: waveWidth, height: height, strokeWidth: strokeW },
                            React.createElement("path", { className: "AttachVoice__path", d: waveCurve }))))),
                    React.createElement("div", { className: "AttachVoice__duration", style: { width: formattedDuration.length + 'ch' } }, isAfoot
                        ? formatDuration(Math.floor(voice.duration * progress))
                        : formattedDuration))),
            (voice.transcription || canTriggerASR) && (React.createElement(ConvoMessageIconButton, { icon: isTranscriptionToggledOpen ? (React.createElement(Icon20ChevronUpOutline, null)) : (React.createElement(Icon16Text, null)), "aria-label": isTranscriptionToggledOpen
                    ? lang.use('me_voice_asr_toggle_close')
                    : lang.use('me_voice_asr_toggle_open'), onClick: handleASRClick, onMouseDown: preventFocus, className: "AttachVoice__asrButton" }))),
        isTranscriptionToggledOpen && (React.createElement("div", { className: "AttachVoice__transcript" },
            React.createElement(AttachVoiceTranscriptionContent, { voice: voice, openedCount: transcriptionOpenedCount })))));
});
/**
 * Отмечает сообщение прослушанным сразу или с задержкой
 */
function useMarkVoiceMessageAsPlayed(voice, message, status, isFavorites, onVoiceMessagePlayed) {
    const playedDelayTimeoutIdRef = useRef(undefined);
    /* Слушаем проигрыватель и отмечаем сообщение прочитанным */
    useEffect(() => {
        /**
         * Отмечаем сообщение прослушанным при проигрывании.
         * Для сценария случайного воспроизведение и автовоспроизведения в будущем
         * отправляем с задержкой
         *
         * Вариант без обработки таких кейсов как пауза и дальнейшее воспроизведение
         */
        const BUFFER_TIME = 1;
        /* Отмечаем короткие голосовые прослушанными без задержки */
        if (status === 'playing' && voice.duration <= BUFFER_TIME + 1) {
            onVoiceMessagePlayed(message);
            return;
        }
        if (status === 'playing' && !playedDelayTimeoutIdRef.current) {
            playedDelayTimeoutIdRef.current = window.setTimeout(() => {
                onVoiceMessagePlayed(message);
                playedDelayTimeoutIdRef.current = undefined;
            }, BUFFER_TIME * 1000);
        }
        if (playedDelayTimeoutIdRef.current && status !== 'playing') {
            clearTimeout(playedDelayTimeoutIdRef.current);
        }
        return () => {
            if (playedDelayTimeoutIdRef.current) {
                clearTimeout(playedDelayTimeoutIdRef.current);
                playedDelayTimeoutIdRef.current = undefined;
            }
        };
    }, [
        message,
        onVoiceMessagePlayed,
        status,
        voice.duration,
        voice.id,
        voice.ownerId,
    ]);
    /* Отметка прослушанным */
    const isMarkedPlayed = 
    // В избранном всегда прослушано
    isFavorites ||
        // В пересланном всегда прослушано
        message.kind === 'Foreign' ||
        // Если сообщения нет в истории, то считаем за прослушанное
        // Например, когда сообщение было закреплено до вступления юзера в чат
        (message.kind === 'Normal' && message.isUnavailable) ||
        // Если Normal сообщение && isPlayed - то прослушано
        (message.kind === 'Normal' && message.isPlayed) ||
        // Если проигрываем входящее сообщение, то сразу становится прослушанным
        (status === 'playing' && !message.isOut);
    return {
        isMarkedPlayed,
    };
}
const AttachVoicePlayerIcon = ({ isPlaying, isMarkedPlayed }) => (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "AttachVoice__playIcon", width: "32", height: "32", fill: "currentColor" },
    !isPlaying && isMarkedPlayed && (React.createElement("path", { d: "M32 16a16 16 0 11-32 0 16 16 0 0132 0zm-9.85.87a1 1 0 000-1.74l-8.64-4.99a1 1 0 00-1.51.87V21a1 1 0 001.5.87l8.65-5z" })),
    !isPlaying && !isMarkedPlayed && (React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M30.28 23.23a16 16 0 1 0-7.05 7.05 5 5 0 0 1 7.05-7.05Zm-8.13-8.1a1 1 0 0 1 0 1.74l-8.64 5A1 1 0 0 1 12 21V11a1 1 0 0 1 1.5-.87l8.65 5Z" }),
        React.createElement("circle", { cx: "27", cy: "27", r: "3" }))),
    isPlaying && isMarkedPlayed && (React.createElement("path", { d: "M32 16a16 16 0 1 1-32 0 16 16 0 0 1 32 0Zm-20.9-5.45c-.1.21-.1.49-.1 1.05v8.8c0 .56 0 .84.1 1.05a1 1 0 0 0 .45.44c.21.11.49.11 1.05.11h.8c.56 0 .84 0 1.05-.1a1 1 0 0 0 .44-.45c.11-.21.11-.49.11-1.05v-8.8c0-.56 0-.84-.1-1.05a1 1 0 0 0-.45-.44c-.21-.11-.49-.11-1.05-.11h-.8c-.56 0-.84 0-1.05.1a1 1 0 0 0-.44.45Zm6 0c-.1.21-.1.49-.1 1.05v8.8c0 .56 0 .84.1 1.05a1 1 0 0 0 .45.44c.21.11.49.11 1.05.11h.8c.56 0 .84 0 1.05-.1a1 1 0 0 0 .44-.45c.11-.21.11-.49.11-1.05v-8.8c0-.56 0-.84-.1-1.05a1 1 0 0 0-.45-.44c-.21-.11-.49-.11-1.05-.11h-.8c-.56 0-.84 0-1.05.1a1 1 0 0 0-.44.45Z" })),
    isPlaying && !isMarkedPlayed && (React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M30.28 23.23a16 16 0 1 0-7.05 7.05 5 5 0 0 1 7.05-7.05ZM11 11.6c0-.56 0-.84.1-1.05a1 1 0 0 1 .45-.44c.21-.11.49-.11 1.05-.11h.8c.56 0 .84 0 1.05.1a1 1 0 0 1 .44.45c.11.21.11.49.11 1.05v8.8c0 .56 0 .84-.1 1.05a1 1 0 0 1-.45.44c-.21.11-.49.11-1.05.11h-.8c-.56 0-.84 0-1.05-.1a1 1 0 0 1-.44-.45c-.11-.21-.11-.49-.11-1.05v-8.8Zm6 0c0-.56 0-.84.1-1.05a1 1 0 0 1 .45-.44c.21-.11.49-.11 1.05-.11h.8c.56 0 .84 0 1.05.1a1 1 0 0 1 .44.45c.11.21.11.49.11 1.05v8.8c0 .56 0 .84-.1 1.05a1 1 0 0 1-.45.44c-.21.11-.49.11-1.05.11h-.8c-.56 0-.84 0-1.05-.1a1 1 0 0 1-.44-.45c-.11-.21-.11-.49-.11-1.05v-8.8Z" }),
        React.createElement("circle", { cx: "27", cy: "27", r: "3" })))));
const AttachVoiceTranscriptionContent = ({ voice, openedCount = 0 }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    if (!voice.transcription) {
        /**
         * Оптимистично считаем, что если мы вызвали транскрипцию,
         * то она появится
         */
        return (React.createElement("span", { className: "AttachVoice__transcriptStub" }, lang.use('me_voice_asr_status_in_progress')));
    }
    let content;
    switch (voice.transcription.state) {
        case 'done': {
            if (!voice.transcription.text && openedCount % 3 === 0) {
                content = (React.createElement("span", { className: "AttachVoice__transcriptStub" }, getEmptyTranscriptionEasterEggText(lang, openedCount)));
                break;
            }
            if (!voice.transcription.text) {
                content = (React.createElement("span", { className: "AttachVoice__transcriptStub" }, lang.use('me_voice_asr_status_empty')));
                break;
            }
            content = (React.createElement(React.Fragment, null,
                voice.transcription.text,
                voice.transcription.updatedAt && (React.createElement(React.Fragment, null,
                    "\u00A0",
                    React.createElement(Tooltip, { content: lang.use(isSameYear(now, voice.transcription.updatedAt)
                            ? 'global_short_date_time'
                            : 'global_date_year_time', {
                            now,
                            date: voice.transcription.updatedAt,
                        }), position: "top", align: "center", delay: 500, watchContentChange: true },
                        React.createElement("span", { className: "AttachVoice__transcriptEditedLabel" }, lang.use('me_message_edited_label')))))));
            break;
        }
        case 'in_progress': {
            content = (React.createElement("span", { className: "AttachVoice__transcriptStub" }, lang.use('me_voice_asr_status_in_progress')));
            break;
        }
        case 'error': {
            content = (React.createElement("span", { className: "AttachVoice__transcriptStub" }, lang.use('me_voice_asr_status_empty')));
            break;
        }
        default: {
            const _typeguard = voice.transcription;
            content = null;
            break;
        }
    }
    return React.createElement(React.Fragment, null, content);
};
/* Мемоизируем, чтобы избежать неожиданных изменений в отображении между рендерами */
const easterEggCache = new Map();
function getEmptyTranscriptionEasterEggText(lang, id) {
    const cached = easterEggCache.get(id);
    if (cached) {
        return cached;
    }
    const emptyTranscriptionEasterEggSet = lang
        .use('me_voice_asr_status_empty_set')
        .split('|');
    const text = emptyTranscriptionEasterEggSet[Math.floor(Math.random() * emptyTranscriptionEasterEggSet.length)]?.trim() || '';
    easterEggCache.set(id, text);
    return text;
}
function preventFocus(e) {
    e.preventDefault();
}
//# sourceMappingURL=AttachVoice.js.map