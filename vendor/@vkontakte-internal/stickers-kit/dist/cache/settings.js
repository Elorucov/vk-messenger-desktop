import { makeSharedState } from '@vkontakte-internal/utils';
import { createSyncStore, SyncAtomType } from '@vkontakte-internal/browser-store';
const stickersSettingsMemoryCache = {
    didInvalidate: true,
};
export function didStickersSettingsInvalidate() {
    return stickersSettingsMemoryCache.didInvalidate;
}
export function invalidateStickersSettings() {
    stickersSettingsMemoryCache.didInvalidate = true;
}
export function validateStickersSettings() {
    stickersSettingsMemoryCache.didInvalidate = false;
}
export const getSettingsCache = makeSharedState('stickers-settings-cache', () => createSyncStore({
    dbName: 'stickers',
    version: 1,
    storeName: 'settings',
}), {
    version: 1,
});
const settingsCache = getSettingsCache();
const isAnimationAutoplay = settingsCache.createAtom('isAutoplay', SyncAtomType.BOOLEAN);
export const setIsAnimationAutoplay = (value) => {
    isAnimationAutoplay.set(value);
};
export const getIsAnimationAutoplay = () => isAnimationAutoplay.get();
const isPopupAutoplayOnSend = settingsCache.createAtom('isPopupAutoplayOnSend', SyncAtomType.BOOLEAN);
export const setIsPopupAutoplayOnSend = (value) => {
    isPopupAutoplayOnSend.set(value);
};
export const getIsPopupAutoplayOnSend = () => isPopupAutoplayOnSend.get();
const isPopupAutoplayOnGet = settingsCache.createAtom('isPopupAutoplayOnGet', SyncAtomType.BOOLEAN);
export const setIsPopupAutoplayOnGet = (value) => {
    isPopupAutoplayOnGet.set(value);
};
export const getIsPopupAutoplayOnGet = () => isPopupAutoplayOnGet.get();
export const disabledPeerIdsByUser = settingsCache.createAtom('disabledPeerIdsByUser', SyncAtomType.OBJECT);
export const setDisabledPeerIdsByUser = (peerIds) => {
    disabledPeerIdsByUser.set(peerIds);
};
export const getDisabledPeerIdsByUser = () => disabledPeerIdsByUser.get() ?? [];
export const isAnimationAutoplayOff = () => {
    return getIsAnimationAutoplay() === false;
};
export const isPopupAutoplayOnGetOff = () => {
    return getIsPopupAutoplayOnGet() === false;
};
export const isPopupAutoplayOnSendOff = () => {
    return getIsPopupAutoplayOnSend() === false;
};
export const isPeerDisabledByUserForPopupAutoplay = (peerId) => {
    return getDisabledPeerIdsByUser().includes(peerId);
};
export const isPopupAutoplayForPeerByUserOn = (peerId) => {
    return !isAnimationAutoplayOff() && !isPeerDisabledByUserForPopupAutoplay(peerId);
};
export const updateSettingsCacheBySetPopupSettingsResponse = (response) => {
    if (!response.popup) {
        return;
    }
    const { disabled_peer_ids, on_send, on_get } = response.popup.autoplay;
    setDisabledPeerIdsByUser(disabled_peer_ids);
    setIsPopupAutoplayOnGet(on_get);
    setIsPopupAutoplayOnSend(on_send);
};
/**
 * Обновление всех параметров кеша настроек стикеров
 */
// TODO: переделать работу через плагин локалстораджа (пока что плагина этого нету)
//  https://jira.mvk.com/browse/VAS-8900
export const updateSettingsCache = ({ popupDisabledPeerIds, popupAutoplayOnSend, popupAutoplayOnGet, animationAutoplay, }) => {
    setDisabledPeerIdsByUser(popupDisabledPeerIds);
    setIsPopupAutoplayOnGet(popupAutoplayOnGet);
    setIsPopupAutoplayOnSend(popupAutoplayOnSend);
    setIsAnimationAutoplay(animationAutoplay);
};
//# sourceMappingURL=settings.js.map