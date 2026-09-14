import { useMemo } from 'react';
import { usePixelDensity } from '../hooks/misc';
/**
 * Хук для определения иконки подходящих размеров для виджета мини-приложения.
 */
export function useMiniAppWidgetAppIconUrl(app) {
    const isDense = usePixelDensity();
    return useMemo(() => {
        const { icon75, icon80, icon139, icon150, icon160 } = app;
        const bigPreview = icon160 || icon150;
        const mediumPreview = icon150 || icon139;
        const smallPreview = icon80 || icon75;
        return ((isDense ? bigPreview || mediumPreview : mediumPreview) || smallPreview);
    }, [app, isDense]);
}
//# sourceMappingURL=useMiniAppWidgetAppIconUrl.js.map