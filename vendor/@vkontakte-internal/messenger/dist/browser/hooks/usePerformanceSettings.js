import { useFeatureFlags, useViewer } from '../hooks/misc';
import { useLayoutData } from '../ui/LayoutDataProvider/LayoutDataProvider';
export function usePerformanceSettings() {
    const { vkm_performance_boost } = useFeatureFlags();
    const { settings } = useViewer();
    const { isMobileLayout } = useLayoutData();
    if (!isMobileLayout) {
        return {
            enableAnimations: true,
        };
    }
    return {
        enableAnimations: !vkm_performance_boost || !settings.performanceTweaksEnabled,
    };
}
//# sourceMappingURL=usePerformanceSettings.js.map