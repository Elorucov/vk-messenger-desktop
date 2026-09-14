import { useCallback } from 'react';
import { useNotifier } from '@vkontakte-internal/calls-core';
import { useLang } from './useLang';
import { handlePromiseError } from '../helpers/logger';
export var EErrorMessages;
(function (EErrorMessages) {
    EErrorMessages["CAPTCHA_ERROR"] = "Captcha needed";
    EErrorMessages["INVALID_NAME"] = "Invalid request: Invalid name";
    EErrorMessages["FLOOD_CONTROL"] = "Flood control";
    EErrorMessages["INTERNAL_SERVER_ERROR"] = "Internal server error";
    EErrorMessages["INVALID_TIME"] = "Invalid request: Invalid time";
    EErrorMessages["CALL_ALREADY_ENDED"] = "Invalid request: Call already ended";
    EErrorMessages["INVALID_DURATION"] = "Invalid request: Invalid duration";
    EErrorMessages["INVALID_RECURRENCE_TIME"] = "Invalid request: Invalid recurrence times";
    EErrorMessages["INVALID_RECURRENCE_TIME_PARAMS"] = "Invalid request: Invalid recurrence time params";
    EErrorMessages["INVALID_BROADCAST_START_TIME_VALUE_GREATER_THAN_MAX"] = "One of the parameters specified was missing or invalid: start_time value greater than max";
    EErrorMessages["INVALID_BROADCAST_START_TIME_VALUE_LOWER_THAN_MIN"] = "One of the parameters specified was missing or invalid: start_time value lower than min";
    EErrorMessages["INVALID_BROADCAST_START_TIME_MUST_BE_MORE_CALL_TIME"] = "Invalid request: Invalid broadcast start time - must be more call time";
})(EErrorMessages || (EErrorMessages = {}));
/**
 * обрабатывает ошибки сетевых вызовов. если они есть
 * в словаре - выведет сообщение пользователю, в противном
 * случае - в консоль
 *
 * @example
 * ```
 * const { handleError } = usePromiseError();
 * copyTextToClipboard(description)
 *   .then(() => {
 *     showText(getLang('calls_create_call_by_link_text_copied'));
 *   })
 *   .catch(handleError);
 * ```
 */
export const usePromiseError = () => {
    const { showErrorMessage } = useNotifier();
    const { getLang } = useLang();
    const handleError = useCallback((error) => {
        // web.vk.me форматирует формат ответа с бека, и ошибку кладет в apiError
        const msg = error.apiError?.error_msg || error.error?.error_msg;
        switch (msg) {
            case EErrorMessages.INVALID_NAME: {
                showErrorMessage({
                    title: getLang('calls_error_invalid_name_title'),
                    text: getLang('calls_error_invalid_name_desc'),
                });
                break;
            }
            case EErrorMessages.CAPTCHA_ERROR:
            case EErrorMessages.FLOOD_CONTROL: {
                showErrorMessage({
                    title: getLang('calls_error_flood_control_title'),
                    text: getLang('calls_error_flood_control_desc'),
                });
                break;
            }
            case EErrorMessages.INTERNAL_SERVER_ERROR: {
                showErrorMessage({
                    title: getLang('calls_error_internal_title'),
                    text: getLang('calls_error_internal_desc'),
                });
                break;
            }
            case EErrorMessages.INVALID_TIME:
            case EErrorMessages.CALL_ALREADY_ENDED: {
                showErrorMessage({
                    title: getLang('calls_error_invalid_time_title'),
                    text: getLang('calls_error_invalid_time_desc'),
                });
                break;
            }
            case EErrorMessages.INVALID_BROADCAST_START_TIME_MUST_BE_MORE_CALL_TIME: {
                // Трансляция не может начинаться раньше звонка
                showErrorMessage({
                    title: getLang('calls_error_invalid_broadcast_time_less_call_time_title'),
                    text: getLang('calls_error_invalid_broadcast_time_less_call_time_desc'),
                });
                break;
            }
            case EErrorMessages.INVALID_BROADCAST_START_TIME_VALUE_GREATER_THAN_MAX: {
                showErrorMessage({
                    title: getLang('calls_error_invalid_broadcast_time_title'),
                    // Трансляцию можно запланировать максимум на год вперёд
                    text: getLang('calls_invalid_broadcast_start_time_value_greater_than_max'),
                });
                break;
            }
            case EErrorMessages.INVALID_BROADCAST_START_TIME_VALUE_LOWER_THAN_MIN: {
                showErrorMessage({
                    title: getLang('calls_error_invalid_broadcast_time_title'),
                    // Выбранное время уже прошло, выберите время в будущем
                    text: getLang('calls_invalid_broadcast_start_time_value_lower_than_min'),
                });
                break;
            }
            case EErrorMessages.INVALID_DURATION: {
                showErrorMessage({
                    title: getLang('calls_error_invalid_time_title'),
                    text: getLang('calls_error_invalid_duration_desc'),
                });
                break;
            }
            case EErrorMessages.INVALID_RECURRENCE_TIME:
            case EErrorMessages.INVALID_RECURRENCE_TIME_PARAMS: {
                showErrorMessage({
                    title: getLang('calls_error_invalid_recurrence_times_title'),
                    text: getLang('calls_error_invalid_recurrence_times_desc'),
                });
                break;
            }
            default: {
                handlePromiseError(error);
                break;
            }
        }
    }, [getLang, showErrorMessage]);
    return {
        handleError,
    };
};
//# sourceMappingURL=usePromiseError.js.map