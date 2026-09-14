import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from 'react';
import { PopupContext } from './usePopupSticker';
import { PopupStickerService } from '../../service';
/**
 * React провайдер, который (либо возьмет из пропов, либо создаст), закеширует в рефе и передаст вниз
 */
export const PopupProvider = ({ popupStore, children }) => {
    const ref = useRef(popupStore ?? new PopupStickerService());
    return _jsx(PopupContext.Provider, { value: { popupStore: ref.current }, children: children });
};
//# sourceMappingURL=PopupProvider.js.map