import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserUpdatedSpaceRoom': {
            const space = draft.spaces.get(action.spaceId);
            if (space && space.kind === 'Space') {
                const room = space.rooms.get(action.roomId);
                if (room) {
                    room.sectionId = action.data.sectionId;
                }
            }
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserUpdatedSpaceRoom.js.map