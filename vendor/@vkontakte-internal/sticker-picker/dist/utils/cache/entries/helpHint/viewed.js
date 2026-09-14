import { AtomNameByPromoId } from '../../../../model/helpHint/helpHint';
import { throttle } from '@vkontakte/vkjs';
// that потому-что внутри throttle 3 параметром идет scope = window,
// который переопределяет наш call(this)
const throttledSendRequest = throttle(function (that, promoId, count) {
    that.options.api.stickers
        .markPromoAsViewed({
        promo_id: promoId,
        count,
    })
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        .then((response) => {
        if (response) {
            const atom = that[AtomNameByPromoId[promoId]];
            atom.set(0);
        }
    });
}, 30_000);
export function markHelpHintAsViewed(promoId) {
    const atom = this[AtomNameByPromoId[promoId]];
    const count = (atom?.get() || 0) + 1;
    atom.set(count);
    throttledSendRequest(this, promoId, count);
}
//# sourceMappingURL=viewed.js.map