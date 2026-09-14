import { DataService } from '../core/dataService/dataService.js';
import { AUTH_ERROR_TEXT } from './constants.js';
import { AuthErrorCode } from './types.js';

class AuthDataService extends DataService {
    sendSuccessData = (payload)=>{
        this.sendSuccess({
            type: payload.type,
            token: payload.token,
            ttl: payload.ttl,
            uuid: payload.uuid
        });
    };
    sendNewTabHasBeenClosed = ()=>{
        this.sendError({
            code: AuthErrorCode.NewTabHasBeenClosed,
            text: AUTH_ERROR_TEXT[AuthErrorCode.NewTabHasBeenClosed]
        });
    };
    // TODO: Типизировать details
    sendAuthorizationFailed = (details)=>{
        this.sendError({
            code: AuthErrorCode.AuthorizationFailed,
            text: AUTH_ERROR_TEXT[AuthErrorCode.AuthorizationFailed],
            details
        });
    };
    sendEventNotSupported = ()=>{
        this.sendError({
            code: AuthErrorCode.EventNotSupported,
            text: AUTH_ERROR_TEXT[AuthErrorCode.EventNotSupported]
        });
    };
    sendCannotCreateNewTab = ()=>{
        this.sendError({
            code: AuthErrorCode.CannotCreateNewTab,
            text: AUTH_ERROR_TEXT[AuthErrorCode.CannotCreateNewTab]
        });
    };
}

export { AuthDataService };
