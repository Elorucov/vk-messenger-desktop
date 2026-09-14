export async function hideUGCOnboarding() {
    const ugcInfo = await this.ugcInfo.get();
    if (!ugcInfo?.show_keyboard_onboarding) {
        return false;
    }
    const { owner_id } = ugcInfo;
    ugcInfo.show_keyboard_onboarding = false;
    this.ugcInfo.set(ugcInfo);
    try {
        const response = await this.options.api.stickers.hideUGCKeyboardOnboarding({
            owner_id,
        });
        return Boolean(response);
    }
    catch (err) {
        return false;
    }
}
//# sourceMappingURL=hideOnboarding.js.map