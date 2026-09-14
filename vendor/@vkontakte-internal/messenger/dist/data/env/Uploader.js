import { emptyPreview, fromApiAudio, fromApiDoc, fromApiPhoto, fromApiVideo, fromApiVoice, } from '../converter/AttachConverter';
import { IApi } from '../env/IApi';
import { IUploader } from '../env/IUploader';
import { exhaustivenessCheck, toNonEmpty } from '../../core/utils/misc';
import * as Peer from '../../core/model/Peer';
import * as Channel from '../../core/model/Channel';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { Time } from '../../core/utils/time';
export const IMAGE_TYPES = [
    'image/png',
    'image/gif',
    'image/jpeg',
    'image/webp',
];
export const VIDEO_TYPES = [
    'video/x-msvideo',
    'video/mp4',
    'video/mpeg',
    'video/3gpp',
    'video/quicktime',
    'video/x-flv',
    'video/x-ms-wmv',
    'video/avi',
    'video/webm',
    'video/x-matroska',
];
export const AUDIO_TYPES = [
    'audio/mp3',
    'audio/ogg',
    'audio/wav',
    'audio/mpeg',
    'audio/flac',
    'audio/aac',
    'audio/m4a',
    'audio/mp4',
    'audio/x-m4a',
];
const fileIsImage = (f) => f.kind === 'image';
const fileIsVideo = (f) => f.kind === 'video';
const fileIsAudio = (f) => f.kind === 'audio';
const fileIsDoc = (f) => f.kind === 'doc';
const fileIsVoice = (f) => f.kind === 'voice';
const fileIsOwnerPhoto = (f) => f.kind === 'owner-photo';
const fileIsChannelPhoto = (f) => f.kind === 'channel-photo';
const fileIsChatPhoto = (f) => f.kind === 'chat-photo';
const UPLOAD_SERVER_VALID_TIME = 5000; // 5 секунд uploadUrl актуальный
/**
 * Кешируем uploadUrl для одинаковых запросов
 * в течение 5 секунд
 */
class UploadUrlCache {
    cache = new Map();
    dropCacheInteervalId;
    constructor() {
        this.dropCacheInteervalId = window.setInterval(() => {
            this.dropCache.call(this);
            /**
             * Интервал будет очищать внутренний кеш
             * раз в минуту
             */
        }, Time.Minute);
    }
    getUploadServer(cacheKey, request) {
        let current = this.cache.get(cacheKey);
        if (!current) {
            current = request()
                .then((url) => {
                this.cache.set(cacheKey, {
                    url,
                    timestamp: Date.now(),
                });
                return url;
            })
                .catch((error) => {
                /**
                 * Если промис зафейлился по причине отсутствия сети (например),
                 * то необходимо сбросить кэш
                 */
                this.cache.delete(cacheKey);
                return Promise.reject(error);
            });
            this.cache.set(cacheKey, current);
            return current;
        }
        if (current instanceof Promise) {
            return current;
        }
        const isValid = this.validateCache(current.timestamp);
        if (isValid) {
            return Promise.resolve(current.url);
        }
        this.cache.delete(cacheKey);
        return this.getUploadServer(cacheKey, request);
    }
    dropCache() {
        if (this.cache.size === 0) {
            return;
        }
        Array.from(this.cache.entries()).forEach(([key, value]) => {
            /**
             * Не дропаем активный запрос
             */
            if (value instanceof Promise) {
                return;
            }
            const isValid = this.validateCache(value.timestamp);
            if (!isValid) {
                this.cache.delete(key);
            }
        });
    }
    validateCache(timestamp) {
        return Date.now() - timestamp <= UPLOAD_SERVER_VALID_TIME;
    }
    dispose() {
        window.clearInterval(this.dropCacheInteervalId);
    }
}
/**
 * Внутренний класс, реализующий запросы к серверу для получения
 * ссылок на загрузку вложений.
 */
