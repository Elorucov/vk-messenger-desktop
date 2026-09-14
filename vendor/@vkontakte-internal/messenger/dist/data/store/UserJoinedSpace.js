import { exhaustivenessCheck } from '../../core/utils/misc';
import { insertSpaces } from '../store/State';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserJoinedSpace': {
            const space = draft.spaces.get(action.spaceId);
            if (!space ||
                space.viewerData.isChangingMembership ||
                space.viewerData.isMember) {
                return [];
            }
            space.viewerData.isChangingMembership = true;
            return [
                async function joinSpace({ api }) {
                    try {
                        const response = await api.fetch('spaces.join', {
                            space_id: action.spaceId,
                            extended: 1,
                        });
                        return {
                            type: 'UserJoinedSpace_RequestCompleted',
                            spaceId: action.spaceId,
                            response,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserJoinedSpace_RequestCompleted',
                            spaceId: action.spaceId,
                        };
                    }
                },
            ];
        }
        case 'UserJoinedSpace_RequestCompleted': {
            const space = draft.spaces.get(action.spaceId);
            if (space) {
                space.viewerData.isChangingMembership = false;
            }
            if (!action.response) {
                // todo - добавить снекбар?
                return [];
            }
            insertSpaces(draft, [action.response.space], {
                apiConvos: action.response.conversations || [],
                apiUsers: action.response.profiles || [],
                apiGroups: action.response.groups || [],
                apiSpaceCalls: action.response.calls || [],
                apiSpaceTribunes: action.response.tribunes || [],
            }, featureFlags);
            return [];
        }
        case 'UserLeftSpace': {
            const space = draft.spaces.get(action.spaceId);
            if (!space ||
                space.viewerData.isChangingMembership ||
                !space.viewerData.isMember) {
                return [];
            }
            space.viewerData.isChangingMembership = true;
            return [
                async function leaveSpace({ api }) {
                    try {
                        const response = await api.fetch('spaces.leave', {
                            space_id: action.spaceId,
                            extended: 1,
                        });
                        return {
                            type: 'UserLeftSpace_RequestCompleted',
                            spaceId: action.spaceId,
                            response,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserLeftSpace_RequestCompleted',
                            spaceId: action.spaceId,
                        };
                    }
                },
            ];
        }
        case 'UserLeftSpace_RequestCompleted': {
            const space = draft.spaces.get(action.spaceId);
            if (space) {
                space.viewerData.isChangingMembership = false;
            }
            if (!action.response) {
                // todo - добавить снекбар?
                return [];
            }
            insertSpaces(draft, [action.response.space], {
                apiConvos: action.response.conversations || [],
                apiUsers: action.response.profiles || [],
                apiGroups: action.response.groups || [],
                apiSpaceCalls: action.response.calls || [],
                apiSpaceTribunes: action.response.tribunes || [],
            }, featureFlags);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserJoinedSpace.js.map