import { E_ACTION } from '../constants';
/**
 * @param type
 * @param details
 * @param isChild If true modal will be shown over existing modal
 */
export const toggleModal = (type, details = undefined, isChild = false) => {
    return {
        type: E_ACTION.TOGGLE_MODAL,
        modal: type
            ? {
                type,
                details,
            }
            : undefined,
        isChild,
    };
};
export const toggleChildModal = (type, details) => {
    return toggleModal(type, details, true);
};
//# sourceMappingURL=modal.js.map