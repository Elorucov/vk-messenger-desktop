import { CallStatSource } from '@vkontakte-internal/calls-core';
export const isMiniAppSource = (entryPoint) => {
    return entryPoint === CallStatSource.MINI_APP;
};
export const prepareStatsData = (stats, entryPoint) => {
    if (isMiniAppSource(entryPoint?.source)) {
        Object.assign(stats, {
            source: CallStatSource.MINI_APP,
            mini_app_id: entryPoint?.miniAppId,
        });
    }
    return stats;
};
//# sourceMappingURL=apps.js.map