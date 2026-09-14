import { SyncAtomType, createSyncStore, } from '@vkontakte-internal/browser-store';
import { throttledMarkPopupAnimationInterrupted } from './helpers';
import { updateSettingsCacheBySetPopupSettingsResponse } from '../../../cache';
export class PopupChatCache {
    constructor(options) {
        const { peerId, userId } = options;
        this.options = options;
        const stickersPopupChatSync = createSyncStore({
            dbName: 'stickers-popup-chat',
            storeName: `${userId}-${peerId}`,
            version: 1,
        });
        this.stickersPopupChatSync = stickersPopupChatSync;
        this.interruptedCounter = stickersPopupChatSync.createAtom('interruptedCounter', SyncAtomType.NUMBER);
        this.needShowBlocker = stickersPopupChatSync.createAtom('needShowBlocker', SyncAtomType.BOOLEAN);
    }
    /**
     * Увеличиваем счетчик отмены поп-ап анимации
     */
    markPopupAnimationInterrupted() {
        const atom = this.interruptedCounter;
        const count = (atom?.get() || 0) + 1;
        atom.set(count);
        throttledMarkPopupAnimationInterrupted(this);
    }
    /**
     * Помечаем что при следующей отмене поп-ап анимации надо показать предложение отключить поп-ап анимаций для чата
     */
    markNeedShowBlocker() {
        this.needShowBlocker.set(true);
    }
    /**
     * Помечаем что показали предложение отключить поп-ап анимаций для чата.
     * При этом пользователь не согласился отключать их.
     */
    markShowedBlocker() {
        this.interruptedCounter.delete();
        this.options
            .request('stickers.markPopupAnimationInterrupterBlocked', {
            peer_id: this.options.peerId,
        })
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .catch(() => {
            this.markNeedShowBlocker();
        });
    }
    disablePopupInChat() {
        this.options
            .request('stickers.setPopupSettings', {
            name: 'autoplay_disabled_peer_ids',
            value: 0,
            chat_id: this.options.peerId,
        })
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .then((response) => {
            updateSettingsCacheBySetPopupSettingsResponse(response);
            this.interruptedCounter.delete();
        })
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .catch(() => {
            this.markNeedShowBlocker();
        });
    }
}
//# sourceMappingURL=index.js.map