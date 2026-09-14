import '../../ui/AttachVideoMessage/AttachVideoMessage.css';
import React, { useCallback, useMemo, useRef, useState, } from 'react';
import * as Attach from '../../../core/model/Attach';
import * as Message from '../../../core/model/Message';
import { usePixelDensity, useDispatch, useBrowserEnv, useViewer, useStoreState, useFeatureFlags, } from '../../hooks/misc';
import cx from 'classnames';
import { exhaustivenessCheck, formatDuration, isSameYear, } from '../../../core/utils/misc';
import { getExpectedAttachWidth } from '../../utils/misc';
import { Icon16Muted, Icon24ChevronUp, Icon24DownloadOutline, Icon24Play, Icon24TextOutline, } from '@vkontakte/icons';
import { useVideoMessageTransform } from '../../hooks/useVideoMessageTransform';
import { Spinner } from '@vkontakte/vkui';
import { useVideoMessagePlayer, } from '../../hooks/useVideoMessagePlayer';
import { UNKNOWN_SHAPE_ID } from '../../../data/converter/AttachConverter';
import { AttachVideoMessageCanvas } from './AttachVideoMessageCanvas';
import { AttachVideoMessageVideo } from './AttachVideoMessageVideo';
import { AttachVideoMessageBorder } from './AttachVideoMessageBorder';
import { toVideoMessageTrack, getVideoSource, } from '../../env/VideoMessagePlayer/utils';
import { ConvoMessageBottomInfo } from '../../ui/ConvoMessageBottomInfo/ConvoMessageBottomInfo';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { useNow } from '../../hooks/useNow';
import { useApiFetch } from '../../hooks/useApiFetch';
const DEFAULT_SHAPE_PATH = 'M0 81.8526C0 53.2015 0 38.876 5.57588 27.9327C10.4806 18.3067 18.3067 10.4806 27.9327 5.57588C38.876 0 53.2015 0 81.8526 0H134.147C162.798 0 177.124 0 188.067 5.57588C197.693 10.4806 205.519 18.3067 210.424 27.9327C216 38.876 216 53.2015 216 81.8526V134.147C216 162.798 216 177.124 210.424 188.067C205.519 197.693 197.693 205.519 188.067 210.424C177.124 216 162.798 216 134.147 216H81.8526C53.2015 216 38.876 216 27.9327 210.424C18.3067 205.519 10.4806 197.693 5.57588 188.067C0 177.124 0 162.798 0 134.147V81.8526Z';
export const AttachVideoMessage = function AttachVideoMessage({ message, videoMessage, isFavorites, isInBubble = false, isOut, isUnread, forwardLevel = 0, rootMessageId, convoPeerId, messageSentAt, messageAuthorId, onPlayed, isWithoutBubblesTheme, }) {
    const { videoMessagePlayer, lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const isDense = usePixelDensity();
    const viewer = useViewer();
    const dispatch = useDispatch();
    const cmid = Message.getCmid(message);
    const { fetchVideoTranscription } = useVideoASR({
        cmid: cmid,
        peerId: convoPeerId,
        videoMessageId: `${videoMessage.ownerId}_${videoMessage.id}`,
    });
    // Уникальное id этого видеосообщения в контексте истории сообщений
    // Необходимо для того, чтобы не было коллизий с видеосообщениями в форвардах
    const id = `${rootMessageId}_${videoMessage.id}`;
    const rootRef = useRef(null);
    const videoMessageShapes = useStoreState('videoMessageShapes');
    const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
    const [hasLoadingError, setLoadingError] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const $video = useRef(null);
    const { status, progress } = useVideoMessagePlayer({
        id,
        message,
        rootRef,
        onPlayed,
    });
    useVideoMessageTransform(rootRef, status);
    // Отметка просмотренным
    const isMarkedPlayed = 
    // В избранном всегда просмотрено
    isFavorites ||
        // В пересланном всегда просмотрено
        message.kind === 'Foreign' ||
        // Если Normal сообщение && isPlayed - то просмотрено
        (message.kind === 'Normal' && message.isPlayed) ||
        // Если проигрываем входящее сообщение, то сразу становится просмотренным
        (status === 'playing' && !message.isOut);
    const [, previewWidth] = getExpectedAttachWidth(isDense, isInBubble, forwardLevel, 216);
    const preview = Attach.preview(videoMessage, previewWidth);
    const duration = videoMessage.duration ?? 0;
    const info = formatDuration(status === 'playing' ? Math.floor(duration * (1 - progress)) : duration);
    const showTranscription = () => {
        setIsTranscriptionVisible(!isTranscriptionVisible);
    };
    const handleTranscriptionToggle = (e) => {
        e.stopPropagation();
        e.preventDefault();
        /** Временное решение до переезда на новые обработчики транскрипции vk ai.
         * Таски на транскрипцию запускаются точно так же автоматически и приходят в статусе done.
         * Сама расшифровка будет получена только после вызова метода recogniseVideoMessage
         * и придет в 10018 событии + при вызове getDiffContent.
         * Если поле transcript (в нашем случае transcription.text) отсутствует, то это значит,
         * что расшифровка еще не была запрошена пользователем и необходимо дернуть метод
         * */
        const isTranscriptionDoneAndRecognised = videoMessage.transcription?.state === 'done' &&
            videoMessage.transcription.text !== undefined;
        if (!isTranscriptionVisible &&
            !isTranscriptionDoneAndRecognised &&
            featureFlags.vkm_manual_video_asr_enabled) {
            fetchVideoTranscription();
        }
        showTranscription();
    };
    const handleClick = (event) => {
        event.stopPropagation();
        if (hasLoadingError) {
            setLoadingError(false);
            $video.current?.load();
            return;
        }
        switch (status) {
            case 'ended':
            case 'stopped':
                videoMessagePlayer.play(convoPeerId, toVideoMessageTrack(0, videoMessage, rootMessageId, messageSentAt, messageAuthorId));
                break;
            case 'playing':
                videoMessagePlayer.pause();
                break;
            case 'paused':
                videoMessagePlayer.resume();
                break;
            default:
                exhaustivenessCheck(status);
        }
    };
    const getShape = useCallback(() => {
        if (videoMessage.shapeId === UNKNOWN_SHAPE_ID) {
            return DEFAULT_SHAPE_PATH;
        }
        const shape = videoMessageShapes?.get(videoMessage.shapeId);
        if (shape) {
            return shape;
        }
        // Если videoMessageShapes === null, значит еще не завершился запрос на загрузку шейпов при инициализации приложения
        // dispatch VideoMessageShapesGetById следует вызывать только при условии, что загружены шейпы и там не найден необходимый shapeId
        if (videoMessageShapes !== null) {
            dispatch({
                type: 'VideoMessageShapesGetById',
                shapeId: videoMessage.shapeId,
            });
        }
        return DEFAULT_SHAPE_PATH;
    }, [dispatch, videoMessage.shapeId, videoMessageShapes]);
    const shape = useMemo(() => getShape(), [getShape]);
    const handleError = useCallback(() => {
        setLoadingError(true);
    }, []);
    const shouldShowASRButton = info &&
        /* uninitialized - статус у старых ВС, у них не будет расшифровки поэтому даже кнопку не показываем */
        videoMessage.transcription?.state !== 'uninitialized' &&
        /** На текущий момент на бэкенде технологически нельзя напрямую запросить
         *  транскрипцию ВС в форвардах до переезда на целевую архитектуру
         *  Поэтому для форвардов без готовой транскрипции скрываем кнопку
         * */
        (!featureFlags.vkm_manual_video_asr_enabled ||
            (videoMessage.transcription?.state === 'done' &&
                videoMessage.transcription.text) ||
            message.kind !== 'Foreign');
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { ref: rootRef, className: cx('AttachVideoMessage', {
                'AttachVideoMessage--playing': status === 'playing',
                'AttachVideoMessage--paused': status === 'paused',
                // прижимаем отправленные сообщения вправо, чтобы не прыгало сообщение.
                // Не делаем это в форвардах, тк там прижимаются сообщения влево все
                'AttachVideoMessage--right': !isWithoutBubblesTheme && isOut === true && forwardLevel === 0,
            }), onClick: handleClick },
            React.createElement("div", { className: "AttachVideoMessage__preview", style: {
                    clipPath: `path('${shape}')`,
                } },
                hasLoadingError && (React.createElement("div", { className: "AttachVideoMessage__reload" },
                    React.createElement("button", { className: "AttachVideoMessage__reloadButton", type: "button" },
                        React.createElement(Icon24DownloadOutline, { className: "AttachVideoMessage__reloadButtonIcon" })))),
                React.createElement("div", { className: cx('AttachVideoMessage__overlay', {
                        'AttachVideoMessage__overlay--visible': hasLoadingError || isLoading,
                    }) }),
                React.createElement(AttachVideoMessageCanvas, { rootRef: rootRef, status: status, className: cx('AttachVideoMessage__canvas', {
                        'AttachVideoMessage__canvas--hidden': status === 'stopped' || status === 'ended',
                    }) }),
                React.createElement(AttachVideoMessageVideo, { ref: $video, poster: preview?.url, src: getVideoSource(videoMessage.files), status: status, setIsLoading: setLoading, className: cx('AttachVideoMessage__video', {
                        'AttachVideoMessage__video--blurred': hasLoadingError || isLoading,
                    }), onError: handleError })),
            // Если shape нет (default), то обводка не нужна
            shape !== DEFAULT_SHAPE_PATH && !isWithoutBubblesTheme && (React.createElement(AttachVideoMessageBorder, { shape: shape, isOut: isOut })),
            shouldShowASRButton &&
                (isTranscriptionVisible ? (React.createElement("button", { className: "AttachVideoMessage__transcriptionToggle", onClick: handleTranscriptionToggle, "aria-label": lang.use('me_video_message_close_transcription') },
                    React.createElement(Icon24ChevronUp, { width: 16 }))) : (React.createElement("button", { className: "AttachVideoMessage__transcriptionToggle", onClick: handleTranscriptionToggle, "aria-label": lang.use('me_video_message_open_transcription') },
                    React.createElement(Icon24TextOutline, { width: 16 })))),
            React.createElement("div", { className: "AttachVideoMessage__videoInfo" },
                info,
                !isMarkedPlayed && (React.createElement("div", { className: "AttachVideoMessage__notPlayedIndicator" }))),
            React.createElement("div", { className: cx('AttachVideoMessage__volume', {
                    'AttachVideoMessage__volume--hidden': (status !== 'ended' && status !== 'stopped') ||
                        !viewer.settings.videoMessageAutoplay,
                }) },
                React.createElement(Icon16Muted, null)),
            React.createElement("div", { className: cx('AttachVideoMessage__pause', {
                    'AttachVideoMessage__pause--hidden': status !== 'paused' &&
                        (viewer.settings.videoMessageAutoplay || status !== 'stopped'),
                }) },
                React.createElement(Icon24Play, null)),
            React.createElement("div", { className: cx('AttachVideoMessage__loading', {
                    'AttachVideoMessage__loading--large': status === 'playing',
                    'AttachVideoMessage__loading--hidden': !isLoading || status === 'paused',
                }) },
                React.createElement(Spinner, { size: "xl", disableAnimation: !isLoading || status === 'paused' })),
            !isWithoutBubblesTheme && message.kind === 'Normal' && (React.createElement(ConvoMessageBottomInfo, { className: "ConvoMessage__info ConvoMessage__info--float", dateClassName: "ConvoMessage__date", message: message, isUnread: isUnread, showDate: true }))),
        isTranscriptionVisible && (React.createElement("div", { className: cx('AttachVideoMessage__transcriptBlock', {
                'AttachVideoMessage__transcriptBlock--out': !isWithoutBubblesTheme && isOut,
            }) },
            React.createElement("div", { className: "AttachVideoMessage__transcript" },
                React.createElement(AttachVideoMessageTranscriptionContent, { videoMessage: videoMessage }))))));
};
const AttachVideoMessageTranscriptionContent = ({ videoMessage }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const featureFlags = useFeatureFlags();
    if (!videoMessage.transcription ||
        (featureFlags.vkm_manual_video_asr_enabled &&
            videoMessage.transcription.state === 'done' &&
            videoMessage.transcription.text === undefined)) {
        /**
         * Оптимистично считаем, что если мы вызвали транскрипцию,
         * то она появится
         */
        return (React.createElement("span", { className: "AttachVoice__transcriptStub" }, lang.use('me_voice_asr_status_in_progress')));
    }
    let content;
    switch (videoMessage.transcription.state) {
        case 'done': {
            if (!videoMessage.transcription.text ||
                (featureFlags.vkm_manual_video_asr_enabled &&
                    videoMessage.transcription.text === '')) {
                content = (React.createElement("span", { className: "AttachVoice__transcriptStub" }, lang.use('me_voice_asr_status_empty')));
                break;
            }
            content = (React.createElement(React.Fragment, null,
                videoMessage.transcription.text,
                videoMessage.transcription.updatedAt && (React.createElement(React.Fragment, null,
                    "\u00A0",
                    React.createElement(Tooltip, { content: lang.use(isSameYear(now, videoMessage.transcription.updatedAt)
                            ? 'global_short_date_time'
                            : 'global_date_year_time', {
                            now,
                            date: videoMessage.transcription.updatedAt,
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
        case 'uninitialized': {
            // этот вариант не будет показываться, но на всякий считаем его оптимистичным
            content = (React.createElement("span", { className: "AttachVoice__transcriptStub" }, lang.use('me_voice_asr_status_in_progress')));
            break;
        }
        default: {
            exhaustivenessCheck(videoMessage.transcription);
        }
    }
    return React.createElement(React.Fragment, null, content);
};
const useVideoASR = ({ cmid, peerId, videoMessageId }) => {
    const { logger } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const wasASRTriggered = useRef(false);
    const fetchVideoTranscription = () => {
        if (!wasASRTriggered.current && cmid) {
            wasASRTriggered.current = true;
            void apiFetch('messages.recogniseVideoMessage', {
                cmid,
                peer_id: peerId,
                video_message_id: videoMessageId,
            }).catch((err) => {
                logger.info('Не удалось запросить транскрипцию видеосообщения', err);
                wasASRTriggered.current = false;
            });
        }
    };
    return { fetchVideoTranscription };
};
//# sourceMappingURL=AttachVideoMessage.js.map