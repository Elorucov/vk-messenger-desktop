import { MediaError } from '../constants';
import { CallsEventType } from '@vkontakte-internal/calls-core';
/**
 * Returns message depending on required permissions
 *
 * @param {boolean} needCamera - request camera permissions
 * @param {boolean} needMicrophone - request mic permissions
 * @param {Function} getLang
 * @returns {string} - error message
 */
export function getPermissionsErrorMessage(needCamera, needMicrophone = true, getLang) {
    let description = '';
    if (needCamera && needMicrophone) {
        description = getLang('calls_error_no_cam_and_mic');
    }
    else if (needCamera) {
        description = getLang('calls_error_no_cam');
    }
    else if (needMicrophone) {
        description = getLang('calls_error_no_mic');
    }
    return description;
}
/**
 * Returns media error message
 *
 * @param {MediaError} errorType
 * @param {Function} getLang
 * @returns {string} - error message
 */
export function getMediaErrorMessage(errorType, getLang) {
    const instruction = getLang('calls_mic_camera_permission_instruction_link')
        .replace('{link}', '<a href="https://vk.com/faq18718" target="_blank">')
        .replace('{/link}', '</a>');
    const errorTextMap = {
        [MediaError.CAMERA_PERMISSION]: `<div><div>${getLang('calls_permission_camera_error')}</div><br /><div>${instruction}</div></div>`,
        [MediaError.MIC_PERMISSION]: `<div><div>${getLang('calls_permission_mic_error')}</div><br /><div>${instruction}</div></div>`,
        [MediaError.MIC_CAMERA_PERMISSION]: `<div><div>${getLang('calls_mic_camera_permission')}</div><br /><div>${instruction}</div></div>`,
        [MediaError.CAMERA_ACCESS]: getLang('calls_error_cameralock'),
        [MediaError.MIC_ACCESS]: getLang('calls_error_miclock'),
        [MediaError.MIC_NOT_FOUND]: getLang('calls_error_nomic'),
        [MediaError.SCREEN_PERMISSION]: getLang('calls_error_screenpermission'),
        [MediaError.SCREEN_ACCESS]: getLang('calls_error_screenlock'),
    };
    return errorTextMap[errorType];
}
export const getMediaErrorTitle = (errorType, getLang) => {
    if (errorType === MediaError.CAMERA_PERMISSION) {
        return getLang('calls_settings_no_camera');
    }
    else if (errorType === MediaError.MIC_PERMISSION) {
        return getLang('calls_settings_no_mic');
    }
    return getLang('calls_oops');
};
export function createInvokeErrorWrapper(eventBus, onError, debug) {
    return (msg) => {
        if (onError) {
            onError(new Error(msg));
        }
        eventBus.emit(CallsEventType.ERROR, { error: new Error(msg) });
        if (debug) {
            console.error(msg);
        }
    };
}
//# sourceMappingURL=error.js.map