import { HOUR, MINUTE } from '../../helpers/date';
/** продолжительность звонка */
export var EDuration;
(function (EDuration) {
    EDuration["1day"] = "1day";
    EDuration["30minutes"] = "30minutes";
    EDuration["45minutes"] = "45minutes";
    EDuration["1hour"] = "1hour";
    EDuration["2hours"] = "2hours";
    EDuration["3hours"] = "3hours";
    EDuration["4hours"] = "4hours";
    EDuration["5hours"] = "5hours";
})(EDuration || (EDuration = {}));
export const DURATION_MAP = {
    [EDuration['1day']]: HOUR * 24,
    [EDuration['30minutes']]: MINUTE * 30,
    [EDuration['45minutes']]: MINUTE * 45,
    [EDuration['1hour']]: HOUR,
    [EDuration['2hours']]: HOUR * 2,
    [EDuration['3hours']]: HOUR * 3,
    [EDuration['4hours']]: HOUR * 4,
    [EDuration['5hours']]: HOUR * 5,
};
export const DURATION_LANG_MAP = {
    [EDuration['1day']]: 'calls_day',
    [EDuration['30minutes']]: 'calls_min',
    [EDuration['45minutes']]: 'calls_min',
    [EDuration['1hour']]: 'calls_hour',
    [EDuration['2hours']]: 'calls_hour',
    [EDuration['3hours']]: 'calls_hour',
    [EDuration['4hours']]: 'calls_hour',
    [EDuration['5hours']]: 'calls_hour',
};
export var EMediaPermission;
(function (EMediaPermission) {
    EMediaPermission["Allowed"] = "unmute";
    EMediaPermission["DisabledOnEnter"] = "mute";
    EMediaPermission["Disabled"] = "mute_permanent";
})(EMediaPermission || (EMediaPermission = {}));
export const hour = 1000 * 60 * 60;
export const WEEKDAY_MAP = {
    0: 'SU',
    1: 'MO',
    2: 'TU',
    3: 'WE',
    4: 'TH',
    5: 'FR',
    6: 'SA',
};
export const numberFormatter = new Intl.NumberFormat('ru-RU', {
    minimumIntegerDigits: 2,
});
export const numberWithSignFormatter = new Intl.NumberFormat('en-US', {
    signDisplay: 'exceptZero',
});
export var ECreateBroadcastErrors;
(function (ECreateBroadcastErrors) {
    // Ошибка при создании
    ECreateBroadcastErrors["CREATE"] = "CREATE";
    // Ошибка при редактировании
    ECreateBroadcastErrors["EDIT"] = "EDIT";
    // Ошибка при создании или редактировании, когда еще не были заполнены данные по трансляции
    ECreateBroadcastErrors["CREATE_NO_DATA"] = "CREATE_NO_DATA";
})(ECreateBroadcastErrors || (ECreateBroadcastErrors = {}));
export const BROADCAST_THUMB_AVAILABLE_FORMATS = ['jpg', 'jpeg', 'png'];
//# sourceMappingURL=constants.js.map