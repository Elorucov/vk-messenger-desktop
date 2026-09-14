import { changeLayerPosition } from './layer';
import { getPopUpPositionType } from './getPopUpPositionType';
import { ConflictActionsTypes } from '../constants';
export const checkPositionConflict = (conflictsBlocks, { bottom, right, top, left }, layer) => {
    const result = { ...layer };
    for (const block of conflictsBlocks) {
        if (block.popUpPositions && !block.popUpPositions.includes(getPopUpPositionType(layer))) {
            continue;
        }
        const container = document.querySelector(block.blockSelector);
        if (!container) {
            continue;
        }
        const rect = container.getBoundingClientRect();
        if (!(left <= rect.right && right >= rect.left && top <= rect.bottom && bottom >= rect.top)) {
            continue;
        }
        if (block.action === ConflictActionsTypes.DontShow) {
            return null;
        }
        return changeLayerPosition(result);
    }
    return result;
};
//# sourceMappingURL=checkPositionConflict.js.map