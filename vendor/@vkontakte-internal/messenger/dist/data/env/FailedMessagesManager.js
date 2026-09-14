import * as Convo from '../../core/model/Convo';
export const CONVOS_FAILED_MESSAGES_STORAGE_FIELD = 'convos-failed-messages';
const CURRENT_STORAGE_VERSION = 1;
export const DEFAULT_CONVOS_FAILED_MESSAGES_STORE = {
    version: CURRENT_STORAGE_VERSION,
};
export const saveConvosFailedMessagesInStorage = (convo, storage) => {
    const failedMessages = Convo.getAllFailedMessages(convo);
    storage
        .updateIDB(CONVOS_FAILED_MESSAGES_STORAGE_FIELD, (store = { ...DEFAULT_CONVOS_FAILED_MESSAGES_STORE }) => {
        if (failedMessages.length) {
            store[convo.peerId] = failedMessages;
        }
        else {
            delete store[convo.peerId];
        }
        return store;
    })
        .catch(() => {
        // do nothing
    });
};
export const getConvosFailedMessagesFromStorage = async (storage) => {
    const failedMessagesStore = (await storage.getIDB(CONVOS_FAILED_MESSAGES_STORAGE_FIELD)) ||
        DEFAULT_CONVOS_FAILED_MESSAGES_STORE;
    if (failedMessagesStore.version !== CURRENT_STORAGE_VERSION) {
        storage
            .updateIDB(CONVOS_FAILED_MESSAGES_STORAGE_FIELD, () => DEFAULT_CONVOS_FAILED_MESSAGES_STORE)
            .catch(() => {
            // do nothing
        });
        return DEFAULT_CONVOS_FAILED_MESSAGES_STORE;
    }
    return failedMessagesStore;
};
//# sourceMappingURL=FailedMessagesManager.js.map