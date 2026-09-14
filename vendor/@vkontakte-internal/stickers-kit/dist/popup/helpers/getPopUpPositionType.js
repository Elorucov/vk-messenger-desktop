import { isFullScreenLayer, isTopFullScreenLayer } from './layer';
import { PopUpPositionTypes } from '../constants';
export function getPopUpPositionType(layer) {
    if (isFullScreenLayer(layer)) {
        return PopUpPositionTypes.FullScreen;
    }
    if (isTopFullScreenLayer(layer)) {
        return PopUpPositionTypes.TopFullScreen;
    }
    return PopUpPositionTypes.Fixed;
}
//# sourceMappingURL=getPopUpPositionType.js.map