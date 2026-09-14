import { useCallback, useEffect, useRef, useState } from 'react';
import { useSendUserActivity } from '../hooks/useComposer';
import { useActualEffectCleanup, useBrowserEnv, useDispatch, } from '../hooks/misc';
import { Uploader } from '../../data/env/Uploader';
import { useSnackbar } from '../hooks/useSnackbar';
const BLOB_PARAMS = { type: 'audio/ogg' };
/**
 * Количество элементов waveframe, которые мы передадим для отрисовки.
 *
 * Очень затратно по памяти.
 * Чем больше значение, тем больший массив мы передадим в реакт.
 */
const PREVIEW_SIZE = 500;
export function useVoiceRecording(peerId, isPostponed, uploadFiles, 
/**
 * Открывает модальное окно с сообщением об ошибке
 */
onError) {
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const { voiceRecorder, lang, uploader } = useBrowserEnv();
    const updateUserActivity = useSendUserActivity(peerId, isPostponed);
    const [activeVoice, setActiveVoice] = useState();
    const [voice, setVoice] = useState(undefined);
    const [activeVoiceRecording, setActiveVoiceRecording] = useState();
    const activeVoiceRecordingRef = useRef(activeVoiceRecording);
    activeVoiceRecordingRef.current = activeVoiceRecording;
    const reset = useCallback(async () => {
        const currentRecordingProcess = activeVoiceRecordingRef.current;
        if (currentRecordingProcess) {
            try {
                await currentRecordingProcess.stop();
            }
            catch (err) { }
        }
        setActiveVoiceRecording(undefined);
        setVoice(undefined);
        setActiveVoice(undefined);
    }, []);
    useEffect(() => () => {
        reset();
    }, [reset]);
    const stopRecordingVoice = useCallback(async () => {
        if (!activeVoiceRecording) {
            return;
        }
        try {
            const voiceResult = await activeVoiceRecording.stop();
            setActiveVoiceRecording(undefined);
            setVoice(voiceResult);
            setActiveVoice(undefined);
            return voiceResult;
        }
        catch (err) {
            onError('me_voice_recording_error');
            reset();
        }
        return;
    }, [activeVoiceRecording, onError, reset]);
    const removeRecordingVoice = useCallback(async () => {
        await stopRecordingVoice();
        reset();
    }, [reset, stopRecordingVoice]);
    const startRecordingVoice = useCallback(async () => {
        await stopRecordingVoice();
        try {
            let last = 0;
            const { stop, pause, resume } = await start(voiceRecorder, (tickVolume, duration) => {
                /**
                 *  Производительность хуже, если в коллбеке передается не примитивный
                 *  тип данных, а коллбек вызывается на каждый тик браузера.
                 *  https://v8.dev/blog/adaptor-frame
                 */
                setActiveVoice((prev) => ({
                    waveform: [...(prev?.waveform || []), tickVolume * 255].slice(
                    /**
                     * Берем с конца некоторое количество элементов для отрисовки
                     * пиков. Остальное копим, чтобы в конце записи отрисовать финальные
                     * пики.
                     *
                     * Мы не можем показывать здесь весь массив, ввиду сильных затрат
                     * по памяти при передаче массивов на 100500 элементов в рект.
                     */
                    PREVIEW_SIZE * -1),
                    duration,
                }));
                /**
                 * Тики аудиозаписи происходят очень быстро, но вызов функции
                 * активности пользователя происходит раз в пару секунд,
                 * чтобы не перегружать количеством вызовов, даже при локе в хуке
                 */
                if (duration - last >= 2) {
                    last = duration;
                    updateUserActivity('audiomessage');
                }
            });
            setVoice(undefined);
            setActiveVoiceRecording({ stop, pause, resume });
            updateUserActivity('audiomessage');
        }
        catch (err) {
            onError('me_voice_recording_error_permission');
            reset();
        }
    }, [onError, reset, stopRecordingVoice, updateUserActivity, voiceRecorder]);
    const pauseRecordingVoice = useCallback(async () => {
        if (!activeVoiceRecording) {
            return;
        }
        try {
            const voiceResult = await activeVoiceRecording?.pause();
            setActiveVoice(undefined);
            setVoice(voiceResult);
        }
        catch (err) {
            onError('me_voice_recording_error');
            reset();
        }
        return;
    }, [activeVoiceRecording, onError, reset]);
    const resumeRecordingVoice = useCallback(() => {
        if (!activeVoiceRecording) {
            return;
        }
        /**
         * Восстанавливаем текущую запись
         */
        setVoice((currentVoice) => {
            if (currentVoice?.waveform && currentVoice?.duration) {
                setActiveVoice({
                    waveform: currentVoice.waveform,
                    duration: currentVoice.duration,
                });
            }
            return undefined;
        });
        try {
            activeVoiceRecording.resume();
        }
        catch (err) {
            onError('me_voice_recording_error');
            reset();
        }
    }, [activeVoiceRecording, onError, reset]);
    const uploadVoice = useCallback((voice) => {
        return new Promise((resolve, reject) => {
            uploadFiles([voice], { asVoice: true }, {
                onError: () => {
                    snackbar({
                        message: lang.use('me_voice_recording_error_uploading'),
                    });
                    reject();
                },
                onUploadFinish: (result) => {
                    dispatch({
                        peerId,
                        type: 'UserChangedComposerDraft',
                        kind: 'addAttaches',
                        attaches: Uploader.buildAttachments(Array.from(result.values() || [])),
                        trackIds: Array.from(result.keys() || []),
                        isPostponed,
                    });
                    resolve();
                },
            });
        });
    }, [dispatch, lang, peerId, snackbar, uploadFiles, isPostponed]);
    const onVoiceRecordingStop = useCallback(async () => {
        const voiceRecord = await stopRecordingVoice();
        if (!voiceRecord) {
            return;
        }
        return uploadVoice(voiceRecord);
    }, [stopRecordingVoice, uploadVoice]);
    const onVoiceRecordingRemove = async (voiceUploadTrackId) => {
        await removeRecordingVoice();
        /**
         * Если во время удаления ГС производилась его
         * загрузка - останавливаем и удаляем
         */
        if (voiceUploadTrackId) {
            uploader.abortUpload(voiceUploadTrackId);
        }
        dispatch({
            peerId,
            type: 'UserChangedComposerDraft',
            kind: 'removeVoice',
            isPostponed,
        });
    };
    const shouldSaveVoiceOnPeerChange = !!voice || !!activeVoice;
    const saveVoiceOnPeerChange = useCallback(async () => {
        if (!shouldSaveVoiceOnPeerChange) {
            return;
        }
        try {
            await onVoiceRecordingStop();
            await removeRecordingVoice();
        }
        catch { }
    }, [shouldSaveVoiceOnPeerChange, onVoiceRecordingStop, removeRecordingVoice]);
    useActualEffectCleanup(saveVoiceOnPeerChange, [peerId]);
    return {
        voice,
        activeVoice,
        startRecordingVoice,
        pauseRecordingVoice,
        resumeRecordingVoice,
        onVoiceRecordingStop,
        onVoiceRecordingRemove,
        removeRecordingVoice,
        uploadVoice,
    };
}
/**
 * Функция-враппер для контроля начала, паузы, возобновления и окончания записи голосового
 */
