import { API_ERROR_AUTH, API_ERROR_CAPTCHA, API_ERROR_TOO_MANY } from '@vkontakte-internal/api-schema-typescript';
import { APIWorker } from './worker';
import { APIError } from '../errors/api';
import { ExecuteError } from '../errors/execute';
import { wait } from '../utils/wait';
import { CaptchaType, MINIMUM_TIME_INTERVAL_API } from '../constants';
export class SequentialWorker extends APIWorker {
    async execute(request) {
        request ||= this.queue.shift();
        if (!request) {
            return;
        }
        const { method } = request;
        let response;
        try {
            response = await request.make();
        }
        catch (error) {
            const { options } = this.api;
            if (request.retries === options.limit) {
                request.captchaValidate?.reject(error);
                request.reject(error);
                return;
            }
            request.retries += 1;
            await wait(options.wait);
            this.requeue(request);
            return;
        }
        if (response.error !== undefined) {
            this.handleError(request, new APIError(response.error));
            return;
        }
        request.captchaValidate?.resolve();
        if (method.startsWith('execute')) {
            request.resolve({
                response: response.response,
                errors: (response.execute_errors || []).map((error) => new ExecuteError(error))
            });
            return;
        }
        request.resolve(response.response ?? response);
    }
    /**
     * Обработчик ошибок
     */
    async handleError(request, error) {
        const { code } = error;
        const { options } = this.api;
        if (request.retries === options.limit) {
            request.reject(error);
            return;
        }
        request.retries += 1;
        if (code === API_ERROR_TOO_MANY) {
            if (this.paused) {
                this.requeue(request);
                return;
            }
            this.pause();
            await wait(MINIMUM_TIME_INTERVAL_API);
            this.requeue(request);
            this.resume();
            return;
        }
        request.captchaValidate?.reject(error);
        request.tokenRegenerateValidate?.reject(error);
        if (code === API_ERROR_CAPTCHA && this.api.hasCaptchaHandler) {
            try {
                const { captchaSid } = error;
                const { key, validate } = await this.api.processingCaptcha({
                    type: CaptchaType.API,
                    src: error.captchaImg,
                    sid: captchaSid,
                    request
                });
                request.captchaValidate = validate;
                request.params.captcha_sid = captchaSid;
                request.params.captcha_key = key;
                this.requeue(request);
            }
            catch (error) {
                request.reject(error);
            }
            return;
        }
        if (code === API_ERROR_AUTH && this.api.hasTokenRegenerateHandler) {
            try {
                const { token, validate } = await this.api.processingTokenRegenerate();
                this.api.options.token = token;
                request.tokenRegenerateValidate = validate;
                await wait(MINIMUM_TIME_INTERVAL_API);
                this.requeue(request);
            }
            catch (error) {
                request.reject(error);
            }
            return;
        }
        request.reject(error);
    }
}
//# sourceMappingURL=sequential.js.map