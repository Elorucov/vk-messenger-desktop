import { CommonErrorReasons } from '../common/errors.js';
import { isRequiredHandler, isFunctionHandler, isNumberHandler } from '../validator/validationRuleHandlers.js';
import { Validator } from '../validator/validator.js';

const requestSuperAppTokenHandlerValidator = new Validator({
    handler: [
        {
            rule: isRequiredHandler,
            errorText: CommonErrorReasons.validationIsRequired('handler')
        },
        {
            rule: isFunctionHandler,
            errorText: CommonErrorReasons.validationIsFunction('handler')
        }
    ]
});
const authHandlerValidator = new Validator({
    handler: [
        {
            rule: isRequiredHandler,
            errorText: CommonErrorReasons.validationIsRequired('handler')
        },
        {
            rule: isFunctionHandler,
            errorText: CommonErrorReasons.validationIsFunction('handler')
        }
    ]
});
const logoutHandlerValidator = new Validator({
    handler: [
        {
            rule: isRequiredHandler,
            errorText: CommonErrorReasons.validationIsRequired('handler')
        },
        {
            rule: isFunctionHandler,
            errorText: CommonErrorReasons.validationIsFunction('handler')
        }
    ]
});
const appIdValidator = new Validator({
    appId: [
        {
            rule: isNumberHandler,
            errorText: CommonErrorReasons.validationIsNumber('appId')
        }
    ]
});

export { appIdValidator, authHandlerValidator, logoutHandlerValidator, requestSuperAppTokenHandlerValidator };
