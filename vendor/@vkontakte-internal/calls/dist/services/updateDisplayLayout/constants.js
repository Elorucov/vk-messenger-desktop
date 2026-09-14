export var Fit;
(function (Fit) {
    Fit["CONTAIN"] = "cn";
    Fit["COVER"] = "cv";
})(Fit || (Fit = {}));
export const CARD_SIZES = {
    collapsed: {
        width: 640,
        height: 483,
    },
    regular: {
        width: 900,
        height: 504,
    },
    sausage: {
        width: 140,
        height: 140,
    },
};
/**
 * Хелпер для обновления CARD_SIZES. Нужно чтоб в мвк можно было выводить лейауты меньших размеров.
 * Но при этом использовать ту же абстракцию для работы с layout.
 * Возможно у нас течет абстракция, но нужно тогда рефачить весь participantLayout.
 */
export function updateCardSizes(type, sizes) {
    CARD_SIZES[type] = sizes;
}
//# sourceMappingURL=constants.js.map