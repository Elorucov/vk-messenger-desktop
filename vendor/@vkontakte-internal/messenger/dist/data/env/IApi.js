/** Конец секции репортов */
export var IApi;
(function (IApi) {
    /**
     * Возвращает идентификатор, который можно использовать
     * для аборта запросов или трекинга их прогресса.
     */
    function resolveTrackId(method, tracker) {
        if (tracker.length === 0) {
            throw new Error('Нельзя отдавать пустую строку в IApi.resolveTrackId');
        }
        return `${method}-${tracker}`;
    }
    IApi.resolveTrackId = resolveTrackId;
    class AuthError extends Error {
        constructor(message) {
            super(message);
            Object.setPrototypeOf(this, AuthError.prototype);
        }
    }
    IApi.AuthError = AuthError;
    class TimeoutError extends Error {
        constructor(message) {
            super(message);
            Object.setPrototypeOf(this, TimeoutError.prototype);
        }
    }
    IApi.TimeoutError = TimeoutError;
    class AbortError extends Error {
        constructor(message) {
            super(message);
            Object.setPrototypeOf(this, AbortError.prototype);
        }
    }
    IApi.AbortError = AbortError;
    class RequestError extends Error {
        code;
        apiError;
        subcode;
        text;
        constructor(code, message, apiError, subcode, text) {
            super(message);
            this.code = code;
            this.apiError = apiError;
            this.subcode = subcode;
            this.text = text;
            Object.setPrototypeOf(this, RequestError.prototype);
        }
    }
    IApi.RequestError = RequestError;
    class ExecuteErrors extends Error {
        list;
        response;
        constructor(list, 
        /**
         * Поле использовать не желательно, сделано временно для покрытия одно случая
         * Обработка ошибок будет переделана в https://jira.mvk.com/browse/ME-49603
         * @deprecated
         */
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        response) {
            super(list[0].message);
            this.list = list;
            this.response = response;
            Object.setPrototypeOf(this, ExecuteErrors.prototype);
        }
    }
    IApi.ExecuteErrors = ExecuteErrors;
    function isCaptchaData(errorData) {
        const { captcha_sid, captcha_img, captcha_type, is_refresh_enabled } = errorData;
        return (typeof captcha_sid === 'string' &&
            typeof captcha_img === 'string' &&
            (typeof captcha_type === 'undefined' ||
                typeof captcha_type === 'string') &&
            (typeof is_refresh_enabled === 'undefined' ||
                typeof is_refresh_enabled === 'boolean'));
    }
    IApi.isCaptchaData = isCaptchaData;
    function isCuaData(errorData) {
        const { cua_session } = errorData;
        return typeof cua_session === 'string';
    }
    IApi.isCuaData = isCuaData;
})(IApi || (IApi = {}));
/**
 * Subcode ошибки для 2fa сообщений сообществ
 */
export const COMMUNITY_ADMIN_NEED_2FA = 1169;
//# sourceMappingURL=IApi.js.map