class UploaderRequest {
    api;
    featureFlags;
    abortControllers = new Set();
    emitter = new Emitter();
    requestTimeout = 0;
    photosUploadUrlCache = new UploadUrlCache();
    wallPhotosUploadUrlCache = new UploadUrlCache();
    docsUploadUrlCache = new UploadUrlCache();
    wallDocsUploadUrlCache = new UploadUrlCache();
    uploadV2;
    uploadV2Voice;
    constructor(api, featureFlags) {
        this.api = api;
        this.featureFlags = featureFlags;
        this.uploadV2 = 1;
        this.uploadV2Voice = this.featureFlags.vkm_upload_v2_voice;
    }
    handleUploadV2Erros(data) {
        /**
         * Ошибки в теле ответа аплоадера - для кейсов с загрузкой
         * аватаров
         */
        if ('error_code' in data) {
            throw new Error(`${data.error_code}: ${data.error_msg}`);
        }
        /**
         * Оишибки в загруженных файлах - для кейсов с загрузкой
         * фото-вложений
         */
        if ('files' in data &&
            data.files.file1 &&
            'error_code' in data.files.file1) {
            throw new Error(`${data.files.file1.error_code}: ${data.files.file1.error_msg}`);
        }
    }
    async uploadImage({ file, trackId: uploadTrackId }, data) {
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const params = {
            peer_id: data.viewerId,
            group_id: data.groupId ? Peer.toRealId(data.groupId) : 0,
            upload_v2: this.uploadV2,
        };
        const apiGetUrlTrackId = IApi.resolveTrackId('photos.getMessagesUploadServer', uploadTrackId);
        const uploadServerRequest = () => this.api
            .fetch('photos.getMessagesUploadServer', params, {
            trackId: apiGetUrlTrackId,
        })
            .then(({ upload_url: uploadUrl }) => uploadUrl);
        const getUrl = () => this.photosUploadUrlCache.getUploadServer(JSON.stringify(params), uploadServerRequest);
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        /**
         * Сохраняем загруженный аттач
         */
        const apiSavePhotoTrackId = IApi.resolveTrackId('photos.saveMessagesPhoto', uploadTrackId);
        const savePhoto = async (savePhotParams) => {
            const apiPhotos = await this.api.fetch('photos.saveMessagesPhoto', { ...savePhotParams, group_id: params.group_id }, {
                trackId: apiSavePhotoTrackId,
            });
            if (apiPhotos.length === 0 || typeof apiPhotos[0] === 'undefined') {
                throw new Error('Метод photos.saveMessagesPhoto не вернул фотографию');
            }
            const photo = fromApiPhoto({ apiPhoto: apiPhotos[0] });
            if (typeof photo === 'undefined') {
                throw new Error('Не удалось конвертировать фотографию с сервера');
            }
            return photo;
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiSavePhotoTrackId);
        /*
         * V1 Аплоад
         */
        if (this.uploadV2 === 0) {
            body.append('file1', file);
            /**
             * Загружаем для V1
             */
            return this.uploadRequest({
                getUrl,
                abortGetUrl,
                body,
                uploadTrackId,
                postprocess: ({ data }) => savePhoto(data),
                abortPostprocess,
            });
        }
        /**
         * V2 Аплоад
         */
        body.append('file1', file);
        /**
         * Загружаем для V2
         */
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess: ({ data }) => {
                this.handleUploadV2Erros(data);
                return savePhoto({ upload_v2: 1, photo: JSON.stringify(data) });
            },
            abortPostprocess,
        });
    }
    async uploadVideo({ file, trackId: uploadTrackId }, data) {
        let target = 'messages';
        if (data.isChannel) {
            target = data.isCommunityChannel ? 'channel' : 'wall';
        }
        if (data.isComment) {
            target = data.isCommunityChannel ? 'channel_comment' : 'comment';
        }
        const getGroupId = () => {
            if ((target === 'channel' || target === 'wall') && isChannelData(data)) {
                return Channel.toRealGroupId(data.targetPeerId);
            }
            if (data.groupId) {
                return Peer.toRealId(data.groupId);
            }
            return undefined;
        };
        const params = {
            target,
            preview: 1,
            no_comments: 1,
            group_id: getGroupId(),
        };
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const apiGetUrlTrackId = IApi.resolveTrackId('video.save', uploadTrackId);
        const getUrl = () => this.api
            .fetch('video.save', params, { trackId: apiGetUrlTrackId })
            .then(({ upload_url: uploadUrl }) => {
            if (!uploadUrl) {
                /**
                 * Из-за того, что метод универсальный в типах описано, что upload_url может не возвращаться
                 * На практике такого происходить не должно
                 */
                throw new Error('В методе video.save не вернулся upload_url');
            }
            return uploadUrl;
        });
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        body.append('video_file', file);
        /**
         * Сохраняем загруженный аттач
         */
        const apiVideoGetTrackId = IApi.resolveTrackId('video.get', uploadTrackId);
        const postprocess = async ({ data: { video_id, owner_id }, }) => {
            const uploadedVideo = {
                kind: 'Video',
                id: video_id,
                ownerId: owner_id,
                image: [
                    {
                        url: emptyPreview,
                        width: 1,
                        height: 1,
                    },
                ],
                views: 0,
                isFromMessage: true,
            };
            /**
             * Получаем загруженное видео (с превью и длительностью)
             *
             * Необходимо для видео-файлов, которые не можем предзагрузить локально
             */
            const videos = await this.api.fetch('video.get', {
                owner_id,
                videos: `${owner_id}_${video_id}`,
                extended: 0,
            }, { trackId: apiVideoGetTrackId });
            const firstVideoItem = videos.items[0];
            if (!firstVideoItem) {
                return uploadedVideo;
            }
            const loadedVideo = fromApiVideo({
                apiVideo: firstVideoItem,
                useFirstFrame: true,
            });
            /**
             * Если видео еще не прошло обработку
             */
            return loadedVideo || uploadedVideo;
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiVideoGetTrackId);
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess,
            abortPostprocess,
        });
    }
    async uploadAudio({ file, trackId: uploadTrackId, }) {
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const params = {};
        const apiGetUrlTrackId = IApi.resolveTrackId('audio.getUploadServer', uploadTrackId);
        const getUrl = () => this.api
            .fetch('audio.getUploadServer', params)
            .then(({ upload_url: uploadUrl }) => uploadUrl);
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        body.append('file', file);
        /**
         * Сохраняем загруженный аттач
         */
        const apiAudioSaveTrackId = IApi.resolveTrackId('audio.save', uploadTrackId);
        const postprocess = async ({ data: { server, audio, hash }, }) => {
            const res = await this.api.fetch('audio.save', { server, audio, hash }, { trackId: apiAudioSaveTrackId });
            return fromApiAudio(res);
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiAudioSaveTrackId);
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess,
            abortPostprocess,
        });
    }
    async uploadDoc({ file, trackId: uploadTrackId }, data) {
        /**
         * Метод docs.getUploadServer не поддерживает group_id, что не позволяет загружать файлы в сообщества,
         * поэтому для сообщений сообществ используем метод docs.getMessagesUploadServer, а для всего остального docs.getUploadServer.
         * Так же метод docs.getUploadServer в отличии от docs.getMessagesUploadServer, позволяет загрузить файлы размером более +200 МБ.
         */
        const uploadServerMethod = !!data.groupId
            ? 'docs.getMessagesUploadServer'
            : 'docs.getUploadServer';
        const params = {
            peer_id: data.targetPeerId,
            group_id: data.groupId ? Peer.toRealId(data.groupId) : 0,
        };
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const apiGetUrlTrackId = IApi.resolveTrackId(uploadServerMethod, uploadTrackId);
        const uploadServerRequest = () => this.api
            .fetch(uploadServerMethod, params, {
            trackId: apiGetUrlTrackId,
        })
            .then(({ upload_url: uploadUrl }) => uploadUrl);
        const getUrl = () => this.docsUploadUrlCache.getUploadServer(JSON.stringify(params), uploadServerRequest);
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        body.append('file', file);
        /**
         * Сохраняем загруженный аттач
         */
        const apiDocsSaveTrackId = IApi.resolveTrackId('docs.save', uploadTrackId);
        const postprocess = async ({ data: { file }, }) => {
            const res = await this.api.fetch('docs.save', { file, group_id: params.group_id }, { trackId: apiDocsSaveTrackId });
            if (!res.doc) {
                throw new Error('Метод doc.save не вернул документ');
            }
            const result = fromApiDoc(res.doc);
            if (!result) {
                throw new Error('Не удалось конвертировать документ (нет поля url)');
            }
            return result;
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiDocsSaveTrackId);
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess,
            abortPostprocess,
        });
    }
    async uploadWallDoc({ file, trackId: uploadTrackId }, 
    // Временно не используем аргумент из-за проблемы каналов
    _data) {
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const params = {
            // @TODO: изменить на Channel.toRealGroupId(data.channelId) канала, когда метод починят
            group_id: 0,
        };
        const apiGetUrlTrackId = IApi.resolveTrackId('docs.getWallUploadServer', uploadTrackId);
        const uploadServerRequest = () => this.api
            .fetch('docs.getWallUploadServer', params)
            .then(({ upload_url: uploadUrl }) => uploadUrl);
        const getUrl = () => this.wallDocsUploadUrlCache.getUploadServer(JSON.stringify(params), uploadServerRequest);
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        body.append('file', file);
        /**
         * Сохраняем загруженный аттач
         */
        const apiDocsSaveTrackId = IApi.resolveTrackId('docs.save', uploadTrackId);
        const postprocess = async ({ data: { file }, }) => {
            const res = await this.api
                // @TODO: изменить на Channel.toRealGroupId(data.channelId), когда метод починят
                .fetch('docs.save', { file, group_id: 0 }, { trackId: apiDocsSaveTrackId });
            if (!res.doc) {
                throw new Error('Метод doc.save не вернул документ');
            }
            const result = fromApiDoc(res.doc);
            if (!result) {
                throw new Error('Не удалось конвертировать документ (нет поля url)');
            }
            return result;
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiDocsSaveTrackId);
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess,
            abortPostprocess,
        });
    }
    async uploadVoice({ file, trackId: uploadTrackId }, data) {
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const params = {
            type: 'audio_message',
            peer_id: data.targetPeerId,
            group_id: data.groupId ? Peer.toRealId(data.groupId) : 0,
        };
        let getUrl;
        let abortGetUrl;
        if (!this.uploadV2Voice) {
            const apiGetUrlTrackId = IApi.resolveTrackId('docs.getMessagesUploadServer', uploadTrackId);
            getUrl = () => this.api
                .fetch('docs.getMessagesUploadServer', params, {
                trackId: apiGetUrlTrackId,
            })
                .then(({ upload_url: uploadUrl }) => uploadUrl);
            abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        }
        else {
            const apiGetUrlTrackId = IApi.resolveTrackId('messages.getAudioMessageUploadServer', uploadTrackId);
            getUrl = () => this.api
                .fetch('messages.getAudioMessageUploadServer', { group_id: params.group_id }, {
                trackId: apiGetUrlTrackId,
            })
                .then(({ upload_url: uploadUrl }) => uploadUrl);
            abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        }
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        body.append('file', file);
        /**
         * Сохраняем загруженный аттач
         */
        if (!this.uploadV2Voice) {
            const apiDocsSaveTrackId = IApi.resolveTrackId('docs.save', uploadTrackId);
            const postprocessV1 = async ({ data: { file }, }) => {
                const res = await this.api.fetch('docs.save', { file });
                if (!res.audio_message) {
                    throw new Error('Метод doc.save не вернул аудиосообщение');
                }
                return fromApiVoice(res.audio_message);
            };
            const abortPostprocessV1 = () => this.api.dangerouslyAbort(apiDocsSaveTrackId);
            return this.uploadRequest({
                getUrl,
                abortGetUrl,
                body,
                uploadTrackId,
                postprocess: postprocessV1,
                abortPostprocess: abortPostprocessV1,
            });
        }
        const apiSaveAudioMessageTrackId = IApi.resolveTrackId('messages.saveAudioMessage', uploadTrackId);
        const saveAudioMessage = async (data) => {
            const apiVoice = await this.api.fetch('messages.saveAudioMessage', { file: JSON.stringify(data) }, {
                trackId: apiSaveAudioMessageTrackId,
            });
            return fromApiVoice(apiVoice);
        };
        const abortSaveAudioMessage = () => this.api.dangerouslyAbort(apiSaveAudioMessageTrackId);
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess: ({ data }) => {
                this.handleUploadV2Erros(data);
                return saveAudioMessage(data);
            },
            abortPostprocess: abortSaveAudioMessage,
        });
    }
    async uploadChatPhoto({ file, trackId: uploadTrackId }, data) {
        if (!data.targetPeerId || !Peer.isChatPeerId(data.targetPeerId)) {
            throw new Error('Для обновления аватара чата targetPeerId обязательно должен быть ChatId');
        }
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const crop = await defaultCropData(file);
        const params = {
            chat_id: Peer.toRealId(data.targetPeerId),
            crop_x: crop.x,
            crop_y: crop.y,
            crop_width: crop.width,
        };
        const apiGetUrlTrackId = IApi.resolveTrackId('photos.getChatUploadServer', uploadTrackId);
        const getUrl = () => this.api
            .fetch('photos.getChatUploadServer', params, {
            trackId: apiGetUrlTrackId,
        })
            .then(({ upload_url: uploadUrl }) => uploadUrl);
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        body.append('photo', file);
        /**
         * Сохраняем загруженный аттач
         */
        const apiSetChatPhotoTrackId = IApi.resolveTrackId('messages.setChatPhoto', uploadTrackId);
        const postprocess = async ({ data: { response }, }) => {
            const params = {
                file: response,
                group_id: 0,
            };
            if (data.groupId) {
                params.group_id = Peer.toRealId(data.groupId);
            }
            else {
                params.user_id = Peer.toRealId(data.viewerId);
            }
            await this.api.fetch('messages.setChatPhoto', params);
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiSetChatPhotoTrackId);
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess,
            abortPostprocess,
        });
    }
    async uploadOwnerPhoto({ file, trackId: uploadTrackId }, data) {
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const params = {
            owner_id: data.viewerId,
            upload_v2: this.uploadV2,
        };
        const apiGetUrlTrackId = IApi.resolveTrackId('photos.getOwnerPhotoUploadServer', uploadTrackId);
        const getUrl = () => this.api
            .fetch('photos.getOwnerPhotoUploadServer', params, {
            trackId: apiGetUrlTrackId,
        })
            .then(({ upload_url: uploadUrl }) => uploadUrl);
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        /**
         * Сохраняем загруженный аттач
         */
        const apiSaveOwnerPhotoTrackId = IApi.resolveTrackId('photos.saveOwnerPhoto', uploadTrackId);
        const saveOwnerPhoto = async (params) => {
            await this.api.fetch('photos.saveOwnerPhoto', params, {
                trackId: apiSaveOwnerPhotoTrackId,
            });
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiSaveOwnerPhotoTrackId);
        /**
         * V1 Аплоад
         */
        if (this.uploadV2 === 0) {
            body.append('photo', file);
            /**
             * Загружаем для V1
             */
            return this.uploadRequest({
                getUrl,
                abortGetUrl,
                body,
                uploadTrackId,
                postprocess: ({ data: { server, photo, hash } }) => saveOwnerPhoto({ owner_id: data.viewerId, server, hash, photo }),
                abortPostprocess,
            });
        }
        /**
         * V2 Аплоад
         */
        body.append('file1', file);
        /**
         * Загружаем для V2
         */
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess: ({ data }) => {
                this.handleUploadV2Erros(data);
                return saveOwnerPhoto({ upload_v2: 1, photo: JSON.stringify(data) });
            },
            abortPostprocess,
        });
    }
    async uploadChannelPhoto({ file, trackId: uploadTrackId }, data) {
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const params = {
            owner_id: data.targetPeerId,
        };
        const apiGetUrlTrackId = IApi.resolveTrackId('photos.getOwnerPhotoUploadServer', uploadTrackId);
        const getUrl = () => this.api
            .fetch('photos.getOwnerPhotoUploadServer', params, {
            trackId: apiGetUrlTrackId,
        })
            .then(({ upload_url: uploadUrl }) => uploadUrl);
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        body.append('photo', file);
        /**
         * Сохраняем загруженный аттач
         */
        const apiSaveOwnerPhotoTrackId = IApi.resolveTrackId('photos.saveOwnerPhoto', uploadTrackId);
        const postprocess = async ({ data: { hash, photo, server }, }) => {
            await this.api.fetch('photos.saveOwnerPhoto', {
                owner_id: Channel.toRealGroupId(data.targetPeerId),
                server,
                hash,
                photo,
            }, { trackId: apiSaveOwnerPhotoTrackId });
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiSaveOwnerPhotoTrackId);
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess,
            abortPostprocess,
        });
    }
    async uploadWallImage({ file, trackId: uploadTrackId }, data) {
        /**
         * Получаем ссылку на сервер для загрузки аттача
         */
        const params = {
            group_id: Channel.toRealGroupId(data.targetPeerId),
            upload_v2: 0,
        };
        const apiGetUrlTrackId = IApi.resolveTrackId('photos.getWallUploadServer', uploadTrackId);
        const uploadServerRequest = () => this.api
            .fetch('photos.getWallUploadServer', params, {
            trackId: apiGetUrlTrackId,
        })
            .then(({ upload_url: uploadUrl }) => uploadUrl);
        const getUrl = () => this.wallPhotosUploadUrlCache.getUploadServer(JSON.stringify(params), uploadServerRequest);
        const abortGetUrl = () => this.api.dangerouslyAbort(apiGetUrlTrackId);
        /**
         * Создаем данные для загрузки
         */
        const body = new FormData();
        body.append('photo', file);
        /**
         * Сохраняем загруженный аттач
         */
        const apiSaveWallPhotoTrackId = IApi.resolveTrackId('photos.saveWallPhoto', uploadTrackId);
        const postprocess = async ({ data: { server, hash, photo }, }) => {
            const apiPhotos = await this.api.fetch('photos.saveWallPhoto', {
                group_id: Channel.toRealGroupId(data.targetPeerId),
                server,
                hash,
                photo,
            }, { trackId: apiSaveWallPhotoTrackId });
            if (apiPhotos.length === 0 || typeof apiPhotos[0] === 'undefined') {
                throw new Error('Метод photos.saveWallPhoto не вернул фотографию');
            }
            const photoAttach = fromApiPhoto({ apiPhoto: apiPhotos[0] });
            if (typeof photoAttach === 'undefined') {
                throw new Error('Не удалось конвертировать фотографию с сервера');
            }
            return photoAttach;
        };
        const abortPostprocess = () => this.api.dangerouslyAbort(apiSaveWallPhotoTrackId);
        return this.uploadRequest({
            getUrl,
            abortGetUrl,
            body,
            uploadTrackId,
            postprocess,
            abortPostprocess,
        });
    }
    async convoUpload(file, data) {
        if (fileIsImage(file)) {
            return this.uploadImage(file, data);
        }
        if (fileIsVideo(file)) {
            return this.uploadVideo(file, data);
        }
        if (fileIsAudio(file)) {
            return this.uploadAudio(file);
        }
        if (fileIsDoc(file)) {
            return this.uploadDoc(file, data);
        }
        if (fileIsVoice(file)) {
            return this.uploadVoice(file, data);
        }
        if (fileIsChatPhoto(file)) {
            return this.uploadChatPhoto(file, data);
        }
        if (fileIsOwnerPhoto(file)) {
            return this.uploadOwnerPhoto(file, data);
        }
        return Promise.reject();
    }
    async channelsUpload(file, data) {
        if (fileIsImage(file)) {
            return this.uploadWallImage(file, data);
        }
        if (fileIsVideo(file)) {
            return this.uploadVideo(file, data);
        }
        if (fileIsAudio(file)) {
            return this.uploadAudio(file);
        }
        if (fileIsDoc(file)) {
            return this.uploadWallDoc(file, data);
        }
        if (fileIsChannelPhoto(file)) {
            return this.uploadChannelPhoto(file, data);
        }
        return Promise.reject();
    }
    /**
     * Метод реализует роутинг загрузок в зависимости от
     * данных мессенджера. Если данные мессенджера, содержат
     * в себе targetPeerId канала, то будут применены соответствующие
     * методы загрузки для канала.
     */
    async upload(file, data) {
        if (isChannelData(data)) {
            return this.channelsUpload(file, data);
        }
        if (isConvoData(data)) {
            return this.convoUpload(file, data);
        }
        return Promise.reject();
    }
    uploadRequest({ getUrl, abortGetUrl, body, uploadTrackId, postprocess, abortPostprocess, }) {
        const controller = new AbortController();
        const abortUpload = () => controller.abort();
        const abort = () => {
            abortGetUrl();
            abortUpload();
            abortPostprocess();
        };
        this.abortControllers.add(abort);
        const fetch = async () => {
            const url = await getUrl();
            return xhr(url, body, {
                signal: controller.signal,
                timeout: this.requestTimeout,
                headers: {
                    Accept: 'application/json, text/plain, */*',
                },
                onUploadProgress: ({ loaded, total }) => {
                    this.emitter.emit(uploadTrackId, {
                        loaded,
                        total,
                    });
                },
            })
                .then(postprocess)
                .finally(() => {
                this.abortControllers.delete(abort);
                this.emitter.removeListener(uploadTrackId);
            });
        };
        return {
            abort,
            trackId: uploadTrackId,
            response: fetch(),
        };
    }
    trackProgress(trackId, cb) {
        this.emitter.addListener(trackId, cb);
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        Array.from(this.abortControllers).forEach((abort) => abort());
        this.photosUploadUrlCache.dispose();
        this.wallPhotosUploadUrlCache.dispose();
        this.docsUploadUrlCache.dispose();
        this.wallDocsUploadUrlCache.dispose();
    }
}
/**
 * Класс реализующий батчинг вызова onUploadFinish.
 *
 * Зачем это надо:
 * 1) Если вложений (например фоток) много и грузятся быстро,
 * то будет дудос редьюсера при добавлении аттачей (но это незначительный кейс).
 * 2) Загруженные аттачи будут добавляться в драфт по мере загрузки, ломая
 * при этом порядок, при котором юзер закидывал их изначально. BatchQueue это фиксит.
 *
 * Загрузка вложений остается параллельной, а добавление аттачей в стор
 * становится синхронным. Притом разные виды вложений добавляются отдельно друг
 * от друга. То есть загрузка видео не блочит загрузку фотографий. Так как их порядок
 * отображения не зависит от порядка загрузки.
 *
 * Используется только в случае загрузки более 1 вложения в партии. (!!!)
 */
