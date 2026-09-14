import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'MockUpdate': {
            draft.lastSeens = new Map([...draft.lastSeens]);
            draft.typings = new Map([...draft.typings]);
            return [];
        }
        case 'MockUpdate_RequestCompleted': {
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=MockUpdate.js.map