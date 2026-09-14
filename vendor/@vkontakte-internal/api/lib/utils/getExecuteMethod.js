import { getExecuteParams } from './getExecuteParams';
export function getExecuteMethod(method, params = {}) {
    return `API.${method}(${getExecuteParams(params)})`;
}
//# sourceMappingURL=getExecuteMethod.js.map