import { $userEnv } from '../model/userEnv';
export function partConfigEnabled(key) {
    return Boolean($userEnv.getState()[key]);
}
export const isUgcStickersEnabled = () => partConfigEnabled('stickers.ugc');
export const isPromoVmojiCounterEnabled = () => partConfigEnabled('vmoji.promo.avatar_suggestion.promo_counter');
export const isPopUpStickersEnabled = () => partConfigEnabled('stickers.popup');
export const isStaticUpdatesManagerEnabled = () => {
    return partConfigEnabled('static_updates_manager_in_sticker_picker');
};
export const isStickersPickerFastSelectPackEnabled = () => {
    return partConfigEnabled('sticker_picker_fast_select_pack');
};
//# sourceMappingURL=userEnv.js.map