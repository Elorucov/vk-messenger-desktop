import { throttle } from '@vkontakte/vkjs';
import { Ranges } from '@vkontakte-internal/shared';
import { PopupChatCache } from './index';
export const markPopupAnimationInterrupted = ({ peerId, userId, request, }) => {
    if (Ranges.isUserId(peerId)) {
        return;
    }
    const cache = new PopupChatCache({ request, peerId, userId });
    if (cache.needShowBlocker.get()) {
        cache.needShowBlocker.delete();
        let actionWasClick = false;
        return {
            onClose: () => {
                if (actionWasClick) {
                    return;
                }
                cache.markShowedBlocker();
            },
            onActionClick: () => {
                actionWasClick = true;
                cache.disablePopupInChat();
            },
        };
    }
    cache.markPopupAnimationInterrupted();
    return;
};
export const throttledMarkPopupAnimationInterrupted = throttle(function (cache) {
    const { peerId } = cache.options;
    if (!peerId) {
        return;
    }
    const count = cache.interruptedCounter.get();
    if (!count) {
        return;
    }
    cache.options
        .request('stickers.markPopupAnimationInterrupted', {
        count,
        peer_id: peerId,
    })
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        .then(({ show_blocker }) => {
        cache.interruptedCounter.set(0);
        if (show_blocker) {
            cache.markNeedShowBlocker();
        }
    });
}, 30_000);
//# sourceMappingURL=helpers.js.map