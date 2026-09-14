export function getExecuteParams(params) {
    return JSON.stringify(params, (key, value) => typeof value === 'object' && value !== params ? String(value) : value);
}
//# sourceMappingURL=getExecuteParams.js.map