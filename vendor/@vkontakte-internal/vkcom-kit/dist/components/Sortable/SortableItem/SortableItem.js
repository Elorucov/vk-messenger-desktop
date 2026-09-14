import { cloneElement } from 'react';
export const SortableItem = ({ id, children, disabled }) => {
    return cloneElement(children, {
        'data-sortable-id': id,
        ...(disabled
            ? {
                'data-sortable-disabled': true,
            }
            : { draggable: 'true' }),
    });
};
//# sourceMappingURL=SortableItem.js.map