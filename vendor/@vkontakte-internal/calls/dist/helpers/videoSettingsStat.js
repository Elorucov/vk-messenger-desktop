import { VideoResolutionTypes } from '@vkontakte-internal/calls-core';
import { getInitialVideoResolution } from '../reducers/initialState';
export const getVideoResolutionStatsValue = (enableHDVideo, resolution) => {
    const videoResolution = resolution ?? getInitialVideoResolution(enableHDVideo);
    switch (videoResolution) {
        case VideoResolutionTypes.SD: {
            return 'Optimal';
        }
        case VideoResolutionTypes.HD:
        case VideoResolutionTypes.FHD: {
            return 'Maximum';
        }
        default:
            return 'Optimal';
    }
};
//# sourceMappingURL=videoSettingsStat.js.map