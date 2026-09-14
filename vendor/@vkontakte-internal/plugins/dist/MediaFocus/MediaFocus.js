import { __decorate, __metadata } from "tslib";
import { makeObservable, computed, observable, runInAction } from 'mobx';
import { makeSharedState } from '@vkontakte-internal/utils';
import { MediaFocusChannel, MediaSessionController } from './internal';
const getInstanceRef = makeSharedState('media-focus', () => ({ instance: null }), { version: 1 });
const getStuffing = makeSharedState('media-focus/stuffing', () => ({
    mediaSessionController: new MediaSessionController(),
    channels: observable(new Map()),
}), { version: 1 });
/**
 * Информационный эксперт по управлению фокусом на Media-продуктах монолита (аудио, видео, звонки)
 *
 * Это должно быть единственным местом, где Media-продукты получают контроль над синглтонами,
 * необходимыми разом для всех Media-продуктов и только для Media-продуктов.
 *
 * Синглтонами являются:
 * * MediaSession (явно)
 * * Длительный аудиопоток, слышимый пользователем (мнимо)
 *
 * Продукты не должны знать ничего друг о друге ни прямо(иметь ссылку на другой продукт),
 * ни косвенно(отправлять событие предназначенное исключительно для другого конкретного продукта).
 *
 * Принцип работы:
 * * {@link MediaFocus.ensure Получаете синглтон MediaFocus}
 * * {@link MediaFocus.createChannel Создаете канал своего продукта}
 * * {@link IMediaFocusChannel.emitter Оповещаете канал обо **всех** необходимых событиях}
 * * Используете версии синглтонов предоставленные своим каналом (например {@link IMediaFocusChannel.mediaSession MediaSession})
 * * Не трогаете другие Media-продукты
 * * При необходимости оркестрации ваших субпродуктов, делаете это на своей стороне самостоятельно *(MediaFocus не отвечает за ваши субпродукты)*
 */
export class MediaFocus {
    /**
     * @deprecated используйте DI
     */
    static ensure() {
        const state = getInstanceRef();
        if (!state.instance) {
            state.instance = new MediaFocus();
        }
        return state.instance;
    }
    constructor() {
        this.handleChannelStart = (channel) => {
            const isRegistered = this.channels.get(channel.id) === channel;
            if (!isRegistered) {
                return;
            }
            this.pauseLowerPriority(channel);
            this.updateGlobals();
        };
        this.handleChannelStop = (channel) => {
            const isRegistered = this.channels.get(channel.id) === channel;
            if (!isRegistered) {
                return;
            }
            this.resumeHighestPriority(channel);
            this.updateGlobals();
        };
        // Пока существует ensure
        const stuffing = getStuffing();
        this.mediaSessionController = stuffing.mediaSessionController;
        this.channels = stuffing.channels;
        makeObservable(this);
    }
    createUncontrolledChannel(id) {
        return this.createChannel(id, {
            pause: () => {
                throw new Error('This channel can not be paused or resumed');
            },
            resume: () => {
                throw new Error('This channel can not be paused or resumed');
            },
        });
    }
    /**
     * Создает и возвращает канал
     *
     * Этот канал является для вашего продукта синглтоном
     *
     * @throws если канал с указанным {@link IMediaFocusChannelOptions.id идентификатором} уже зарегистрирован
     */
    createChannel(id, actions) {
        const isRegisteredType = this.channels.has(id);
        if (isRegisteredType) {
            throw new Error(`MediaFocusChannel id ${id} already registered`);
        }
        const channel = new MediaFocusChannel(id, actions);
        runInAction(() => {
            this.channels.set(id, channel);
        });
        channel.events.on('start', () => this.handleChannelStart(channel));
        channel.events.on('stop', () => this.handleChannelStop(channel));
        /**
         * При регистрации канал может быть уже активен,
         * поэтому необходимо обновление синглтонов
         */
        this.updateGlobals();
        return channel;
    }
    get activeChannels() {
        return [...this.channels.values()].filter((c) => c.active);
    }
    get lastActiveChannel() {
        return [...this.activeChannels].sort((a, b) => b.activatedAt - a.activatedAt).at(0);
    }
    updateGlobals() {
        this.updateMediaSession();
    }
    pauseLowerPriority(channel) {
        for (const c of this.activeChannels) {
            if (c.id === channel.id || c.config.priority < channel.config.priority) {
                continue;
            }
            c.pause();
        }
    }
    resumeHighestPriority(channel) {
        const nextPausedChannel = [...this.channels.values()]
            .filter((c) => c.paused && c.id !== channel.id)
            .sort((a, b) => a.config.priority - b.config.priority)
            .at(0);
        if (nextPausedChannel) {
            nextPausedChannel.resume();
        }
    }
    updateMediaSession() {
        const mediaSessionController = this.mediaSessionController;
        const calls = this.channels.get('calls');
        /**
         * MediaSession звонков имеет наивысший приоритет
         */
        const channel = calls?.active ? calls : this.lastActiveChannel;
        if (!channel) {
            return;
        }
        if (mediaSessionController.current !== channel.mediaSession) {
            mediaSessionController.setCurrent(channel.mediaSession);
        }
    }
}
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], MediaFocus.prototype, "activeChannels", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], MediaFocus.prototype, "lastActiveChannel", null);
//# sourceMappingURL=MediaFocus.js.map