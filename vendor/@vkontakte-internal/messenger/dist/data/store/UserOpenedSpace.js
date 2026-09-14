import { exhaustivenessCheck } from '../../core/utils/misc';
import { insertSpaces } from '../store/State';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserOpenedSpace': {
            const space = draft.spaces.get(action.spaceId);
            if (space?.kind !== 'Space') {
                if (draft.locks.spacesGetById.has(action.spaceId)) {
                    return [];
                }
                draft.locks.spacesGetById.add(action.spaceId);
                return [
                    async function fetchSpace({ api }) {
                        try {
                            return {
                                type: 'UserOpenedSpace_RequestCompleted',
                                spaceId: action.spaceId,
                                spacesGetByIdResponse: await api.fetch('spaces.getById', {
                                    space_ids: action.spaceId.toString(),
                                    extended: 1,
                                }, {
                                    retries: Infinity,
                                }),
                            };
                        }
                        catch {
                            return {
                                type: 'UserOpenedSpace_RequestCompleted',
                                spaceId: action.spaceId,
                            };
                        }
                    },
                ];
            }
            return [];
        }
        case 'UserClosedSpace': {
            return [];
        }
        case 'UserOpenedSpace_RequestCompleted': {
            draft.locks.spacesGetById.delete(action.spaceId);
            if (!action.spacesGetByIdResponse) {
                return [];
            }
            if (!action.spacesGetByIdResponse.items[0]) {
                draft.spaces.set(action.spaceId, null);
                return [];
            }
            insertSpaces(draft, action.spacesGetByIdResponse.items, {
                apiConvos: action.spacesGetByIdResponse.conversations || [],
                apiUsers: action.spacesGetByIdResponse.profiles || [],
                apiGroups: action.spacesGetByIdResponse.groups || [],
                apiSpaceCalls: action.spacesGetByIdResponse.calls || [],
                apiSpaceTribunes: action.spacesGetByIdResponse.tribunes || [],
            }, featureFlags);
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserOpenedSpace.js.map