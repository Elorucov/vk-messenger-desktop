import { markPopupAnimationInterrupted, } from '@vkontakte-internal/stickers-kit';
export const playPopupAutoplay = (data, peerId, userId, apiFetchForExternalLibs, showBlockerAction, popupStickerService) => {
    const request = (method, params) => {
        return apiFetchForExternalLibs(method, params, {
            timeout: 30 * 1000,
            retries: 5,
        });
    };
    const onAnimationClick = (event) => {
        data.onAnimationClick?.(event);
        const action = markPopupAnimationInterrupted({
            peerId,
            userId,
            request,
        });
        if (action) {
            showBlockerAction(action);
        }
    };
    popupStickerService.prepareWithDestroyEvent({ ...data, onAnimationClick });
};
//# sourceMappingURL=stickersPopupUtils.js.map