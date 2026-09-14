import '../../ui/StickersPopupRootContainer/StickersPopupRootContainer.css';
import React, { useMemo } from 'react';
import { PopupRoot, PopupStickerService, } from '@vkontakte-internal/stickers-kit';
import { useFeatureFlags } from '../../hooks/misc';
export const StickersPopupRootContainer = ({ children, allowUseCommon, isUseAsFullscreen, popUpStore, setElementRef, position = 'absolute', HtmlElement = 'div', className = 'StickersPopupRootContainer', disabled = false, ...props }) => {
    const { vkm_stickers_popup } = useFeatureFlags();
    const fallbackPopupStickerService = useMemo(() => {
        return new PopupStickerService();
    }, []);
    if (!vkm_stickers_popup || disabled) {
        return (React.createElement(HtmlElement, { ref: setElementRef, className: className, ...props }, children));
    }
    return (React.createElement(PopupRoot, { setElementRef: setElementRef, popUpStore: popUpStore || fallbackPopupStickerService, position: position, className: className, allowUseCommon: allowUseCommon, isUseAsFullscreen: isUseAsFullscreen, HtmlElement: HtmlElement, ...props }, children));
};
//# sourceMappingURL=StickersPopupRootContainer.js.map