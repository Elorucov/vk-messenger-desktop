import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UnavailabilitySchedule_Update': {
            const { userId, schedule } = action;
            if (!userId) {
                return [];
            }
            const peer = draft.peers.get(userId);
            if (peer && peer.kind === 'User') {
                if (schedule) {
                    // на обновление всегда приходит полное расписание
                    peer.eduSchedule = {
                        timezone: schedule.timezone,
                        intervals: schedule.intervals,
                    };
                }
            }
            return [];
        }
        default:
            exhaustivenessCheck(action.type);
    }
};
//# sourceMappingURL=UnavailabilitySchedule.js.map