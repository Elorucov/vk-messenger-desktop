import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Folder from '../../core/model/Folder';
import { insertRecommendedFolders } from '../store/State';
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'LoadRecommendedFolders': {
            if (draft.locks.loadRecommendedFolders ||
                draft.organisers.recommendedFolders.length) {
                return [];
            }
            draft.locks.loadRecommendedFolders = true;
            return [
                async function loadRecommendedFolders({ api }) {
                    try {
                        const response = await api.fetch('messages.getRecommendedFolders', {
                            supported_types: Folder.getSupportedTypes(featureFlags, envFeatureFlags),
                        });
                        return {
                            type: 'LoadRecommendedFolders_RequestComplete',
                            recommendedFolders: response.items || [],
                            hasFailed: false,
                        };
                    }
                    catch {
                        return {
                            type: 'LoadRecommendedFolders_RequestComplete',
                            recommendedFolders: [],
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'LoadRecommendedFolders_RequestComplete': {
            const { recommendedFolders, hasFailed } = action;
            // Если зафейлился запрос рекомендованных папок, тогда оставляем лок чтобы не триггерить новый
            draft.locks.loadRecommendedFolders = hasFailed;
            insertRecommendedFolders(draft, recommendedFolders || [], featureFlags, envFeatureFlags);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=LoadRecommendedFolders.js.map