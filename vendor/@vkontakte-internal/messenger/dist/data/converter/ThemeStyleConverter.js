import * as ThemeStyle from '../../core/model/ThemeStyle';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const fromApiStyle = (apiStyle, title) => {
    return {
        id: ThemeStyle.resolveStyleId(apiStyle.id),
        appearanceId: ThemeStyle.resolveAppearanceId(apiStyle.appearance_id || apiStyle.id),
        backgroundId: ThemeStyle.resolveBackgroundId(apiStyle.background_id || apiStyle.id),
        title,
        sortId: apiStyle.sort,
        updateTime: apiStyle.update_time,
        isHidden: Boolean(apiStyle.is_hidden),
    };
};
export const fromApiAppearance = (apiAppearance) => {
    return {
        id: ThemeStyle.resolveAppearanceId(apiAppearance.id),
        sortId: apiAppearance.sort,
        updateTime: apiAppearance.update_time,
        light: fromApiAppearanceShade(apiAppearance.light),
        dark: fromApiAppearanceShade(apiAppearance.dark),
    };
};
const fromApiAppearanceShade = (apiAppearanceShade) => {
    return {
        bubbleGradient: apiAppearanceShade.bubble_gradient,
        accentColor: apiAppearanceShade.accent_color,
        headerTint: apiAppearanceShade.header_tint,
        writeBarTint: apiAppearanceShade.write_bar_tint,
        forwardLine: apiAppearanceShade.forward_line,
        textPlaceholder: apiAppearanceShade.text_placeholder,
        textPrimary: apiAppearanceShade.text_primary,
    };
};
export const fromApiBackground = (apiBackground) => {
    return {
        id: ThemeStyle.resolveBackgroundId(apiBackground.id),
        sortId: apiBackground.sort,
        updateTime: apiBackground.update_time,
        light: fromApiBackgroundShade(apiBackground.light),
        dark: fromApiBackgroundShade(apiBackground.dark),
    };
};
const fromApiBackgroundShade = (apiBackgroundShade) => {
    switch (apiBackgroundShade.type) {
        case 'raster': {
            return {
                kind: 'raster',
                url: apiBackgroundShade.raster.url,
                height: apiBackgroundShade.raster.height,
                width: apiBackgroundShade.raster.width,
            };
        }
        case 'vector': {
            return {
                kind: 'vector',
                blur: apiBackgroundShade.vector.blur,
                colorEllipses: apiBackgroundShade.vector.color_ellipses?.map((ellipse) => ({
                    color: fromARGBToRGBA(ellipse.color),
                    radiusX: ellipse.radius_x,
                    radiusY: ellipse.radius_y,
                    x: ellipse.x,
                    y: ellipse.y,
                })),
                gradient: apiBackgroundShade.vector.gradient && {
                    angle: apiBackgroundShade.vector.gradient.angle,
                    colors: apiBackgroundShade.vector.gradient.colors.map(fromARGBToRGBA),
                },
                svg: apiBackgroundShade.vector.svg && {
                    height: apiBackgroundShade.vector.svg.height,
                    opacity: apiBackgroundShade.vector.svg.opacity,
                    url: apiBackgroundShade.vector.svg.url,
                    width: apiBackgroundShade.vector.svg.width,
                    isOverlay: apiBackgroundShade.vector.svg.is_overlay,
                },
            };
        }
        default:
            exhaustivenessCheck(apiBackgroundShade);
    }
};
/**
 * Темы делались первоначально под android и ios. На этих платформах цвета
 * существуют в формате ARGB. Переводим в формат для веба - RGBA
 */
const fromARGBToRGBA = (color) => {
    if (color.length === 7) {
        return color;
    }
    return `#${color.slice(3)}${color.slice(1, 3)}`;
};
//# sourceMappingURL=ThemeStyleConverter.js.map