import { combine } from 'effector';
import { $context, CONTEXT } from '../../context';
import { $ugcInfo } from '../ugc/info';
import { $ugcPacks } from '../ugc/packs';
import { $hasAvatar } from '../hasAvatar';
import { $stockItems } from './stockItems';
import { $recentStickers } from '../recent';
import { $photoEditorStickers } from '../photoEditor';
import { $favoriteStickers } from '../favorite';
import { PackContext } from '../../../context/pack';
export var ServicePackKey;
(function (ServicePackKey) {
    ServicePackKey[ServicePackKey["FAVORITE"] = -1] = "FAVORITE";
    ServicePackKey[ServicePackKey["RECENT"] = -2] = "RECENT";
    ServicePackKey[ServicePackKey["VMOJI"] = -3] = "VMOJI";
    ServicePackKey[ServicePackKey["UGC"] = -4] = "UGC";
    ServicePackKey[ServicePackKey["PHOTO_EDITOR"] = -5] = "PHOTO_EDITOR";
})(ServicePackKey || (ServicePackKey = {}));
export var StickerSendReferrer;
(function (StickerSendReferrer) {
    StickerSendReferrer["RECENT"] = "recent";
    StickerSendReferrer["FAVORITE"] = "favourite";
    StickerSendReferrer["KEYBOARD"] = "keyboard";
})(StickerSendReferrer || (StickerSendReferrer = {}));
export const $packs = combine($ugcInfo, $ugcPacks, $stockItems, $recentStickers, $photoEditorStickers, $favoriteStickers, $hasAvatar, (ugcInfo, ugcPacks, stockItems, recentStickers, photoEditorStickers, favoriteStickers, hasAvatar) => {
    const packs = new Map();
    let packsGroups = [];
    const packsGroupsIndex = new Map();
    let currentStockItemIndex = 0;
    if (!stockItems ||
        !recentStickers ||
        !favoriteStickers ||
        ($context.getState() === CONTEXT.PHOTO_EDITOR && !photoEditorStickers)) {
        return {};
    }
    if (photoEditorStickers?.length) {
        packs.set(ServicePackKey.PHOTO_EDITOR, new PackContext({
            index: currentStockItemIndex,
            referrer: StickerSendReferrer.KEYBOARD,
            redefine: {
                id: ServicePackKey.PHOTO_EDITOR,
                stickers: photoEditorStickers,
            },
        }));
        packsGroups.push(ServicePackKey.PHOTO_EDITOR);
        currentStockItemIndex++;
    }
    if (favoriteStickers.length) {
        packs.set(ServicePackKey.FAVORITE, new PackContext({
            index: currentStockItemIndex,
            referrer: StickerSendReferrer.FAVORITE,
            redefine: {
                id: ServicePackKey.FAVORITE,
                title: 'stickers_picker_favorite',
                stickers: favoriteStickers,
            },
        }));
        packsGroups.push(ServicePackKey.FAVORITE);
        currentStockItemIndex++;
    }
    if (recentStickers.length) {
        packs.set(ServicePackKey.RECENT, new PackContext({
            index: currentStockItemIndex,
            referrer: StickerSendReferrer.RECENT,
            redefine: {
                id: ServicePackKey.RECENT,
                title: 'stickers_picker_recently_used',
                stickers: recentStickers,
            },
        }));
        packsGroups.push(ServicePackKey.RECENT);
        currentStockItemIndex++;
    }
    const hasVmojiStockItem = stockItems?.findIndex(({ product: { vmoji_avatar } }) => vmoji_avatar !== undefined) !== -1;
    if (!hasVmojiStockItem && !hasAvatar) {
        packs.set(ServicePackKey.VMOJI, new PackContext({
            index: currentStockItemIndex,
            referrer: StickerSendReferrer.KEYBOARD,
            redefine: {
                id: ServicePackKey.VMOJI,
                title: 'stickers_picker_vmoji',
            },
        }));
        packsGroups.push(ServicePackKey.VMOJI);
        currentStockItemIndex++;
    }
    const ugcPack = ugcPacks?.[0];
    const canUGCEdit = ugcInfo?.can_edit;
    // const isUGCBanned = ugcInfo?.is_banned;
    const hasUGCStickers = ugcPack?.stickers?.length;
    const showUGCOnboarding = ugcInfo?.show_keyboard_onboarding && canUGCEdit;
    // todo @egor.pronin заменить на строчку ниже после отключения is_banned
    // ugcInfo && (!ugcInfo?.is_keyboard_hidden && (hasUGCStickers || showUGCOnboarding)))
    if (!ugcInfo?.is_keyboard_hidden && (hasUGCStickers || showUGCOnboarding)) {
        const context = new PackContext({
            pack: ugcPack,
            index: currentStockItemIndex,
            referrer: StickerSendReferrer.KEYBOARD,
            tooltip: {
                header: 'stickers_picker_ugc_tooltip_title',
                text: 'stickers_picker_ugc_tooltip_description',
            },
            redefine: {
                id: ServicePackKey.UGC,
                title: 'stickers_picker_ugc',
            },
        });
        if (canUGCEdit) {
            context.setHint({
                id: 'stickers:ugc_keyboard_onboarding_tooltip',
                width: 176,
            });
        }
        packs.set(ServicePackKey.UGC, context);
        packsGroups.push(ServicePackKey.UGC);
        currentStockItemIndex++;
    }
    stockItems.forEach((stockItem) => {
        const { product: { id, is_vmoji, vmoji_avatar }, } = stockItem;
        if (is_vmoji && !vmoji_avatar) {
            return;
        }
        packs.set(id, new PackContext({
            index: currentStockItemIndex,
            referrer: StickerSendReferrer.KEYBOARD,
            pack: stockItem,
        }));
        if (vmoji_avatar) {
            let index = packsGroupsIndex.get(vmoji_avatar.id);
            if (!index) {
                index = packsGroups.push([]) - 1;
                packsGroupsIndex.set(vmoji_avatar.id, index);
            }
            const group = packsGroups[index];
            if (Array.isArray(group)) {
                group.push(id);
            }
        }
        else {
            packsGroups.push(id);
        }
        currentStockItemIndex++;
    });
    return {
        packs,
        packsGroups,
    };
});
//# sourceMappingURL=index.js.map