class BatchQueue {
    state;
    /**
     * В Uploader есть свойство uploads. Там это вообще все загрузки в данный момент.
     * Здесь uploads - это конкретный кусок вложений, который пользователь закинул.
     * Например, юзер закинул загружаться сразу 5 фотографий, будет 1 очередь из
     * добавления 5 загруженных аттачей. Если юзер закинет еще вложений, будут созданы
     * новые очереди с корректным порядком выбора вложений для загрузки.
     */
    uploads = new Map();
    constructor(state) {
        this.state = state;
    }
    /**
     * Добавление очереди на загрузку
     */
    start = (queueId, trackIds, onUploadFinish) => {
        this.uploads.set(queueId, {
            trackIds,
            onUploadFinish,
            finishedUploads: new Map(),
        });
    };
    /**
     * Если в какой-то из очередей упала загрузка (или юзер ее абортнул),
     * то выкидываем загрузку из очереди добавления
     */
    removeUpload = (queueId, trackId) => {
        const queue = this.uploads.get(queueId);
        if (!queue) {
            return;
        }
        queue.trackIds = queue.trackIds.filter((id) => id !== trackId);
        /**
         * Всегда проверяем готовы ли мы уже завершить добавления.
         * Например, если загрузились 3 из 4 вложения и последнее юзер абортнул,
         * то включаем добавление.
         */
        this.tryFinish(queueId);
    };
    /**
     * Добавляем загруженные аттачи в очередь на запуск onUploadFinish
     */
    push = (queueId, { trackId, attach, }) => {
        const queue = this.uploads.get(queueId);
        if (!queue) {
            return;
        }
        queue.finishedUploads.set(trackId, attach);
        /**
         * Опять же пробуем завершить добавление, если, например,
         * был загружен последний аттач из очереди
         */
        this.tryFinish(queueId);
    };
    /**
     * Попытка запуска батчинга onUploadFinish
     */
    tryFinish = (queueId) => {
        const queue = this.uploads.get(queueId);
        if (!queue) {
            return;
        }
        const { trackIds, finishedUploads } = queue;
        if (trackIds.length === finishedUploads.size) {
            /**
             * Восстанавливаем порядок, в котором юзер закинул свои вложения
             */
            const resultWithCorrectOrder = new Map(trackIds.reduce((acc, trackId) => {
                const attach = finishedUploads.get(trackId);
                if (attach) {
                    acc.push([trackId, attach]);
                }
                return acc;
            }, []));
            /**
             * Не забываем почистить внутренние состояния.
             * Удаляем очередь.
             */
            this.state.remove(trackIds);
            this.uploads.delete(queueId);
            queue.onUploadFinish?.(resultWithCorrectOrder);
        }
    };
}
/**
 * Внутренний класс, инкапсулирующий всю логику добавления, обновления
 * и удаления оптимистичных аттачей состояния аплоадара.
 */
