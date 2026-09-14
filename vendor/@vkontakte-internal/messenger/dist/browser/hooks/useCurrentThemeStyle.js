import { useBrowserEnv, useThemeStyles, useViewer } from '../hooks/misc';
import { useWithoutBubblesTheme } from '../hooks/useWithoutBubblesTheme';
import * as ThemeStyle from '../../core/model/ThemeStyle';
export const useCurrentThemeStyle = ({ forceThemeStyleId, }) => {
    const { settings } = useViewer();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const { envFeatureFlags } = useBrowserEnv();
    const { styles: themeStyles, appearances: themeAppearances, backgrounds: themeBackgrounds, } = useThemeStyles();
    let selectedStyleId;
    switch (true) {
        case !envFeatureFlags.themeStyles || isWithoutBubblesTheme: {
            selectedStyleId = ThemeStyle.SYSTEM_STYLE_ID;
            break;
        }
        case forceThemeStyleId !== undefined: {
            selectedStyleId = forceThemeStyleId;
            break;
        }
        default:
            selectedStyleId = settings.themeStyleId;
    }
    const selectedStyle = themeStyles.get(selectedStyleId);
    return {
        themeAppearance: selectedStyle && themeAppearances.get(selectedStyle.appearanceId),
        themeBackground: selectedStyle && themeBackgrounds.get(selectedStyle.backgroundId),
        isThemed: selectedStyleId !== ThemeStyle.SYSTEM_STYLE_ID,
        isContrastTheme: ![
            ThemeStyle.SYSTEM_STYLE_ID,
            ThemeStyle.MABLE_STYLE_ID,
        ].includes(selectedStyleId),
    };
};
//# sourceMappingURL=useCurrentThemeStyle.js.map