async function start(recorder, analyzerCallback) {
    await recorder.start();
    let startedAt = Date.now();
    let pausedAt;
    let chunks = [];
    const waveform = [];
    recorder.onDataAvailable = (typedArray) => {
        chunks.push(typedArray);
    };
    const getDuration = () => Math.round(((pausedAt || Date.now()) - startedAt) / 1000);
    const [pauseAnalyzer, resumeAnalyzer] = recorder.subscribeToAnalyzer((volume) => {
        waveform.push(volume * 255);
        analyzerCallback(volume, getDuration());
    });
    return {
        stop: () => new Promise((resolve) => {
            recorder.onStop = () => {
                const blob = new Blob(chunks, BLOB_PARAMS);
                chunks = [];
                resolve({
                    blob,
                    duration: getDuration(),
                    waveform,
                });
            };
            recorder.stop();
            pauseAnalyzer?.();
        }),
        pause: () => new Promise((resolve) => {
            recorder.onPause = () => {
                resolve({
                    blob: new Blob(chunks, BLOB_PARAMS),
                    duration: getDuration(),
                    waveform,
                });
            };
            recorder.pause();
            pausedAt = Date.now();
            pauseAnalyzer?.();
        }),
        resume: () => {
            if (pausedAt) {
                /**
                 * Убираем разницу во времени из-за паузы
                 */
                startedAt += Date.now() - pausedAt;
            }
            recorder.resume();
            pausedAt = undefined;
            resumeAnalyzer?.();
        },
    };
}
//# sourceMappingURL=useVoiceRecording.js.map