import { VKError, SharedErrorCode } from '../errors/vk';
export class CallbackService {
    /**
     * Проверка наличия обработчика капчи
     */
    get hasCaptchaHandler() {
        return this.captchaHandler !== undefined;
    }
    /**
     * Установить обработчик капчи
     */
    onCaptcha(handler) {
        this.captchaHandler = handler;
        return this;
    }
    /**
     * Обработка капчи
     */
    processingCaptcha(payload) {
        const { captchaHandler } = this;
        if (!captchaHandler) {
            return Promise.reject(new VKError({
                code: SharedErrorCode.MISSING_CAPTCHA_HANDLER,
                message: 'Missing captcha handler'
            }));
        }
        return new Promise((resolveProcessing, rejectProcessing) => {
            captchaHandler(payload, (key) => new Promise((resolve, reject) => {
                if (key instanceof Error) {
                    reject(key);
                    rejectProcessing(key);
                    return;
                }
                resolveProcessing({
                    key,
                    validate: {
                        resolve,
                        reject
                    }
                });
            }));
        });
    }
    /**
     * Проверка наличия регенератора токена
     */
    get hasTokenRegenerateHandler() {
        return this.tokenRegenerateHandler !== undefined;
    }
    /**
     * Установить регенератор токена
     */
    onTokenRegenerate(handler) {
        this.tokenRegenerateHandler = handler;
        return this;
    }
    /**
     * Обработка регенерации токена
     */
    processingTokenRegenerate() {
        const { tokenRegenerateHandler } = this;
        if (tokenRegenerateHandler === undefined) {
            return Promise.reject(new VKError({
                code: SharedErrorCode.MISSING_TOKEN_REGENERATE_HANDLER,
                message: 'Missing token regenerate handler'
            }));
        }
        return new Promise((resolveProcessing, rejectProcessing) => {
            tokenRegenerateHandler((token) => new Promise((resolve, reject) => {
                if (token instanceof Error) {
                    reject(token);
                    rejectProcessing(token);
                    return;
                }
                resolveProcessing({
                    token,
                    validate: {
                        resolve,
                        reject
                    }
                });
            }));
        });
    }
}
//# sourceMappingURL=callbackService.js.map