// Значение является числом
function isNumberHandler(value) {
    return typeof value === 'number';
}
// Значение является строкой
function isStringHandler(value) {
    return typeof value === 'string';
}
// Значение обязательно
function isRequiredHandler(value) {
    return value !== undefined && value !== '' && value !== null;
}
// Значение является либо числом, либо строкой
function isNumberOrStringHandler(value) {
    return isNumberHandler(value) || isStringHandler(value);
}
// Значение является функцией
function isFunctionHandler(value) {
    return typeof value === 'function';
}

export { isFunctionHandler, isNumberHandler, isNumberOrStringHandler, isRequiredHandler, isStringHandler };
