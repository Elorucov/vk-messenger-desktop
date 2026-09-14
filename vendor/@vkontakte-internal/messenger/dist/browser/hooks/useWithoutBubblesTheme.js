import { useFeatureFlags, useViewer } from '../hooks/misc';
import { useLayoutData } from '../ui/LayoutDataProvider/LayoutDataProvider';
import * as Viewer from '../../core/model/Viewer';
export function useWithoutBubblesTheme() {
    const viewer = useViewer();
    const featureFlags = useFeatureFlags();
    const { isMobileLayout } = useLayoutData();
    if (isMobileLayout) {
        return false;
    }
    return Viewer.isWithoutBubbles(viewer, featureFlags);
}
//# sourceMappingURL=useWithoutBubblesTheme.js.map