export class UploaderState {
    /**
     * Оптимистичные аттачи
     */
    attaches = new Map();
    emitter = new Emitter();
    subscribe(trackId, listener) {
        this.emitter.addListener(trackId, listener);
        return () => {
            this.emitter.removeListener(trackId);
        };
    }
    get(trackId) {
        return this.attaches.get(trackId);
    }
    filterMissing(trackIds) {
        return trackIds.filter((trackId) => !this.attaches.has(trackId));
    }
    update(trackId, update) {
        const attach = this.attaches.get(trackId);
        const newAttach = typeof update === 'function' ? update(attach) : update;
        if (!newAttach) {
            return;
        }
        this.attaches.set(trackId, newAttach);
        this.emitter.emit(trackId, newAttach);
    }
    remove(trackIds) {
        new Set(trackIds).forEach((trackId) => {
            this.attaches.delete(trackId);
            this.emitter.removeListener(trackId);
        });
    }
}
/**
 * Модуль загрузки аттачей
 *
 * Умеет загружать:
 * - аттачи фотографий, аудиозаписей, видео и документов
 * - аудиосообщения
 * - фотографию-аватарку чата
 *
 * Полезная ссылка: https://vk.com/dev/upload_files
 */
export class Uploader extends UploaderRequest {
    /**
     * Текущие загрузки
     */
    uploads = new Map();
    /**
     * Не загрузившиеся файлы (по причине ошибки и тд)
     */
    failedUploads = new Map();
    /**
     * Оптимистичные аттачи
     */
    state = new UploaderState();
    /**
     * Очередь для завершения загрузки
     */
    queue = new BatchQueue(this.state);
    /**
     * Основной и единственный метод для отправки
     * запросов на загрузку файлов
     * @param entities Массив сущностей на загрузку - файлы или войс
     * @param options Опции загрузки - как файлы, как войс, как аватарка чата и тп.
     * @param messengerData Айди пиров
     * @param handlers Коллбеки на начало загрузки, апдейты, окончание загрузки, ошибки и тп
     */
    uploadFiles(entities, options, messengerData, handlers = {}) {
        /**
         * Каждая сущность преобразовывается в FileInfo
         */
        const fileInfoPromises = entities.map((entity) => this.toUploaderFileInfo(entity, options).catch(() => {
            /**
             * В случае невозможности конвертации файла (битый файл) показывапем ошибку
             */
            handlers.onConvertationError?.(entity);
            return null;
        }));
        Promise.all(fileInfoPromises)
            .then((results) => {
            const fileInfoGroups = results
                /**
                 * Убираем битые данные
                 */
                .filter((item) => item !== null)
                /**
                 * Собираем группы загрузок, чтобы мочь параллельно грузить,
                 * но сохранять различные группы аттачей отдельно друг от друга
                 * (по мере загрузки)
                 */
                .reduce((acc, fileInfo) => {
                acc[fileInfo.kind] = [...(acc[fileInfo.kind] || []), fileInfo];
                return acc;
            }, {});
            Object.values(fileInfoGroups).forEach((fileInfos) => {
                const trackIds = fileInfos.map(({ trackId }) => trackId);
                /**
                 * Если вложений более 1, то создаем для них очередь
                 */
                let queueId = undefined;
                if (fileInfos.length > 1) {
                    queueId = nanoid(5);
                    this.queue.start(queueId, trackIds, handlers.onUploadFinish);
                }
                fileInfos.forEach((preparedFile) => {
                    /**
                     * Запускаем параллельную загрузку вложений в рамках очереди,
                     * либо без очереди, если в партии всего 1 аттач.
                     */
                    this.doUpload(preparedFile, messengerData, handlers, queueId);
                });
            });
        })
            .catch((error) => {
            console.error('[UPLOADER] Ошибка', error);
        });
    }
    /**
     * Метод для остановки загрузки и/или удаления оптимистичного аттача
     * по его trackId. Можно и нужно вызывать прямо из инстанса uploader
     */
    abortUpload(trackId) {
        const upload = this.uploads.get(trackId);
        if (upload) {
            if (upload.queueId) {
                /**
                 * Удаляем из очереди отмененную загрузку
                 */
                this.queue.removeUpload(upload.queueId, upload.process.trackId);
            }
            upload.process.abort();
            upload.handlers.onUploadAbort?.(trackId);
            this.uploads.delete(trackId);
        }
        const failedUpload = this.failedUploads.get(trackId);
        if (failedUpload) {
            failedUpload.handlers.onUploadAbort?.(trackId);
            this.failedUploads.delete(trackId);
        }
        this.state.remove([trackId]);
    }
    /**
     * Метод для повторной загрузки в случае ошибки. Имеет схожие сигнатуру
     * и способ применения как и abortUpload
     */
    retryUpload(trackId) {
        const failedUpload = this.failedUploads.get(trackId);
        if (failedUpload) {
            this.failedUploads.delete(trackId);
            const { fileInfo, messengerData, handlers } = failedUpload;
            /**
             * Попытка повторно загрузить аттач БЕЗ очереди
             */
            this.doUpload(fileInfo, messengerData, handlers);
            this.state.update(fileInfo.trackId, (attach) => {
                if (!attach) {
                    return;
                }
                return {
                    ...attach,
                    error: false,
                };
            });
        }
    }
    /**
     * Аплоадер всегда знает, что было загружено и что требуется удалить.
     * Метод применяется для очистки драфта от несостоявшихся загрузок
     * в момент монтирования компонента
     */
    getOrphans(trackIds) {
        return this.state.filterMissing(trackIds);
    }
    /**
     * Подписка на оптимистичные аттачи
     */
    subscribe(trackIds, listener) {
        if (trackIds.length === 0) {
            return () => { };
        }
        listener(this.getState(trackIds));
        const subs = trackIds.map((trackId) => this.state.subscribe(trackId, () => {
            listener(this.getState(trackIds));
        }));
        return (externalCleanup) => {
            subs.forEach((unsub) => unsub());
            externalCleanup(trackIds);
        };
    }
    /**
     * Метод для получения объекта оптимистичных аттачей
     */
    getState(trackIds) {
        if (trackIds.length === 0) {
            return {};
        }
        const attachesArray = trackIds.reduce((acc, trackId) => {
            const attach = this.state.get(trackId);
            if (attach) {
                acc.push(attach);
            }
            return acc;
        }, []);
        return this.buildOptimisticAttachments(attachesArray);
    }
    /**
     * Внутренний метод аплоадера для загрузки единственного аттача.
     * Ввиду итерации вызовов этого метода, реализуется параллельная загрузка
     * всех сущностей из массива, отправленных на загрузку. Функционал очереди
     * реализован ниже, в UploaderRequest.
     */
    doUpload(fileInfo, messengerData, handlers, 
    /**
     * Айди очереди может не быть, если производится попытка повторной загрузки аттача
     * или если загружается всего 1 вложение в партии
     */
    queueId) {
        const { trackId } = fileInfo;
        handlers.onUploadStart?.(trackId);
        this.upload(fileInfo, messengerData)
            .then(async (currentUpload) => {
            /**
             * Начинаем обрабатывать загрузку
             */
            this.uploads.set(trackId, { process: currentUpload, handlers, queueId });
            this.trackProgress(trackId, ({ loaded, total }) => this.updateAttachProgress(trackId, { loaded, total, error: false }, handlers));
            try {
                const response = await Promise.resolve(currentUpload.response);
                const attach = this.modifyUploadedAttach(trackId, response);
                /**
                 * Если загрузка производилась в очереди, то закидываем
                 * загруженный аттач в очередь на добавление
                 */
                if (queueId) {
                    this.queue.push(queueId, {
                        trackId,
                        attach,
                    });
                }
                else {
                    /**
                     * Если вне очереди, то добавляем сразу
                     */
                    const result = new Map([[trackId, attach]]);
                    handlers.onUploadFinish?.(result);
                    this.state.remove([trackId]);
                    this.uploads.delete(trackId);
                }
            }
            catch (error) {
                /**
                 * Ошибка аплоада файлов, показываем сообщение, кроме случаев,
                 * когда сами отменили загрузку
                 */
                if (error instanceof IUploader.AbortError ||
                    error instanceof IApi.AbortError ||
                    /**
                     * Если это ошибка API по причине аборта, она может быть string
                     */
                    (typeof error === 'string' && error.toLowerCase().includes('abort'))) {
                    return Promise.resolve();
                }
                return await Promise.reject(error);
            }
        })
            .catch((e) => {
            console.error('[UPLOADER] Ошибка загрузки', e);
            handlers.onError?.(trackId);
            /**
             * Если загрузка зафейлилась, удаляем ее из очереди,
             * чтобы не блокировать добавление остальных
             */
            if (queueId) {
                this.queue.removeUpload(queueId, trackId);
            }
            this.uploads.delete(trackId);
            this.failedUploads.set(trackId, {
                fileInfo: fileInfo,
                messengerData,
                handlers,
            });
            this.updateAttachProgress.call(this, trackId, {
                loaded: 0,
                total: 0,
                error: true,
            }, handlers);
        });
    }
    async toUploaderFileInfo(entity, { asFiles, asVoice, asChatPhoto, asOwnerPhoto, asChannelPhoto, }) {
        /**
         * Обрабатываем данные голосового сообщения
         */
        if (!(entity instanceof File)) {
            if (!asVoice) {
                throw new Error('Загрузить аудиосообщения можно только с флагом asVoice');
            }
            const { blob, duration, waveform } = entity;
            const file = new File([blob], 'voice_recording', {
                type: 'audio/ogg',
            });
            const voice = Uploader.toFileInfo(file, 'voice');
            const optimisticVoice = await toOptimisticVoice(voice, blob, duration, waveform);
            this.state.update(voice.trackId, optimisticVoice);
            return voice;
        }
        /**
         * Обрабатываем файлы на основе флагов
         */
        const file = entity;
        if (asChatPhoto) {
            return Uploader.toFileInfo(file, 'chat-photo');
        }
        if (asOwnerPhoto) {
            return Uploader.toFileInfo(file, 'owner-photo');
        }
        if (asChannelPhoto) {
            return Uploader.toFileInfo(file, 'channel-photo');
        }
        if (!asFiles && isImage(file) && !isGif(file)) {
            const image = Uploader.toFileInfo(file, 'image');
            const optimisticImage = await toOptimisticPhoto(image);
            this.state.update(image.trackId, optimisticImage);
            return image;
        }
        if (!asFiles && (isVideo(file) || isSupportedVideo(file))) {
            const video = Uploader.toFileInfo(file, 'video');
            const optimisticVideo = await toOptimisticVideo(video);
            this.state.update(video.trackId, optimisticVideo);
            return video;
        }
        if (!asFiles && isAudio(file)) {
            const audio = Uploader.toFileInfo(file, 'audio');
            const optimisticAudio = await toOptimisticAudio(audio);
            this.state.update(audio.trackId, optimisticAudio);
            return audio;
        }
        const doc = Uploader.toFileInfo(file, 'doc');
        const optimisticDoc = await toOptimisticDoc(doc);
        this.state.update(doc.trackId, optimisticDoc);
        return doc;
    }
    /**
     * На случай, если необходимо изменить как-то аттач или сматчить его
     * с оптимистичной копией (как сейчас, в случае с видео)
     */
    modifyUploadedAttach(trackId, upload) {
        /**
         * Если загружались аватарки, то upload будет пустым, в таком случае
         * возвращаем отсутствие аттача
         */
        if (!upload) {
            return null;
        }
        const optimisticAttach = this.state.get(trackId);
        let attach = upload;
        if (upload.kind === 'Video' &&
            optimisticAttach?.kind === 'OptimisticVideo') {
            /**
             * Фикс пустого превью.
             * Если видео не успеет обработаться на сервере, то попытаемся
             * показать локальное превью, если есть
             */
            const hasLocalDuration = !!optimisticAttach.duration;
            const hasLocalPreview = optimisticAttach.image.url !== emptyPreview;
            const isVideoReady = upload.image.length > 1 || upload.image[0].url !== emptyPreview;
            if (hasLocalDuration && hasLocalPreview && !isVideoReady) {
                attach = {
                    ...upload,
                    duration: optimisticAttach.duration,
                    image: [optimisticAttach.image],
                };
            }
        }
        return attach;
    }
    updateAttachProgress(trackId, progress, { onUploadProgressUpdate }) {
        this.state.update(trackId, (attach) => {
            if (!attach) {
                return;
            }
            /**
             * Во время загрузки аттача отправляем сообщение о том,
             * что пользователь загружает тот или иной тип файла
             * (sendActivity)
             */
            switch (attach.kind) {
                case 'OptimisticPhoto':
                    onUploadProgressUpdate?.('photo');
                    break;
                case 'OptimisticVideo':
                    onUploadProgressUpdate?.('video');
                    break;
                case 'OptimisticDoc':
                    onUploadProgressUpdate?.('file');
                    break;
                default:
                    break;
            }
            return { ...attach, ...progress };
        });
    }
    /**
     * Из массива оптимистичных аттачей создает объект оптимистичных
     * аттачей, который можно использовать как состояние загрузки
     * в компонентах
     */
    buildOptimisticAttachments(attachesArray) {
        return attachesArray.reduce((acc, attach) => {
            const photos = [];
            const videos = [];
            const audios = [];
            const docs = [];
            switch (attach.kind) {
                case 'OptimisticPhoto':
                    photos.push(attach);
                    break;
                case 'OptimisticVideo':
                    videos.push(attach);
                    break;
                case 'OptimisticAudio':
                    audios.push(attach);
                    break;
                case 'OptimisticDoc':
                    docs.push(attach);
                    break;
                case 'OptimisticVoice':
                    acc.voice = attach;
                    break;
                default:
                    break;
            }
            if (photos.length) {
                acc.photos = [...(acc.photos || []), ...photos];
            }
            if (videos.length) {
                acc.videos = [...(acc.videos || []), ...videos];
            }
            if (audios.length) {
                acc.audios = [...(acc.audios || []), ...audios];
            }
            if (docs.length) {
                acc.docs = [...(acc.docs || []), ...docs];
            }
            return acc;
        }, {});
    }
    /**
     * Статичный метод для удобной очистки внутреннего состояния
     * компонента, который основывается на состоянии оптимистичных
     * аттачей аплоадера. Чаще всего используется в cleanup эффектах.
     */
    static clearOptimisticAttachments(draft, trackIds) {
        trackIds.forEach((trackId) => {
            if ('photos' in draft) {
                if (!draft.photos) {
                    return;
                }
                const photos = toNonEmpty(draft.photos.filter(({ id }) => id !== trackId));
                if (photos) {
                    draft.photos = photos;
                }
                else {
                    delete draft.photos;
                }
            }
            if ('videos' in draft) {
                if (!draft.videos) {
                    return;
                }
                const videos = toNonEmpty(draft.videos.filter(({ id }) => id !== trackId));
                if (videos) {
                    draft.videos = videos;
                }
                else {
                    delete draft.videos;
                }
            }
            if ('audios' in draft) {
                if (!draft.audios) {
                    return;
                }
                const audios = toNonEmpty(draft.audios.filter(({ id }) => id !== trackId));
                if (audios) {
                    draft.audios = audios;
                }
                else {
                    delete draft.audios;
                }
            }
            if ('docs' in draft) {
                if (!draft.docs) {
                    return;
                }
                const docs = toNonEmpty(draft.docs.filter(({ id }) => id !== trackId));
                if (docs) {
                    draft.docs = docs;
                }
                else {
                    delete draft.docs;
                }
            }
            if ('voice' in draft) {
                delete draft.voice;
            }
        });
    }
    /**
     * Из массива аттачей создает объект аттачей, который можно
     * использовать в драфте
     */
    static buildAttachments(attachesArray) {
        return attachesArray
            .filter((item) => item !== null)
            .reduce((acc, attach) => produce(acc, (draft) => {
            let photos = null;
            let videos = null;
            let audios = null;
            let docs = null;
            switch (attach.kind) {
                case 'Photo':
                    photos = toNonEmpty([attach]);
                    break;
                case 'Video':
                    videos = toNonEmpty([attach]);
                    break;
                case 'Audio':
                    audios = toNonEmpty([attach]);
                    break;
                case 'Doc':
                    docs = toNonEmpty([attach]);
                    break;
                case 'Voice':
                    draft.voice = attach;
                    break;
                default:
                    break;
            }
            if (photos?.length) {
                draft.photos = [...(acc.photos || []), ...photos];
            }
            if (videos?.length) {
                draft.videos = [...(acc.videos || []), ...videos];
            }
            if (audios?.length) {
                draft.audios = [...(acc.audios || []), ...audios];
            }
            if (docs?.length) {
                draft.docs = [...(acc.docs || []), ...docs];
            }
        }), {});
    }
    static hash() {
        return Math.floor(1e8 * Math.random() + 1e8).toString(16);
    }
    /**
     * Возвращает идентификатор, который можно использовать
     * для аборта запросов или трекинга их прогресса.
     */
    static resolveTrackId(type, tracker) {
        if (tracker.length === 0) {
            throw new Error('Нельзя отдавать пустую строку в Uploader.resolveTrackId');
        }
        return `${type}-${tracker}`;
    }
    static toFileInfo(file, kind) {
        switch (kind) {
            case 'image':
                return {
                    kind: 'image',
                    trackId: Uploader.resolveTrackId('image', Uploader.hash()),
                    file,
                };
            case 'video':
                return {
                    kind: 'video',
                    trackId: Uploader.resolveTrackId('video', Uploader.hash()),
                    file,
                };
            case 'audio':
                return {
                    kind: 'audio',
                    trackId: Uploader.resolveTrackId('audio', Uploader.hash()),
                    file,
                };
            case 'doc':
                return {
                    kind: 'doc',
                    trackId: Uploader.resolveTrackId('doc', Uploader.hash()),
                    file,
                };
            case 'voice':
                return {
                    kind: 'voice',
                    trackId: Uploader.resolveTrackId('voice', Uploader.hash()),
                    file,
                };
            case 'chat-photo':
                return {
                    kind: 'chat-photo',
                    trackId: Uploader.resolveTrackId('chat-photo', Uploader.hash()),
                    file,
                };
            case 'owner-photo':
                return {
                    kind: 'owner-photo',
                    trackId: Uploader.resolveTrackId('owner-photo', Uploader.hash()),
                    file,
                };
            case 'channel-photo':
                return {
                    kind: 'channel-photo',
                    trackId: Uploader.resolveTrackId('channel-photo', Uploader.hash()),
                    file,
                };
            default:
                exhaustivenessCheck(kind);
        }
    }
}
class Emitter {
    map = new Map();
    addListener(key, callback) {
        this.map.set(key, [...(this.map.get(key) || []), callback]);
    }
    removeListener(key) {
        this.map.delete(key);
    }
    emit(key, event) {
        this.map.get(key)?.forEach((cb) => cb(event));
    }
}
export function isImage(item) {
    if (item instanceof DataTransferItem && item.kind !== 'file') {
        return false;
    }
    return Boolean(item.type && IMAGE_TYPES.includes(item.type));
}
export function isGif(item) {
    return isImage(item) && item.type === 'image/gif';
}
export function isSupportedVideo(file) {
    const extension = getExtension(file.name);
    /**
     * Некоторые файлы (в данном случае видео формата x-matroska),
     * не поддерживаются браузером с точки зрения mime-type, отдавая
     * в свойстве type пустую строку.
     *
     * Пробуем грузить такие видео, полагаясь на расширение файла.
     */
    const almostSupportedTypes = ['mkv'];
    return file.type === '' && almostSupportedTypes.includes(extension);
}
export function areImages(items) {
    return items.every(isImage);
}
export function isVideo(item) {
    if (item instanceof DataTransferItem && item.kind !== 'file') {
        return false;
    }
    if (item instanceof File && !item.type) {
        /**
         * У некоторых типов видео-файлов отсутствуют mimeType'ы,
         * проверяем дополнительно по названию файла
         */
        return /\.wmv$|\.avi$/.test(item.name);
    }
    return Boolean(item.type && VIDEO_TYPES.includes(item.type));
}
export function areVideos(items) {
    return items.every(isVideo);
}
export function isAudio(item) {
    if (item instanceof DataTransferItem && item.kind !== 'file') {
        return false;
    }
    return Boolean(item.type && AUDIO_TYPES.includes(item.type));
}
export function areAudios(items) {
    return items.every(isAudio);
}
export function arePreviewable(items) {
    return items.some(isImage) || items.some(isVideo);
}
export function isDirectory(item) {
    if (item instanceof DataTransferItem && item.kind === '') {
        return true;
    }
    return Boolean(item.type === '');
}
export function haveDirectory(items) {
    return items.some(isDirectory);
}
export function preloadImage(file) {
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve({
                url,
                width: image.width,
                height: image.height,
            });
        };
        image.onerror = reject;
        image.src = url;
    });
}
function preloadVideoFromUrl(url) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.volume = 0;
        video.preload = 'metadata';
        video.onloadedmetadata = () => resolve(video);
        video.onerror = reject;
        video.src = url;
    });
}
function preloadVideo(file) {
    const url = URL.createObjectURL(file);
    return preloadVideoFromUrl(url);
}
function getExtension(name) {
    const extMatch = /\.([0-9a-z]+)$/i.exec(name);
    return extMatch?.[1] || '';
}
async function getImageFromVideo(video) {
    function getVideoPreview(video, time) {
        return new Promise((resolve, reject) => {
            video.onseeked = () => {
                if (!video.videoWidth || !video.videoHeight) {
                    resolve(undefined);
                }
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(undefined);
                    return;
                }
                ctx.drawImage(video, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
            };
            video.onerror = reject;
            video.currentTime = time;
        });
    }
    try {
        return getVideoPreview(video, video.duration * 0.5);
    }
    catch (err) {
        if (typeof err === 'string' || !(err instanceof Event)) {
            return Promise.reject(err);
        }
        const target = err.composedPath()?.[0];
        /**
         *
         * MediaError
         * code: 4
         * message: DECODER_ERROR_NOT_SUPPORTED: audio decoder initialization failed
         */
        if (!(target instanceof HTMLVideoElement) || target?.error?.code !== 4) {
            return Promise.reject(err);
        }
        const reloadedVideo = await preloadVideoFromUrl(video.src);
        /**
         * Перезапускаем видео с currentTime 1, т.к. некоторые браузеры
         * (Yandex) не поддерживают прелоад видео до половины - ME-34372
         */
        return getVideoPreview(reloadedVideo, Math.min(video.duration, 1));
    }
}
async function toOptimisticPhoto(fileInfo) {
    const image = await preloadImage(fileInfo.file);
    return {
        kind: 'OptimisticPhoto',
        id: fileInfo.trackId,
        image,
        loaded: 0,
        total: fileInfo.file.size,
    };
}
async function toOptimisticVideo(fileInfo) {
    let video = null;
    let url = emptyPreview;
    /**
     * Попытаемся взять превью из видео, однако браузер
     * может не смочь открыть видео-файл какого-то определенного
     * формата (типа avi на MacOS или webm на IOs), в таком случае
     * фолбечимся на черный квадрат
     */
    try {
        video = await preloadVideo(fileInfo.file);
        url = (await getImageFromVideo(video)) || emptyPreview;
    }
    catch { }
    return {
        kind: 'OptimisticVideo',
        id: fileInfo.trackId,
        duration: Math.floor(video?.duration || 0),
        loaded: 0,
        total: fileInfo.file.size,
        image: {
            url,
            width: video?.videoWidth || 1,
            height: video?.videoHeight || 1,
        },
    };
}
function toOptimisticAudio(fileInfo) {
    return new Promise((resolve) => {
        const audio = new Audio();
        const url = URL.createObjectURL(fileInfo.file);
        audio.addEventListener('loadedmetadata', () => {
            resolve({
                kind: 'OptimisticAudio',
                id: fileInfo.trackId,
                duration: audio.duration,
                artist: '',
                title: fileInfo.file.name,
                loaded: 0,
                total: fileInfo.file.size,
            });
        });
        audio.src = url;
    });
}
async function toOptimisticDoc(fileInfo) {
    const optimisticDoc = {
        kind: 'OptimisticDoc',
        id: fileInfo.trackId,
        title: fileInfo.file.name,
        size: fileInfo.file.size,
        ext: getExtension(fileInfo.file.name),
        loaded: 0,
        total: fileInfo.file.size,
    };
    if (isImage(fileInfo.file)) {
        const image = await preloadImage(fileInfo.file);
        return { ...optimisticDoc, image };
    }
    return optimisticDoc;
}
function toOptimisticVoice(fileInfo, blob, duration, waveform) {
    return Promise.resolve({
        kind: 'OptimisticVoice',
        id: fileInfo.trackId,
        blob,
        duration,
        waveform,
        loaded: 0,
        total: fileInfo.file.size,
    });
}
function defaultCropData(file) {
    return new Promise((resolve) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
            const size = Math.min(image.width, image.height);
            const x = Math.floor((image.width - size) / 2);
            const y = Math.floor((image.height - size) / 2);
            resolve({
                x,
                y,
                width: size,
            });
        };
        image.src = url;
    });
}
function isChannelData(data) {
    return (!!data.targetPeerId &&
        Channel.isChannelId(data.targetPeerId) &&
        !!data.isChannel);
}
function isConvoData(data) {
    return !isChannelData(data);
}
/**
 * Функция, проверяющая, что переданный айди является айдишником канала.
 *
 * Также дополнительно проверяем по флагу, так как конва с сообществом
 * обладает айдишником канала.
 *
 * Проверка на айди по-прежнему нужна для типов.
 */
