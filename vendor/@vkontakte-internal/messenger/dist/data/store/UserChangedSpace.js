import * as Space from '../../core/model/Space';
import * as TextChunk from '../../core/model/TextChunk';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserChangedSpace': {
            const { spaceId, description, name } = action;
            const space = draft.spaces.get(spaceId);
            if (!space) {
                return [];
            }
            const prevName = name ? space.name : undefined;
            const prevDescription = description !== undefined ? space.description : undefined;
            if (name) {
                Space.setName(space, name);
            }
            if (description !== undefined) {
                Space.setDescription(space, TextChunk.fromClientText(description));
            }
            return [
                async function ({ api }) {
                    try {
                        const params = {
                            space_id: spaceId,
                            description,
                            name,
                        };
                        const response = await api.fetch('spaces.edit', params);
                        return {
                            type: 'UserChangedSpace_RequestCompleted',
                            spaceId,
                            hasFailed: !response,
                            prevDescription,
                            prevName,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedSpace_RequestCompleted',
                            spaceId,
                            hasFailed: true,
                            prevDescription,
                            prevName,
                        };
                    }
                },
            ];
        }
        case 'UserChangedSpace_RequestCompleted': {
            const { hasFailed, spaceId, prevDescription, prevName } = action;
            const space = draft.spaces.get(spaceId);
            if (!space) {
                return [];
            }
            if (hasFailed) {
                if (prevName) {
                    Space.setName(space, prevName);
                }
                if (prevDescription !== undefined) {
                    Space.setDescription(space, prevDescription);
                }
                return [];
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserChangedSpace.js.map