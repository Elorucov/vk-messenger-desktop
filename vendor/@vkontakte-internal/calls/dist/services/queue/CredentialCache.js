import { localStorage } from '@vkontakte/vkjs';
import { CallsAppId } from '@vkontakte-internal/calls-core';
/**
 * Просто менеджер для кредов очереди, креды храним только в пределах 5 минут после конца сессии, дольше не нужно
 */
export class CredentialCache {
    get cacheInMs() {
        return this.CACHE_LIFE_IN_MINUTES * 60 * 1000;
    }
    isActualTs(ts) {
        if (ts === null)
            return false;
        return ts + this.cacheInMs > Date.now();
    }
    getActualCredentialsFromLS() {
        try {
            const value = localStorage.getItem(this.key);
            if (!value)
                return [];
            const parsedData = JSON.parse(value);
            if ('data' in parsedData &&
                'lastUpdate' in parsedData &&
                this.isActualTs(parsedData.lastUpdate)) {
                return [parsedData.data, parsedData.lastUpdate];
            }
        }
        catch (err) { }
        return [];
    }
    constructor(vkId, appId = CallsAppId.WEB) {
        this.data = null;
        this.lastUpdate = null;
        this.CACHE_LIFE_IN_MINUTES = 5;
        this.key = `queue_credential_calls_cache_${vkId}_${appId}`;
        const [data, lastUpdate] = this.getActualCredentialsFromLS();
        if (data && lastUpdate) {
            this.data = data;
            this.lastUpdate = lastUpdate;
        }
    }
    put(data) {
        this.data = data;
        this.lastUpdate = Date.now();
        localStorage.setItem(this.key, JSON.stringify({ data, lastUpdate: this.lastUpdate }));
    }
    update(ts) {
        if (!this.data) {
            return;
        }
        this.data = {
            ...this.data,
            ts,
        };
        this.lastUpdate = Date.now();
        localStorage.setItem(this.key, JSON.stringify({ data: this.data, lastUpdate: this.lastUpdate }));
    }
    get() {
        if (this.data === null) {
            const [data, lastUpdate] = this.getActualCredentialsFromLS();
            if (data && lastUpdate) {
                this.data = data;
                this.lastUpdate = lastUpdate;
                return this.data;
            }
        }
        if (this.data && !this.isActualTs(this.lastUpdate)) {
            this.drop();
        }
        return this.data;
    }
    drop() {
        this.data = null;
        this.lastUpdate = null;
        localStorage.removeItem(this.key);
    }
}
//# sourceMappingURL=CredentialCache.js.map