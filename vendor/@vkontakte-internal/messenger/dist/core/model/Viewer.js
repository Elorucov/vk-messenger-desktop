import { setIsAnimationAutoplay } from '@vkontakte-internal/stickers-kit';
import { exhaustivenessCheck } from '../utils/misc';
const REDUCED_MOTION_SETTINGS = [
    'isStickersAnimationEnabled',
    'messageReactionAnimation',
    'videoMessageAutoplay',
];
export const isReducedMotionSetting = (setting) => REDUCED_MOTION_SETTINGS.includes(setting);
export const VIEWER_DEFAULT_PUSH_SETTINGS = {
    userConvo: {
        isEnabled: true,
        withMessageText: true,
    },
    chatConvo: {
        isEnabled: true,
        withMessageText: true,
    },
    groupConvo: {
        isEnabled: true,
        withMessageText: true,
    },
    mention: 'every-mention',
    messageReaction: {
        isEnabled: true,
        withMessageText: true,
    },
};
export function isEdu(profileType) {
    return profileType === 'edu';
}
export function isService(viewer) {
    return Boolean(viewer.accounts.find((account) => account.isService));
}
export function eduAccount(viewer) {
    return viewer.accounts.find((account) => isEdu(account.profileType));
}
export function mainAccount(viewer) {
    return viewer.accounts.find((account) => !isEdu(account.profileType));
}
export function isWithoutBubbles(viewer, featureFlags) {
    const { settings } = viewer;
    switch (featureFlags.vkm_bubble_theme_default_value) {
        case false:
        case 0: // только баббловая тема
            return false;
        case 1: // по умолчанию баббловая тема
            return settings.bubblesTheme === 'disabled';
        case 2: // по умолчанию безбаббловая тема
            return settings.bubblesTheme !== 'enabled';
        default:
            exhaustivenessCheck(featureFlags.vkm_bubble_theme_default_value);
    }
}
export function isCtrlSubmitEnabled(viewer, isMobileLayout) {
    if (isMobileLayout) {
        /**
         * Даем мобилкам делать перенос строки по enter
         * не зависимо от значения настройки, так как
         * по-другому на них перенести строку нельзя.
         */
        return true;
    }
    return viewer.settings.ctrSubmitFromApi;
}
export function updateIsStickersAnimationEnabled(viewer, value) {
    viewer.settings.isStickersAnimationEnabled = value;
    setIsAnimationAutoplay(value);
}
export function updateIsPopupStickersAutoplaySettingEnabled(viewer, setting, counter) {
    viewer.settings.isPopupStickersAutoplaySettingEnabled = setting;
    viewer.settings.isPopupStickersInterruptCounterEnabled = counter;
}
//# sourceMappingURL=Viewer.js.map