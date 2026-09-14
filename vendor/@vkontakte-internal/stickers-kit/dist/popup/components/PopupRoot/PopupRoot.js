import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"HtmlElement":["global",{"className":1}]} */
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState, } from 'react';
import { PopUpPortal } from '../PopUpPortal/PopUpPortal';
import { PopupProvider } from '../PopupProvider/PopupProvider';
import { getDataAttrs } from '../../helpers/getDataAttrs';
import { setRef } from '../../utils/setRef';
import { FULL_SCREEN_CONTAINER_DATA_PROPERTY, FULL_SCREEN_DATA_DEFAULT_VALUE, POPUP_POSITION_DEFAULT_VALUE, } from '../../constants';
import { PopupStickerService } from '../../service';
import styles from './PopupRoot.module.css';
/**
 * Этот компонент используется в React коде как root, на который ориентируется попап анимация
 * и проигрывается в рамках позиции и настроек этого контейнера
 */
export const PopupRoot = observer(({ isVisible = true, allowUseCommon = false, isUseAsFullscreen = false, position = POPUP_POSITION_DEFAULT_VALUE, HtmlElement = 'div', setElementRef, children, className, popUpStore, id, ...props }) => {
    const [fullScreenRef, setFullScreenRef] = useState(null);
    const fallbackPopupStickerService = useMemo(() => {
        return new PopupStickerService();
    }, []);
    const getRef = (node) => {
        setRef(node, setElementRef);
        if (!node) {
            setFullScreenRef(null);
            return;
        }
        const attrs = getDataAttrs({
            popupStickerPosition: position,
            popupStickerContainerId: node.id,
            popupStickerUseCommon: allowUseCommon.toString(),
            popupStickerFullScreenContainer: isUseAsFullscreen ? node.id : undefined,
        });
        for (const [property, value] of Object.entries(attrs)) {
            node.setAttribute(property, value);
        }
        if (isUseAsFullscreen) {
            setFullScreenRef(node);
            return;
        }
        setFullScreenRef(document.querySelector(`#${node.getAttribute(FULL_SCREEN_CONTAINER_DATA_PROPERTY)}`) ||
            document.querySelector(FULL_SCREEN_DATA_DEFAULT_VALUE));
    };
    useEffect(() => {
        if (!isVisible) {
            popUpStore?.destroyByRemove();
        }
    }, [isVisible]);
    useEffect(() => {
        return () => {
            popUpStore?.destroyByRemove();
        };
    }, []);
    return (_jsx(HtmlElement, { id: id, ref: getRef, className: className || styles.wrapper, ...props, children: _jsxs(PopupProvider, { popupStore: popUpStore || fallbackPopupStickerService, children: [fullScreenRef && isVisible && _jsx(PopUpPortal, { portalElement: fullScreenRef }), children] }) }));
});
//# sourceMappingURL=PopupRoot.js.map