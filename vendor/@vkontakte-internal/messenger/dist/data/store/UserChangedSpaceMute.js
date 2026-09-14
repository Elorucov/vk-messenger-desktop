import { current } from 'immer';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserChangedSpaceMute': {
            const { spaceId, muteTill, useSound } = action;
            if (draft.locks.spacesSetSettings.has(spaceId)) {
                return [];
            }
            const space = draft.spaces.get(spaceId);
            if (!space) {
                return [];
            }
            draft.locks.spacesSetSettings.add(spaceId);
            const prev = current(space.viewerData.notificationSettings);
            const newSettings = {
                muteTill: muteTill !== undefined
                    ? muteTill
                    : space.viewerData.notificationSettings.muteTill,
                useSound: useSound !== undefined
                    ? useSound
                    : space.viewerData.notificationSettings.useSound,
            };
            space.viewerData.notificationSettings = newSettings;
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('spaces.setSpaceSettings', {
                            space_id: spaceId,
                            mute_till: Math.floor(newSettings.muteTill > 0
                                ? newSettings.muteTill / 1000
                                : newSettings.muteTill),
                            use_sound: newSettings.useSound ? 1 : 0,
                        });
                        return {
                            type: 'UserChangedSpaceMute_RequestCompleted',
                            spaceId,
                            prev,
                            response,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedSpaceMute_RequestCompleted',
                            spaceId,
                            prev,
                        };
                    }
                },
            ];
        }
        case 'UserChangedSpaceMute_RequestCompleted': {
            const { spaceId, prev, response } = action;
            draft.locks.spacesSetSettings.delete(spaceId);
            const space = draft.spaces.get(spaceId);
            if (!space) {
                return [];
            }
            if (!response) {
                space.viewerData.notificationSettings = prev;
            }
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserChangedSpaceMute.js.map