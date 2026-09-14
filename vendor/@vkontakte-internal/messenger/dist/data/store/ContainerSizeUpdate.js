import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'ContainerSizeUpdate': {
            draft.containerSize.width = action.width;
            return [];
        }
        case 'Noop': {
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=ContainerSizeUpdate.js.map