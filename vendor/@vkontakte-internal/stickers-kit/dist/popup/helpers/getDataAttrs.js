import { DEDUCTIBLE_DATA_PROPERTY, DEDUCTIBLE_FULL_SCREEN_DATA_PROPERTY, CONTAINER_ID_DATA_PROPERTY, CONTAINER_ID_DATA_DEFAULT_VALUE, FULL_SCREEN_CONTAINER_DATA_PROPERTY, POPUP_POSITION_PROPERTY, POPUP_POSITION_DEFAULT_VALUE, DEFAULT_POPUP_CONTAINER_DATA_PROPERTY, ANIMATION_DEDUCTIBLE_DATA_PROPERTY, } from '../constants';
/**
 * Данные аттребуты проставляются на div фиксированной области.
 * Делаю тут изменения продублируйте их в Stickers\Popup\SharedWeb::getStringDataAttrs.
 */
export const getDataAttrs = (data) => {
    const { popupStickerUseCommon = 'false', popupStickerContainerId, popupStickerFullScreenContainer, popupStickerPosition = POPUP_POSITION_DEFAULT_VALUE, } = data;
    const result = {
        [DEFAULT_POPUP_CONTAINER_DATA_PROPERTY]: popupStickerUseCommon,
        [POPUP_POSITION_PROPERTY]: popupStickerPosition,
        [CONTAINER_ID_DATA_PROPERTY]: popupStickerContainerId,
    };
    if (popupStickerFullScreenContainer) {
        result[FULL_SCREEN_CONTAINER_DATA_PROPERTY] = popupStickerFullScreenContainer;
    }
    return result;
};
export const getStringDataAttrs = (data) => {
    let result = '';
    const attrs = getDataAttrs(data);
    Object.entries(attrs).forEach(([property, value]) => {
        result += `${property}='${value}' `;
    });
    return result.trim();
};
export const getDeductibleDataAttrs = (data) => {
    const { popupStickerDeductible, popupStickerDeductibleFullScreen } = data;
    const result = {};
    if (popupStickerDeductible) {
        result[DEDUCTIBLE_DATA_PROPERTY] = popupStickerDeductible;
    }
    if (popupStickerDeductibleFullScreen) {
        result[DEDUCTIBLE_FULL_SCREEN_DATA_PROPERTY] = popupStickerDeductibleFullScreen;
    }
    return result;
};
export const getDataAttrsFromFixedElement = (fixedElement) => {
    const { popupStickerUseCommon = 'false', popupStickerPosition = POPUP_POSITION_DEFAULT_VALUE, popupStickerContainerId = CONTAINER_ID_DATA_DEFAULT_VALUE, } = fixedElement.dataset;
    return {
        popupStickerContainerId,
        popupStickerUseCommon: popupStickerUseCommon,
        popupStickerPosition: popupStickerPosition,
    };
};
export const findFixedElement = (element) => {
    return element.closest(`[${CONTAINER_ID_DATA_PROPERTY}]`) || document.body;
};
export function findElementByContainerId(type, property, stickerElement, popupStickerContainerId, isCanUseCommonContainer, fallback = null) {
    let elements = [...document.querySelectorAll(`[${property}=${popupStickerContainerId}]`)];
    if (isCanUseCommonContainer) {
        elements = [
            ...elements,
            ...document.querySelectorAll(`[${property}=${CONTAINER_ID_DATA_DEFAULT_VALUE}]`),
        ];
    }
    elements.push(stickerElement);
    switch (type) {
        case 'lower':
        case 'parent':
            elements = elements.sort((a, b) => {
                return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
            });
            break;
        case 'upper':
            elements = elements.sort((a, b) => {
                return a.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom;
            });
            break;
    }
    const stickerIndex = elements.findIndex((element) => element === stickerElement);
    let element;
    switch (type) {
        case 'upper':
        case 'parent':
            element = elements[stickerIndex - 1] || null;
            break;
        case 'lower':
            element = elements[stickerIndex + 1] || null;
            break;
        default:
            element = elements[0] || null;
    }
    return element || fallback;
}
export const getPopupElementsFromFixedElement = (fixedElement, stickerElement) => {
    const { popupStickerContainerId, popupStickerPosition, popupStickerUseCommon } = getDataAttrsFromFixedElement(fixedElement);
    let isCanUseCommonContainer = popupStickerUseCommon === 'true';
    const headerElement = findElementByContainerId('upper', DEDUCTIBLE_DATA_PROPERTY, stickerElement, popupStickerContainerId, isCanUseCommonContainer);
    const footerElement = findElementByContainerId('lower', DEDUCTIBLE_DATA_PROPERTY, stickerElement, popupStickerContainerId, isCanUseCommonContainer);
    const fullScreenElement = findElementByContainerId('parent', FULL_SCREEN_CONTAINER_DATA_PROPERTY, stickerElement, popupStickerContainerId, isCanUseCommonContainer, document.body);
    const fullScreenHeaderElement = findElementByContainerId('upper', DEDUCTIBLE_FULL_SCREEN_DATA_PROPERTY, stickerElement, popupStickerContainerId, isCanUseCommonContainer);
    const fullScreenFooterElement = findElementByContainerId('lower', DEDUCTIBLE_FULL_SCREEN_DATA_PROPERTY, stickerElement, popupStickerContainerId, isCanUseCommonContainer);
    const animationFooterElement = findElementByContainerId('lower', ANIMATION_DEDUCTIBLE_DATA_PROPERTY, stickerElement, popupStickerContainerId, isCanUseCommonContainer);
    return {
        fixedElement,
        headerElement,
        footerElement,
        fullScreenElement,
        fullScreenHeaderElement,
        fullScreenFooterElement,
        animationFooterElement,
        position: popupStickerPosition,
    };
};
//# sourceMappingURL=getDataAttrs.js.map