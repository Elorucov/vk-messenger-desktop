import { getModuleKeyCombo } from './keyBoardCombos';
/**
 * Фабрика обработчиков событий keyDown на элементе в фокусе.
 * Подробнее: https://confluence.mvk.com/pages/viewpage.action?pageId=143261162
 * Перед обработкой клавиши добавьте ее в moduleKeyCombo.
 */
export const onElementKeyDownFactory = (handler) => (event) => {
    const keyCombo = getModuleKeyCombo(event);
    handler(keyCombo, event);
};
//# sourceMappingURL=elementKeyDown.js.map