export var EMuteEventType;
(function (EMuteEventType) {
    /** не пришло обновлений по выбранному типу медиа */
    EMuteEventType[EMuteEventType["None"] = 0] = "None";
    /** нам отключили разово аудио\видео */
    EMuteEventType[EMuteEventType["Muted"] = 1] = "Muted";
    /** нам постоянно отключили аудио\видео */
    EMuteEventType[EMuteEventType["MutedPermanent"] = 2] = "MutedPermanent";
    /** нам включили аудио\видео без привлечения внимания */
    EMuteEventType[EMuteEventType["UnmutedWithoutAttraction"] = 3] = "UnmutedWithoutAttraction";
    /** можем включить аудио\видео 1 раз */
    EMuteEventType[EMuteEventType["CanTurnOnOnce"] = 4] = "CanTurnOnOnce";
    /** можем включить аудио\видео 1 раз без привлечения внимания */
    EMuteEventType[EMuteEventType["CanTurnOnOnceWithoutAttraction"] = 5] = "CanTurnOnOnceWithoutAttraction";
    /** нам включили аудио\видео с привлеченем внимания */
    EMuteEventType[EMuteEventType["UnmutedWithAttraction"] = 6] = "UnmutedWithAttraction";
})(EMuteEventType || (EMuteEventType = {}));
export var EPermissionsOnceAction;
(function (EPermissionsOnceAction) {
    EPermissionsOnceAction[EPermissionsOnceAction["Increase"] = 0] = "Increase";
    EPermissionsOnceAction[EPermissionsOnceAction["Clear"] = 1] = "Clear";
    EPermissionsOnceAction[EPermissionsOnceAction["Reset"] = 2] = "Reset";
})(EPermissionsOnceAction || (EPermissionsOnceAction = {}));
//# sourceMappingURL=permissions.js.map