import { makeValidateError, makeLegacyError } from '../errors/errors.js';

const defaultErrorText = 'Parameter validation error';
class ValidationResult {
    errorText;
    params;
    valid;
    constructor(errorText = defaultErrorText, params, valid){
        this.errorText = errorText;
        this.params = params;
        this.valid = valid;
    }
    isValid() {
        return Boolean(this.valid);
    }
    error(isLegacy) {
        return !this.isValid() ? !isLegacy ? makeValidateError(this.errorText, this.params) : makeLegacyError(makeValidateError(this.errorText, this.params)) : null;
    }
}
class Validator {
    rules;
    constructor(rules){
        this.rules = rules;
    }
    validate(params) {
        for(let key in this.rules){
            if (this.rules.hasOwnProperty(key)) {
                for(let i = 0; i < this.rules[key].length; i++){
                    const rule = this.rules[key][i];
                    if (!rule.rule(params[key])) {
                        return new ValidationResult(rule.errorText, params, false);
                    }
                }
            }
        }
        return new ValidationResult('', params, true);
    }
}

export { Validator };
