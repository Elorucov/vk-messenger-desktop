import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"HtmlElement":["global",{"style":1}]} */
import { observer } from 'mobx-react-lite';
import { setRef } from '../../utils/setRef';
import { ANIMATION_DEDUCTIBLE_DATA_PROPERTY } from '../../constants';
import { usePopupStickerWithError } from '../PopupProvider/usePopupSticker';
export const PopupAnimationDeductibleElement = observer(({ HtmlElement = 'div', setElementRef, popupStickerContainerId, children, ...props }) => {
    const { popupStore } = usePopupStickerWithError();
    const getRef = (node) => {
        setRef(node, setElementRef);
        if (!node) {
            return;
        }
        const attrs = {
            [ANIMATION_DEDUCTIBLE_DATA_PROPERTY]: popupStickerContainerId,
        };
        for (const [property, value] of Object.entries(attrs)) {
            node.setAttribute(property, value);
        }
    };
    return (_jsx(HtmlElement, { ref: getRef, style: { zIndex: popupStore.isPlaying ? 1 : undefined }, ...props, children: children }));
});
//# sourceMappingURL=PopupAnimationDeductibleElement.js.map