import { makeAutoObservable } from 'mobx';
import { externalIdToString } from '@vkontakte-internal/calls-core';
export class StreamRegistry {
    constructor() {
        this.streams = new Map();
        makeAutoObservable(this);
    }
    setStream(externalId, mediaType, mediaStream) {
        const updates = {
            data: mediaStream,
        };
        if (!mediaStream) {
            /**
             * Очищаем состояние саспенда при остановке потока
             * Для остановленных потоков не будут приходить апдейты с сервера
             * при изменении условий сети
             */
            updates.isSuspended = false;
        }
        this.updateRecord(externalId, mediaType, updates);
    }
    hasStream(externalId, mediaType) {
        return !!this.getStreamRecord(externalId, mediaType)?.data;
    }
    isStreamSuspended(externalId, mediaType) {
        return this.getStreamRecord(externalId, mediaType)?.isSuspended ?? false;
    }
    setStreamSuspended(externalId, mediaType, isSuspended) {
        this.updateRecord(externalId, mediaType, { isSuspended });
    }
    unsuspendAll() {
        this.streams.forEach((streamsMap) => {
            for (const mediaType of streamsMap.keys()) {
                streamsMap.set(mediaType, {
                    ...streamsMap.get(mediaType),
                    isSuspended: false,
                });
            }
        });
    }
    unregisterDevice(externalId) {
        this.streams.delete(externalIdToString(externalId));
    }
    clear() {
        this.streams.clear();
    }
    getMapForDevice(externalId) {
        return this.streams.get(externalIdToString(externalId));
    }
    getStreamRecord(externalId, mediaType) {
        return this.getMapForDevice(externalId)?.get(mediaType);
    }
    updateRecord(externalId, mediaType, props) {
        const streamsMap = this.getMapForDevice(externalId) ?? new Map();
        const prevStreamRecord = streamsMap.get(mediaType) ?? {
            data: null,
            isSuspended: false,
            mediaType,
        };
        streamsMap.set(mediaType, {
            ...prevStreamRecord,
            ...props,
        });
        this.streams.set(externalIdToString(externalId), streamsMap);
    }
}
//# sourceMappingURL=StreamRegistry.js.map