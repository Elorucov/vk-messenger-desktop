import { useColorScheme } from '@vkontakte/vkui';
import * as ThemeStyle from '../../core/model/ThemeStyle';
import { hexToRgba } from '../../core/utils/misc';
import { useMemo } from 'react';
export const useThemeStylesOverride = ({ themeAppearance, }) => {
    const theme = useColorScheme();
    const appearance = themeAppearance?.[theme];
    const accentBackgroundAlpha = useMemo(() => {
        if (!appearance?.accentColor) {
            return '';
        }
        return hexToRgba(appearance.accentColor, 0.2) || '';
    }, [appearance?.accentColor]);
    if (!appearance) {
        return {};
    }
    const bubbleGradient = getBubbleGradient(appearance.bubbleGradient);
    // Перезапись цветов для исходящих сообщений
    const outcomingMessageStyles = {
        '--themesContrastLinkColor': 'var(--vkui--color_link_contrast)',
        '--themesContrastTextPrimaryColor': 'var(--vkui--color_text_contrast)',
        '--themesContrastTextSubheadColor': 'var(--vkui--color_text_contrast)',
        '--themesContrastTextAccentColor': 'var(--vkui--color_text_contrast)',
        '--themesContrastIconAccentColor': 'var(--vkui--color_icon_contrast)',
        '--themesContrastStrokeAccentColor': 'var(--vkui--color_stroke_contrast)',
        '--themesContrastBackgroundAccentColor': 'var(--vkui--color_background_contrast)',
        '--themesContrastReplySeparatorColor': 'var(--vkui--color_stroke_contrast)',
        '--themesContrastTextSecondaryColor': 'var(--vkui--color_text_contrast)',
    };
    // Перезапись цвета исходящего бабла
    const outBubbleBackgroundStyle = {
        '--messageOutBubbleBackground': `linear-gradient(${bubbleGradient})`,
    };
    // Перезапись цветов тайпингов в беседе
    const convoTypingsStyle = {
        '--convoTypingsIconColor': 'var(--vkui--color_icon_contrast)',
        '--convoTypingsTextColor': 'var(--vkui--color_text_contrast)',
    };
    // Общая перезапись цветов
    const accentColorStyles = {
        '--vkui--color_text_accent': appearance.accentColor,
        '--vkui--color_text_link': appearance.accentColor,
        '--vkui--color_icon_accent': appearance.accentColor,
        '--vkui--color_stroke_accent': appearance.accentColor,
        '--vkui--color_background_accent': appearance.accentColor,
        '--vkui--vkontakte_im_reply_separator': appearance.accentColor,
        '--im_reaction_chip_incoming': accentBackgroundAlpha,
        '--im_reaction_chip_incoming_text': 'var(--vkui--color_text_primary)',
        '--im_reaction_chip_incoming--active': appearance.accentColor,
        '--im_reaction_chip_incoming_text--active': 'var(--vkui--color_text_contrast)',
        '--im_reaction_chip_outgoing': 'var(--vkui--color_background_contrast_secondary_alpha)',
        '--im_reaction_chip_outgoing_text': 'var(--vkui--color_text_primary)',
        '--im_reaction_chip_outgoing--active': 'var(--vkui--color_text_contrast)',
        '--im_reaction_chip_outgoing_text--active': 'var(--vkui--color_text_contrast)',
        '--im_reaction_chip_outside_bubble': 'var(--vkui--color_separator_primary_alpha)',
        '--im_reaction_chip_outside_bubble_text': 'var(--vkui--color_text_primary)',
        '--im_reaction_chip_outside_bubble--active': appearance.accentColor,
        '--im_reaction_chip_outside_bubble_text--active': 'var(--vkui--color_text_contrast)',
        '--vkui--color_background_accent_themed': appearance.accentColor,
        '--vkui--color_background_accent_themed--hover': appearance.accentColor,
    };
    if (themeAppearance.id === ThemeStyle.resolveAppearanceId('mable')) {
        return {
            ...outBubbleBackgroundStyle,
            ...(theme === 'dark' ? outcomingMessageStyles : {}),
            ...convoTypingsStyle,
        };
    }
    return {
        ...accentColorStyles,
        ...outBubbleBackgroundStyle,
        ...outcomingMessageStyles,
        ...convoTypingsStyle,
    };
};
const getBubbleGradient = (gradient) => [`${gradient.angle}deg`, ...gradient.colors].join(',');
//# sourceMappingURL=useThemeStylesOverride.js.map