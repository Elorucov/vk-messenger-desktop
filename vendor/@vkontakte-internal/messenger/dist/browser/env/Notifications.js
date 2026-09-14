import * as Peer from '../../core/model/Peer';
import * as Message from '../../core/model/Message';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { NotificationApp } from '../ui/NotificationApp/NotificationApp';
import { browser } from '../utils/misc';
import { safariAudioPlayFix } from '../utils/audio';
import { exhaustivenessCheck, getFirstLetter } from '../../core/utils/misc';
const MAX_MESSAGE_TEXT_LENGTH = 50;
export class Notifications {
    domain;
    browserNotifications;
    swUrl;
    store;
    env;
    node = document.createElement('div');
    root;
    listeners = new Set();
    unreadUnmutedCounter = null;
    idleUnreadCounter = 0;
    audio = null;
    browserTitle;
    noAvatar;
    constructor(domain, browserNotifications, audioUrl, swUrl) {
        this.domain = domain;
        this.browserNotifications = browserNotifications;
        this.swUrl = swUrl;
        this.audio = new Audio(audioUrl);
        this.audio.preload = 'auto';
        this.audio.loop = false;
        this.audio.load();
        if (browser.safari) {
            safariAudioPlayFix(this.audio);
        }
        this.browserTitle = new BrowserTitle(this.domain);
        this.noAvatar = new NoAvatar();
        this.listenNotificationClick();
        this.root = createRoot(this.node, {
            identifierPrefix: 'me-notifications',
        });
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    handleNotificationClick = ({ data }) => {
        if (!this.store?.featureFlags.vkm_sw_notification_click) {
            return;
        }
        if (typeof data !== 'object' || data.action !== 'navigate') {
            return;
        }
        const rawPeerId = data.peerId;
        const rawCmid = data.cmid;
        if (typeof rawPeerId !== 'number' &&
            (typeof rawCmid !== 'undefined' || typeof rawCmid !== 'number')) {
            return;
        }
        const peerId = Peer.resolveId(rawPeerId);
        this.env?.router.push({
            kind: 'ConvoRoute',
            peerId: peerId,
            cmid: rawCmid ? Message.resolveCmid(rawCmid) : undefined,
            entrypoint: 'notifications',
        });
    };
    /**
     * Если нотификация отправлена из ServiceWorker, то мы не можем просто обработать клик
     * Мы обрабатываем клик в ServiceWorker и присылаем во вкладку postMessage, чтобы открыть нужную беседу
     */
    listenNotificationClick() {
        window.addEventListener('message', this.handleNotificationClick);
    }
    async play() {
        // Если пользователь не совершил никаких действий на странице, то браузер не даёт проигрывать звук
        try {
            if (this.audio) {
                /**
                 * "Кошки-мышки" с muted нужны из-за бага в WebKit.
                 * Если вкладка в сафари уходит в бэкграунд режим (мы переключились на другую вкладку) и в ней не проигрывается слышимый звук (мьют или громкость 0 не считается слышимым)
                 * то генерируется прерывание и "неслышимые" аудиоэлементы ставятся на паузу. После выхода вкладки из бэкграунда прерванные "неслышимые" аудиоэлементы продолжают проигрывание.
                 *
                 * Увы, чудес не бывает и сафари такая же куча процедурного г*вна коих в мире много. Прерывание не будет сгенерировано, только если в момент ухода в бэкграунд вкладка проигрывает слышимый звук, а вот мьют и что для нас печальнее отсутствиее активного проигрыванея вовсе - всё так же генерируют прерывание.
                 *
                 * Есть пулл-реквест на это дело https://github.com/WebKit/WebKit/pull/28532 , но для его выкатки хотят тест, а тест написать не просто, так как тестовое окружение !== продовое и тест не показывает проблемы( Пока переписка продолжается, надежда есть.
                 * Баг для WebKit: https://bugs.webkit.org/show_bug.cgi?id=274056
                 *
                 * Кстати эта проблема присутствует и у фейсбук и у телеги.
                 */
                this.audio.muted = false;
                this.audio.addEventListener('ended', () => {
                    if (this.audio) {
                        this.audio.muted = true;
                    }
                }, { once: true });
                this.audio.load();
                await this.audio.play();
            }
        }
        catch (e) { }
    }
    async showNotification(title, data, text, icon) {
        if (this.browserNotifications.isEnabled()) {
            try {
                // Если у нас есть сервис воркер, то показываем нотификации через него,
                // чтобы избежать ошибки Failed to construct Notification: Illegal constructor
                if ('serviceWorker' in navigator && this.swUrl) {
                    const reg = await navigator.serviceWorker.getRegistration(this.swUrl);
                    if (reg) {
                        await reg.showNotification(title, {
                            body: text,
                            icon: icon,
                            badge: icon,
                            data,
                        });
                        return null;
                    }
                }
                return new Notification(title, {
                    body: text,
                    icon: icon,
                    badge: icon,
                });
            }
            catch (e) {
                console.warn('Не удалось отправить уведомление', e);
            }
        }
        return null;
    }
    async getMessageText(message, withName = true) {
        return new Promise((resolve, reject) => {
            if (!this.env || !this.store) {
                reject(new Error('Для работы нотификаций нужны store и env'));
                return;
            }
            const onReady = () => {
                resolve(this.node.innerText);
            };
            this.root.render(React.createElement(NotificationApp, { env: this.env, store: this.store, message: message, withName: withName, onReady: onReady }));
        });
    }
    async messageNotification(message) {
        if (!this.env || !this.store) {
            throw new Error('Для работы нотификаций нужны store и env');
        }
        const text = await this.getMessageText(message);
        const state = this.store.getState();
        const peer = Peer.safeGet(state.peers, message.peerId);
        const author = Peer.safeGet(state.peers, message.authorId);
        const maxPhotoSizeUrl = author.photo?.baseUrl || Peer.maxPhotoSizeUrl(author);
        const icon = maxPhotoSizeUrl ??
            this.noAvatar.getNoAvatar({
                peerId: author.id,
                initials: Peer.initials(author),
            });
        const notification = await this.showNotification(Peer.name(peer), { peerId: message.peerId, cmid: message.cmid }, text, icon);
        if (notification) {
            notification.addEventListener('click', () => {
                window.focus();
                this.env?.router.push({
                    kind: 'ConvoRoute',
                    peerId: message.peerId,
                    entrypoint: 'notifications',
                });
            });
        }
    }
    async callNotification({ caller, image, peerId, }) {
        if (!this.env) {
            throw new Error('Для работы нотификаций нужен env');
        }
        const peerKind = Peer.toKind(peerId);
        let initials;
        switch (peerKind) {
            case 'User':
            case 'Contact':
                initials = caller
                    .split(/\s/)
                    .slice(0, 2)
                    .filter(Boolean)
                    .map(getFirstLetter)
                    .join('');
                break;
            case 'Group':
            case 'Chat':
                initials = getFirstLetter(caller);
                break;
            default:
                exhaustivenessCheck(peerKind);
        }
        const icon = image ||
            this.noAvatar.getNoAvatar({
                peerId: peerId,
                initials,
            });
        const notification = await this.showNotification(caller, { peerId }, this.env.lang.use('me_call_inbound_text'), icon);
        if (notification) {
            notification.addEventListener('click', () => {
                window.focus();
                this.env?.router.push({
                    kind: 'ConvoRoute',
                    peerId: peerId,
                    entrypoint: 'notifications',
                });
            });
        }
    }
    async reactionNotification(message, peers, count) {
        if (!this.env || !this.store) {
            throw new Error('Для работы нотификаций нужны store и env');
        }
        let text = '';
        let messageText = await this.getMessageText(message, false);
        messageText =
            messageText.length > MAX_MESSAGE_TEXT_LENGTH
                ? messageText.slice(0, MAX_MESSAGE_TEXT_LENGTH) + '…'
                : messageText;
        const state = this.store.getState();
        const peer = Peer.safeGet(state.peers, message.peerId);
        const maxPhotoSizeUrl = peer.photo?.baseUrl || Peer.maxPhotoSizeUrl(peer);
        const icon = maxPhotoSizeUrl ??
            this.noAvatar.getNoAvatar({
                peerId: peer.id,
                initials: Peer.initials(peer),
            });
        //Если передали не всех пиров(не оказалось в кэше), то показываем общий текст
        if (peers.length === 0 ||
            (count < 3 && peers.length !== count) ||
            peers.length < 3) {
            text = `${this.env.lang.use('me_notification_reaction_unknown', {
                values: { message: messageText },
            })}`;
        }
        else {
            if (count === 1) {
                if (!peers[0]) {
                    return;
                }
                text = `${Peer.name(peers[0])}\r\n${this.env.lang.use('me_notification_reaction_single', {
                    sex: peers[0].kind === 'User' ? peers[0].sex : 'unknown',
                    values: { message: messageText },
                })}`;
            }
            else {
                if (count > 3) {
                    text = this.env.lang.use('me_notification_reaction_more_then_three', {
                        num: count - 2,
                        values: {
                            count: String(count - 2),
                            names: peers
                                .slice(0, 2)
                                .map((peer) => Peer.name(peer))
                                .join(', '),
                            message: messageText,
                        },
                    });
                }
                else {
                    text = this.env.lang.use('me_notification_reaction_up_to_three', {
                        values: {
                            names: peers.map((peer) => Peer.name(peer)).join(', '),
                            message: messageText,
                        },
                    });
                }
            }
        }
        const notification = await this.showNotification(Peer.name(peer), { peerId: message.peerId, cmid: message.cmid }, text, icon);
        if (notification) {
            notification.addEventListener('click', () => {
                window.focus();
                this.env?.router.push({
                    kind: 'ConvoRoute',
                    peerId: message.peerId,
                    cmid: message.kind === 'Normal' ? message.cmid : undefined,
                    entrypoint: 'notifications',
                });
            });
        }
    }
    setEnv(env, store) {
        this.env = env;
        this.store = store;
        this.setIdleCounter(0);
        this.browserTitle.setTitle(this.env.lang.use('me_messenger_page_title'));
    }
    notifyListeners(event) {
        const callListeners = () => {
            this.listeners.forEach((listener) => {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error('Ошибка слушателя уведомлений:', error);
                }
            });
        };
        switch (event.kind) {
            case 'counter':
                if (event.payload !== this.unreadUnmutedCounter) {
                    callListeners();
                }
                this.unreadUnmutedCounter = event.payload;
                break;
            default:
                callListeners();
        }
    }
    notify(notification, peerId) {
        if (!this.env || !this.store) {
            throw new Error('Для работы нотификаций нужны store и env');
        }
        const isCurrentPeerOpened = this.env.router.screenRoute.kind === 'ConvoRoute' &&
            this.env.router.screenRoute.peerId === peerId;
        const mode = isCurrentPeerOpened ? 'idle' : 'normal';
        const showNotify = this.browserNotifications.isEnabled() &&
            (mode === 'idle' ? this.env.idle.isIdle() || !document.hasFocus() : true);
        if (!showNotify) {
            return;
        }
        switch (notification.kind) {
            case 'message':
                this.messageNotification(notification.message).catch(() => {
                    // do nothing
                });
                break;
            case 'reaction':
                this.reactionNotification(notification.message, notification.reactedPeers, notification.reactedCount).catch(() => {
                    // do nothing
                });
                break;
            case 'call':
                this.callNotification(notification).catch(() => {
                    // do nothing
                });
                break;
            default:
                exhaustivenessCheck(notification);
        }
    }
    removeNotification() {
        return;
    }
    setIdleCounter(count) {
        this.idleUnreadCounter = count;
        if (!this.env) {
            throw new Error('Для работы с тайтлом нужен доступ к browserEnv');
        }
        this.browserTitle.setIcon(this.idleUnreadCounter > 0);
    }
    setCounters() {
        // do nothing
        // в рефе не используется. Используется, например, в вкком для каунтера в левом меню
    }
    playSound() {
        void this.play();
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        window.removeEventListener('message', this.handleNotificationClick);
    }
}
class BrowserTitle {
    domain;
    static FAVICON_BASE_PATH = '/images/icons/vkme_favicons';
    icoEl = null;
    svgEl = null;
    constructor(domain) {
        this.domain = domain;
    }
    createLink(attrs) {
        const el = document.createElement('link');
        Object.entries(attrs).forEach(([key, value]) => {
            el.setAttribute(key, value);
        });
        document.head.appendChild(el);
        return el;
    }
    setIcon(notify) {
        if (!this.icoEl) {
            const link = document.querySelector("link[rel~='icon'][href$='.ico']");
            if (link) {
                this.icoEl = link;
            }
            else {
                const el = this.createLink({
                    rel: 'icon',
                    sizes: 'any',
                });
                this.icoEl = el;
            }
        }
        if (!this.svgEl) {
            const link = document.querySelector("link[rel~='icon'][href$='.svg']");
            if (link) {
                this.svgEl = link;
            }
            else {
                const el = this.createLink({
                    rel: 'icon',
                    type: 'image/svg+xml',
                });
                this.svgEl = el;
            }
        }
        const basePath = `https://${this.domain}${BrowserTitle.FAVICON_BASE_PATH}/vk_me_favicon${notify ? '_notify' : ''}`;
        this.icoEl.href = basePath + '.ico';
        this.svgEl.href = basePath + '.svg';
    }
    setTitle(str) {
        document.title = str;
    }
}
class NoAvatar {
    canvas = null;
    avatarSize = 200;
    defaultStartColor = '#ff6952';
    defaultEndColor = '#e6404b';
    gradientColors = [
        [this.defaultStartColor, this.defaultEndColor],
        ['#ffb829', '#fa7f14'],
        ['#ffdc50', '#f2b40b'],
        ['#78e070', '#46b864'],
        ['#78f1fa', '#46bddb'],
        ['#e664fa', '#a73ddb'],
        ['#66ccff', '#3f8ae0'],
        ['#bac2cc', '#8c97a3'],
    ];
    getNoAvatar({ peerId, initials, }) {
        if (!this.canvas) {
            const canvas = document.createElement('canvas');
            canvas.height = this.avatarSize;
            canvas.width = this.avatarSize;
            this.canvas = canvas;
        }
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            return undefined;
        }
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const radius = this.avatarSize / 2;
        const gradient = ctx.createRadialGradient(this.avatarSize / 2, 0, 0, this.avatarSize / 2, this.avatarSize / 2, this.avatarSize / 2);
        const colorIndex = Math.abs(peerId % 6);
        gradient.addColorStop(0, this.gradientColors[colorIndex]?.[0] ?? this.defaultStartColor);
        gradient.addColorStop(1, this.gradientColors[colorIndex]?.[1] ?? this.defaultEndColor);
        ctx.arc(this.avatarSize / 2, this.avatarSize / 2, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.font = `600 75px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(initials, radius, 125);
        return this.canvas.toDataURL('image/png');
    }
}
//# sourceMappingURL=Notifications.js.map