export function isChannelUpload(id, isChannel) {
    return !!id && Channel.isChannelId(id) && !!isChannel;
}
/**
 * Функция, проверяющая, что переданный айди является айдишником беседы.
 *
 * Дополнительно проверяем кейс, когда беседа с сообществом обладаем айдишником
 * канала, но необходимо использовать методы сообщений и писать в драфты сообщений
 */
export function isConvoUpload(id, isChannel) {
    return (!!id && !Channel.isChannelId(id)) || !isChannel;
}
const DONE_STATE = 4;
const SUCCESS_STATUS = 200;
function xhr(url, data, options = {}) {
    return new Promise((resolve, reject) => {
        const { method = 'POST', signal, onUploadProgress, headers = {}, timeout, } = options;
        if (signal?.aborted) {
            return reject(new IUploader.AbortError());
        }
        const request = new XMLHttpRequest();
        const abort = () => request.abort();
        if (signal) {
            signal.addEventListener('abort', abort);
            request.addEventListener('readystatechange', () => {
                const { readyState } = request;
                if (readyState === DONE_STATE) {
                    signal.removeEventListener('abort', abort);
                }
            });
        }
        request.addEventListener('abort', () => {
            reject(new IUploader.AbortError());
        });
        request.addEventListener('error', reject);
        request.addEventListener('timeout', () => {
            reject(new IUploader.TimeoutError());
        });
        request.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                onUploadProgress?.(event);
            }
        });
        request.addEventListener('loadend', () => {
            const { readyState, status, responseText } = request;
            let data;
            try {
                data = JSON.parse(responseText);
            }
            catch (e) {
                return reject(e);
            }
            if (readyState === DONE_STATE && status === SUCCESS_STATUS) {
                return resolve({ data });
            }
            return reject(data);
        });
        request.open(method, url, true);
        Object.entries(headers).forEach(([name, value]) => {
            request.setRequestHeader(name, value);
        });
        if (timeout) {
            request.timeout = timeout;
        }
        request.send(data);
    });
}
//# sourceMappingURL=Uploader.js.map