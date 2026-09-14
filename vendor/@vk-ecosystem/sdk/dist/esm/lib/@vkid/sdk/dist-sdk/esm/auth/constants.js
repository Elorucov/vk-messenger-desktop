import { AuthErrorCode } from './types.js';

const AUTH_RESPONSE_TOKEN = 'silent_token';
const AUTH_ERROR_TEXT = {
    [AuthErrorCode.EventNotSupported]: 'Event is not supported',
    [AuthErrorCode.CannotCreateNewTab]: 'Cannot create new tab. Try checking your browser settings',
    [AuthErrorCode.NewTabHasBeenClosed]: 'New tab has been closed',
    [AuthErrorCode.AuthorizationFailed]: 'Authorization failed with an error'
};
const AUTH_VK_CONNECT_RESPONSE = 'vk_connect_response';

export { AUTH_ERROR_TEXT, AUTH_RESPONSE_TOKEN, AUTH_VK_CONNECT_RESPONSE };
