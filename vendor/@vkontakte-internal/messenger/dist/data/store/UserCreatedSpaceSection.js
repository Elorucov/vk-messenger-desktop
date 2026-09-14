import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserCreatedSpaceSection': {
            const space = draft.spaces.get(action.spaceId);
            if (space && space.kind === 'Space') {
                space.sections.set(action.section.id, action.section);
            }
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserCreatedSpaceSection.js.map