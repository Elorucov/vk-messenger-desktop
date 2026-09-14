import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedCollapsedVersion':
            draft.channelsConfig.recommendations.lastCollapsedVersion = action.version;
            return [
                async function ({ api }) {
                    await api.fetch('channels.setConfig', {
                        last_collapsed_recommendations_version: action.version,
                    });
                    return { type: 'Noop' };
                },
            ];
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=UserChangedChannelsConfig.js.map