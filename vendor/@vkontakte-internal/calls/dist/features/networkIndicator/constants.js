import { NetworkState } from '@vkontakte-internal/calls-core';
export const DEFAULT_BAD_THRESHOLD = 0.3;
export const DEFAULT_GOOD_THRESHOLD = 0.6;
export const DEFAULT_OVERPASS_THRESHOLD = 0.1;
export var NetworkStateColorClass;
(function (NetworkStateColorClass) {
    NetworkStateColorClass["MEDIUM"] = "color_accent_orange";
    NetworkStateColorClass["BAD"] = "color_icon_negative";
})(NetworkStateColorClass || (NetworkStateColorClass = {}));
export const NetworkStateColorClassMap = {
    [NetworkState.MEDIUM]: NetworkStateColorClass.MEDIUM,
    [NetworkState.BAD]: NetworkStateColorClass.BAD,
};
//# sourceMappingURL=constants.js.map