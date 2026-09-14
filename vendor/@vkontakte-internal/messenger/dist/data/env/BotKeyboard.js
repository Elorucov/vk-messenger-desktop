import { exhaustivenessCheck } from '../../core/utils/misc';
import { isInternalLink, prepareLink } from '../../core/utils/links';
import { IRouter } from '../env/IRouter';
import * as Peer from '../../core/model/Peer';
import { Time } from '../../core/utils/time';
export class BotKeyboard {
    router;
    vkDomain;
    constructor(router, vkDomain) {
        this.router = router;
        this.vkDomain = vkDomain;
    }
    listeners = [];
    eventIds = new Set();
    clearEventTimoutId;
    openAlertHandler;
    update = (event) => {
        if (this.eventIds.has(event.id)) {
            switch (event.type) {
                case 'open_app': {
                    this.openApp(event.appId, event.hash, event.ownerId);
                    break;
                }
                case 'open_link':
                case 'open_modal_view': {
                    this.openLink(event.link, event.title, true);
                    break;
                }
                // Ничего не делаем, так как обрабатываем из ui
                case 'show_snackbar':
                case 'null':
                    break;
                default:
                    return exhaustivenessCheck(event);
            }
            this.listeners.forEach((listener) => listener(event));
            this.eventIds.delete(event.id);
        }
    };
    subscribe = (listener) => {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    };
    get tabIsOpen() {
        return !document.hidden;
    }
    openApp = (appId, hash, ownerId) => {
        if (this.tabIsOpen) {
            this.router.push({
                kind: 'MiniAppModal',
                miniAppId: appId,
                groupPeerId: ownerId && Peer.isGroupPeerId(ownerId) ? ownerId : undefined,
                hash,
            });
        }
    };
    openLink = (link, name, isCallbackAction) => {
        if (this.tabIsOpen) {
            if (isCallbackAction && this.openAlertHandler) {
                this.openAlertHandler({ link, name });
                return;
            }
            if (this.router.checkIsolation() && isInternalLink(this.vkDomain, link)) {
                let route = this.router.fromExternalUrl(link);
                if (IRouter.isProxyRoute(route)) {
                    route = this.router.fromProxyRoute(route);
                }
                if (route && route?.kind !== 'NotFoundRoute') {
                    this.router.push(route);
                    return;
                }
            }
            window.open(prepareLink(this.vkDomain, link));
        }
    };
    addEventId = (eventId) => {
        this.eventIds.add(eventId);
        /**
         * eventId живет на бэке 1 минуту.
         * Если бот не вернет событие с этим айди, то очищаем по таймауту
         */
        this.clearEventTimoutId = window.setTimeout(() => {
            if (this.eventIds.has(eventId)) {
                this.eventIds.delete(eventId);
                // Отправляем пустое событие, чтобы перестал крутиться спиннер callback-кнопки
                this.update({
                    type: 'null',
                    id: eventId,
                    peerId: Peer.resolveId(),
                    ownerId: Peer.resolveId(),
                });
            }
        }, Time.Minute);
    };
    setOpenAlertHandler = (handler) => {
        this.openAlertHandler = handler;
    };
    /**
     * Освободить ресурсы
     */
    dispose() {
        window.clearTimeout(this.clearEventTimoutId);
    }
}
//# sourceMappingURL=BotKeyboard.js.map