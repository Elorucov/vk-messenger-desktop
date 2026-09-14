import { API_VERSION } from '@vkontakte-internal/api-schema-typescript';
import { APIRequest, CallbackService } from './helpers';
import { ParallelWorker } from './workers/parallel';
import { SequentialWorker } from './workers/sequential';
// Файл генерируется автоматически
import { methodGroups } from './schema';
import { Updates } from './updates';
import { APIMode, APIRequestMethod, APIRequestMode } from './types';
const API_BASE_URL = (typeof window !== 'undefined' && window.vk?.apiConfigDomains?.apiDomain) || 'api.vk.com';
export class API extends CallbackService {
    constructor(options, updatesOptions = {}) {
        super();
        this.globalParams = new Map();
        this.options = {
            token: '',
            mode: APIMode.SEQUENTIAL,
            requestMode: APIRequestMode.SEQUENTIAL,
            requestMethod: APIRequestMethod.FETCH,
            wait: 3_000,
            limit: 3,
            bridge: false,
            version: API_VERSION,
            baseUrl: `https://${API_BASE_URL}`,
            retryLimit: 3,
            timeout: 60_000,
            executeCount: 25,
            language: 'ru',
            executeUnsupportedMethods: [
                'photos.save',
                'photos.saveWallPhoto',
                'photos.saveOwnerPhoto',
                'photos.saveMessagesPhoto',
                'messages.setChatPhoto',
                'photos.saveMarketPhoto',
                'photos.saveMarketAlbumPhoto',
                'audio.save',
                'docs.save',
                'photos.saveOwnerCoverPhoto',
                'stories.save',
                'polls.savePhoto'
            ],
            logError: () => { },
            ...options
        };
        for (const group of methodGroups) {
            this[group] = new Proxy(Object.create(null), {
                get: (_, name) => (params, config) => {
                    if (name === 'toJSON') {
                        if (options.logError) {
                            options.logError(new Error('Internal API: Unsupported api method toJSON'));
                        }
                        return undefined;
                    }
                    return this.callWithRequest(new APIRequest({
                        api: this,
                        method: `${group}.${name}`,
                        params,
                        options: config,
                    }));
                }
            });
        }
        this.worker = this.getWorker();
        this.updates = new Updates(this, updatesOptions);
    }
    setOptions(options) {
        this.options = {
            ...this.options,
            ...options
        };
    }
    /**
     * Вызов execute
     */
    execute(params) {
        return this.call('execute', params);
    }
    /**
     * Вызов execute процедуры
     */
    procedure(name, params) {
        return this.call(`execute.${name}`, params);
    }
    /**
     * Сырой вызов метода
     */
    call(method, params) {
        return this.callWithRequest(new APIRequest({
            method,
            params,
            api: this
        }));
    }
    /**
     * Добавить запрос в очередь
     */
    callWithRequest(request) {
        this.worker.enqueue(request);
        return request.promise;
    }
    getWorker() {
        switch (this.options.mode) {
            case APIMode.PARALLEL:
                return new ParallelWorker(this);
            case APIMode.SEQUENTIAL:
                return new SequentialWorker(this);
        }
    }
}
//# sourceMappingURL=api.js.map