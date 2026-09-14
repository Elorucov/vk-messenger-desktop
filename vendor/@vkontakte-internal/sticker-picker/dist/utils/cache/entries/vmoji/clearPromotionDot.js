export async function clearVmojiPromotionDot() {
    const global = await this.global.get();
    if (!global?.vmoji_promotion) {
        return;
    }
    global.vmoji_promotion.dot_color = undefined;
    this.global.set(global, {
        notify: false,
    });
}
//# sourceMappingURL=clearPromotionDot.js.map