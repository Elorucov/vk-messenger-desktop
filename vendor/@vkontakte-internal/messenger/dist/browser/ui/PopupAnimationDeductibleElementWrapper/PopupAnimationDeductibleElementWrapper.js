import '../../ui/StickersPopupRootContainer/StickersPopupRootContainer.css';
import React from 'react';
import { PopupAnimationDeductibleElement, } from '@vkontakte-internal/stickers-kit';
import { useFeatureFlags } from '../../hooks/misc';
export const PopupAnimationDeductibleElementWrapper = ({ children, setElementRef, popupStickerContainerId, HtmlElement = 'div', disabled = false, ...props }) => {
    const { vkm_stickers_popup } = useFeatureFlags();
    if (!vkm_stickers_popup || disabled) {
        return (React.createElement(HtmlElement, { ref: setElementRef, ...props }, children));
    }
    return (React.createElement(PopupAnimationDeductibleElement, { HtmlElement: HtmlElement, setElementRef: setElementRef, popupStickerContainerId: popupStickerContainerId, ...props }, children));
};
//# sourceMappingURL=PopupAnimationDeductibleElementWrapper.js.map