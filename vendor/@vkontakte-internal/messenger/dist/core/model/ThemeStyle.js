export const SYSTEM_STYLE_ID = resolveStyleId('system');
export const MABLE_STYLE_ID = resolveStyleId('mable');
export function resolveStyleId(id) {
    return id;
}
export function resolveAppearanceId(id) {
    return id;
}
export function resolveBackgroundId(id) {
    return id;
}
export function gradientToStyle(gradient) {
    return [`${gradient.angle}deg`, ...gradient.colors].join(',');
}
//# sourceMappingURL=ThemeStyle.js.map