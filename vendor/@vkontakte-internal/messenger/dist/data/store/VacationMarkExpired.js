import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Peer from '../../core/model/Peer';
export const handler = (draft, action) => {
    const { type } = action;
    switch (type) {
        case 'VacationMarkExpired': {
            const employee = draft.peers.get(action.userId);
            if (employee?.kind !== 'User' ||
                draft.locks.clearVacationMark.has(employee.id)) {
                return [];
            }
            draft.locks.clearVacationMark.add(employee.id);
            Peer.clearVacation(employee);
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
//# sourceMappingURL=VacationMarkExpired.js.map