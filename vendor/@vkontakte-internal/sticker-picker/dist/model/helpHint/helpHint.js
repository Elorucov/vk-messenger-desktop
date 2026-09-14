export var HelpHintIdTypes;
(function (HelpHintIdTypes) {
    HelpHintIdTypes["VMOJI_AVATAR_SUGGESTION"] = "keyboard:stickers_vmoji_avatar_suggestion";
})(HelpHintIdTypes || (HelpHintIdTypes = {}));
export var HelpHintPromoTypes;
(function (HelpHintPromoTypes) {
    HelpHintPromoTypes["VMOJI_AVATAR_SUGGESTION"] = "vmoji_avatar_suggestion_stickers_keyboard_hint";
})(HelpHintPromoTypes || (HelpHintPromoTypes = {}));
/**
 * Атомы для хранения данных о хинтов
 */
export const AvatarSuggestionAtomName = 'avatarSuggestion';
export const HelpHintAtomNames = [AvatarSuggestionAtomName];
export const AtomNameByHelpHintId = {
    [HelpHintIdTypes.VMOJI_AVATAR_SUGGESTION]: AvatarSuggestionAtomName,
};
/**
 * Атомы каунтеры для промо-хинтов
 */
const AvatarSuggestionCounterAtomName = 'newAvatarSuggestionCounter';
export const HelpHintAtomCounterNames = [AvatarSuggestionCounterAtomName];
export const AtomNameByPromoId = {
    [HelpHintPromoTypes.VMOJI_AVATAR_SUGGESTION]: AvatarSuggestionCounterAtomName,
};
//# sourceMappingURL=helpHint.js.map