import { exhaustivenessCheck } from '../../core/utils/misc';
import { insertConvos, insertPeers, insertSpaceCalls, insertSpaceTribunes, } from '../store/State';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'UserCreatedSpaceRoom': {
            const space = draft.spaces.get(action.spaceId);
            if (space && space.kind === 'Space') {
                space.rooms.set(action.room.id, action.room);
            }
            insertSpaceCalls(draft, action.calls || []);
            insertSpaceTribunes(draft, action.tribunes || []);
            insertConvos(draft, action.conversations || [], featureFlags);
            insertPeers(draft, {
                apiUsers: action.profiles || [],
                apiGroups: action.groups || [],
                apiContacts: [],
            });
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UserCreatedSpaceRoom.js.map