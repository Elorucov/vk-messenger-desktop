import { ERROR_CODES } from '@vk-ecosystem/mini-app';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
export const logFeatureDebug = (message, ...args) => {
    debugMessage(DebugMessageType.WARN, `miniApps: ${message}`, ...args);
};
export const logFeatureError = (err) => {
    debugMessage(DebugMessageType.ERROR, err);
};
export function getSuccessfulResponse(handlerName) {
    return {
        type: `${handlerName}Result`,
        data: {
            result: true,
        },
    };
}
export const createErrorHandler = (handlerName) => (err, reason) => {
    logFeatureError(err);
    reason ??= typeof err === 'string' ? err : 'Unexpected internal error';
    return {
        type: `${handlerName}Failed`,
        data: {
            error_type: 'client_error',
            error_data: {
                error_code: ERROR_CODES.UNKNOWN,
                error_reason: reason,
            },
        },
    };
};
const SCREEN_DEFAULT_VALUE = 'none';
// Based on static/js/modules/shared/apps_connect/handlers/VKWebAppSendCustomEvent.js
// Handled in www/VK/Stats/Product/MiniAppCustomEventsCollector.php
export function buildCustomMiniAppStatEvent({ app, bridgeParams, hash, miniAppsStatPlatform, userId, }) {
    const eventType = bridgeParams.type || 'type_action';
    return {
        type: eventType,
        [eventType]: {
            type: 'type_mini_app_custom_event_item',
        },
        client_time: bridgeParams.timestamp ?? Date.now(),
        event: bridgeParams.event,
        json: bridgeParams.json ?? '',
        mini_app_id: app.id,
        screen: bridgeParams.screen ?? SCREEN_DEFAULT_VALUE,
        timezone: bridgeParams.timezone ?? '',
        url: `${app.url}${hash ?? ''}`,
        user_id: userId,
        vk_platform: bridgeParams.vk_platform ?? miniAppsStatPlatform,
    };
}
//# sourceMappingURL=utils.js.map