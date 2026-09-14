export const REMIND_ANSWER_STORAGE_FIELD = 'remind-answer-convo-list';
/**
 * Обновляем store при изменении значений remindAnswerToMessage в стейте
 * Завязываемся на открытие/закрытие пользователем чата
 * @param storage
 * @param remindAnswerToMessage значение из нашего стейта
 * @param peerId
 */
export function updateRemindAnswerStorageOnChange(storage, remindAnswerToMessage, peerId) {
    const statePeerSettings = remindAnswerToMessage.get(peerId);
    storage
        .updateIDB(REMIND_ANSWER_STORAGE_FIELD, (store = new Map()) => {
        if (statePeerSettings) {
            store.set(peerId, statePeerSettings);
        }
        else if (store.has(peerId)) {
            store.delete(peerId);
        }
        return store;
    })
        .catch((error) => {
        console.error(`Ошибка записи в ${REMIND_ANSWER_STORAGE_FIELD}.`, error);
    });
}
/**
 * Функция служит для того, чтобы актуализировать storage при загрузке convos.
 * Например, если в IDB у нас лежит мапа для отображения напоминалок
 * {peerId: 100, cmid: 80}, и приходит конва для того же пира с
 * inReadBy: 100, то мы понимаем, что в IDB у нас уже не
 * актуальные данные, и чистим ненужные значения
 * @param storage
 * @param peers Мапа peerId - inReadBy
 */
export function updateRemindAnswerStorageOnConvoLoad(storage, peers) {
    storage
        .updateIDB(REMIND_ANSWER_STORAGE_FIELD, (store = new Map()) => {
        for (const [peerId, peerRemindSetting] of store) {
            const inReadBy = peers.get(peerId);
            if (inReadBy && inReadBy > peerRemindSetting.cmid) {
                store.delete(peerId);
            }
        }
        return store;
    })
        .catch((error) => {
        console.error(`Ошибка записи в ${REMIND_ANSWER_STORAGE_FIELD}.`, error);
    });
}
export async function getRemindAnswerFromStorage(storage) {
    return (await storage.getIDB(REMIND_ANSWER_STORAGE_FIELD)) || new Map();
}
//# sourceMappingURL=RemindAnswerManager.js.map