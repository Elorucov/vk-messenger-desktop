import { LottiePlayerDirection } from '@vkontakte-internal/rlottie';
import { dataAttrKeyToDatasetKey } from './utils/dataAttrKeyToDatasetKey';
export const CONTAINER_ID_DATA_DEFAULT_VALUE = 'common_container';
export const FULL_SCREEN_DATA_DEFAULT_VALUE = 'body';
export const CONTAINER_ID_DATA_PROPERTY = 'data-popup-sticker-container-id';
export const CONTAINER_ID_DATASET_PROPERTY = dataAttrKeyToDatasetKey(CONTAINER_ID_DATA_PROPERTY);
// id-шники контейнеров
// ref in php -> www/VK/Stickers/Popup/HtmlAttributes/ContainersId.php:4
export const POPUP_STICKER_IM_CONTAINER = 'popup-sticker-im-container';
export const FULL_SCREEN_CONTAINER_DATA_PROPERTY = 'data-popup-sticker-full-screen-container';
export const DEDUCTIBLE_DATA_PROPERTY = 'data-popup-sticker-deductible';
export const DEDUCTIBLE_FULL_SCREEN_DATA_PROPERTY = 'data-popup-sticker-deductible-full-screen';
export const ANIMATION_DEDUCTIBLE_DATA_PROPERTY = 'data-popup-sticker-animation-deductible';
export const DEFAULT_POPUP_CONTAINER_DATA_PROPERTY = 'data-popup-sticker-use-common';
export const POPUP_POSITION_PROPERTY = 'data-popup-sticker-position';
export const POPUP_POSITION_DEFAULT_VALUE = 'fixed';
export const SCREEN_MODIFICATOR = 'screen';
/**
 * Анимация включается интерактивно, а не проигрывается постоянно, поэтому отключаем cache.
 * При проигрывании анимации из-за длительности, а также из-за размеров попап-стикера (в случае ретины x2),
 * кеш кадров анимации начинает занимать слишком много места и кладет вкладку в мобильном браузере (фикс для VAS-8965).
 */
export const DEFAULT_PLAYER_OPTIONS = {
    speed: 1,
    loop: true,
    autoplay: false,
    cache: false,
    lazyLoading: true,
    direction: LottiePlayerDirection.FORWARD,
    strictCache: true,
};
export const SPEED_ON_DESTROY = 3;
export const PopUpLayerTypes = {
    Gradient: 'gradient',
    FullScreen: 'animation_fullscreen',
    Fixed: 'animation_fixed',
};
/**
 * Вспомогательные слои, что не приходят с бекенда
 */
export const CustomPopUpLayerTypes = {
    /**
     * Слой с фоном, через который нельзя кликнуть на элемент за ним.
     * Используется в предпросмотрах
     */
    Background: 'background',
};
export const PopUpPositionTypes = {
    /**
     * Анимация имеет position_y и position_x С префиксом screen
     * Или это анимация с LayoutTypes.FullScreen
     */
    FullScreen: 'fullscreen',
    /**
     * Анимация имеет position_y и position_x БЕЗ префикса screen
     */
    Fixed: 'fixed',
    /**
     * Для анимаций где у position_y значение screen top, а у position_x значение без screen
     */
    TopFullScreen: 'topFullScreen',
};
export const DEFAULT_LOOP_LIMIT = 1;
export const DEFAULT_SCALE_RATIO = 1;
export const DEFAULT_POSITION_X = 'center';
export const DEFAULT_POSITION_Y = 'middle';
export const MIN_SIZE_FOR_SCALE = 384;
export const MIN_SIZE_FOR_PLAY = 64;
export const POPUP_LOTTIE_GROUP = 'Popup';
/**
 * Типы действий, когда у нас есть конфликты анимации с другими блоками.
 * Например, если у нас есть блоки сайта, которые не хотим перекрывать анимацией
 */
export const ConflictActionsTypes = {
    /**
     * Меняем позиционирование на screen или наоборот
     */
    ChangeModificator: 'changeModificator',
    /**
     * Не показываем анимацию
     */
    DontShow: 'dontShow',
};
export const DESTROY_ANIMATION_DURATION = 300;
//# sourceMappingURL=constants.js.map