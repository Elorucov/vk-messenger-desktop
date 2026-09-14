import { isSameExternalId } from '@vkontakte-internal/calls-core';
/** Размер хранимой истории субтитров (в репликах) */
const SUBTITLES_HISTORY_SIZE = 3;
/**
 * Время в мс в рамках которого происходит добавление
 * новых фраз к уже существующей реплике где-то не в начале истории (с индексом >0)
 */
const SUBTITLES_WRITE_BACK_TIMEOUT = 801;
/**
 * Время в мс в рамках которого происходит добавление
 * новых фраз к реплике в начале истории
 */
const SUBTITLES_SAME_SPEAKER_TIMEOUT = 5_000;
/**
 * Время в мс с момента последнего обновления реплики,
 * спустя которое реплика удаляется из истории
 */
export const SUBTITLES_TTL = 10_000;
/**
 * Создает новый массив обновленной истории реплик
 * из предыдущей истории и новой реплики
 * @param transcription Новая реплика
 * @param history Входной массив истории реплик
 * @returns Массив обновленной истории
 */
export const getUpdatedHistory = (transcription, history = []) => {
    // Возвращаем обновленную историю из единственной новой реплики, если предыдущая история пуста
    if (history.length === 0) {
        return [transcription];
    }
    /** Последняя реплика автора новой реплики из предыдущей истории */
    const lastTranscription = history.find((tr) => isSameExternalId(tr.externalId, transcription.externalId));
    /** Разница в мс между новой репликой и предыдущей репликой того же автора, если не было - 0 */
    const tsDiff = lastTranscription ? transcription.timestamp - lastTranscription.timestamp : 0;
    // Просто добавляем новую реплику в начало истории, если:
    // 1. В предыдущей истории не нашлось реплик того же автора
    // 2. НЕ
    // (Предыдущая реплика того же автора была последней в истории И с нее прошло меньше SUBTITLES_SAME_SPEAKER_TIMEOUT мс
    //  И
    // С предыдущей реплики того же прошло меньше SUBTITLES_WRITE_BACK_TIMEOUT, но больше 0 мс)
    if (!lastTranscription ||
        (!(history.indexOf(lastTranscription) === 0 && tsDiff < SUBTITLES_SAME_SPEAKER_TIMEOUT) &&
            !(tsDiff > 0 && tsDiff < SUBTITLES_WRITE_BACK_TIMEOUT))) {
        return [transcription, ...history].slice(0, SUBTITLES_HISTORY_SIZE);
    }
    // Иначе добавляем новую реплику к предыдущей реплике того же автора из истории
    let updatedHistory;
    const combinedTranscription = {
        ...transcription,
        text: lastTranscription.text + transcription.text,
        duration: lastTranscription.duration + transcription.duration,
    };
    updatedHistory = [...history];
    updatedHistory.splice(updatedHistory.indexOf(lastTranscription), 1, combinedTranscription);
    return updatedHistory;
};
//# sourceMappingURL=utils.js.map