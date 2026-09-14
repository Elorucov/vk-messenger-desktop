import { API_ERROR_AUTH_VALIDATION, API_ERROR_CAPTCHA, API_ERROR_NEED_CONFIRMATION } from '@vkontakte-internal/api-schema-typescript';
import { VKError } from './vk';
export class APIError extends VKError {
    constructor(options) {
        const code = Number(options.error_code);
        const message = `Code №${code} - ${options.error_msg}`;
        super({ code, message });
        this.params = options.request_params;
        if (code === API_ERROR_CAPTCHA) {
            this.captchaSid = Number(options.captcha_sid);
            this.captchaImg = options.captcha_img;
        }
        switch (code) {
            case API_ERROR_CAPTCHA:
                this.captchaSid = Number(options.captcha_sid);
                this.captchaImg = options.captcha_img;
                break;
            case API_ERROR_AUTH_VALIDATION:
                this.redirectUri = options.redirect_uri;
                break;
            case API_ERROR_NEED_CONFIRMATION:
                this.confirmationText = options.confirmation_text;
                break;
        }
    }
}
//# sourceMappingURL=api.js.map