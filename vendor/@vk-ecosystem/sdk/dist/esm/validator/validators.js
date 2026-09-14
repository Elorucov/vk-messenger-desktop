import { CommonErrorReasons } from '../common/errors.js';
import { isStringHandler, isRequiredHandler, isNumberOrStringHandler } from './validationRuleHandlers.js';
import { Validator } from './validator.js';

const tokenValidator = new Validator({
    token: [
        {
            rule: isStringHandler,
            errorText: CommonErrorReasons.validationIsString('token')
        }
    ]
});
const onOffValidator = new Validator({
    event: [
        {
            rule: isStringHandler,
            errorText: CommonErrorReasons.validationIsString('event')
        },
        {
            rule: isRequiredHandler,
            errorText: CommonErrorReasons.validationIsRequired('event')
        }
    ],
    handler: [
        {
            rule: isRequiredHandler,
            errorText: CommonErrorReasons.validationIsRequired('handler')
        }
    ]
});
const miniAppParamsValidator = new Validator({
    app: [
        {
            rule: isNumberOrStringHandler,
            errorText: CommonErrorReasons.validationIsNumberOrString('app')
        },
        {
            rule: isRequiredHandler,
            errorText: CommonErrorReasons.validationIsRequired('app')
        }
    ]
});
const messageRequirementValidator = new Validator({
    message: [
        {
            rule: isRequiredHandler,
            errorText: CommonErrorReasons.validationIsRequired('message')
        }
    ]
});

export { messageRequirementValidator, miniAppParamsValidator, onOffValidator, tokenValidator };
