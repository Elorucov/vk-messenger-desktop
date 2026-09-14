export function cx(classnames) {
    let result = [];
    classnames.forEach((item) => {
        if (!item) {
            return;
        }
        switch (typeof item) {
            case 'string':
                result.push(item);
                break;
            case 'object':
                Object.keys(item).forEach((key) => {
                    if (item[key]) {
                        result.push(key);
                    }
                });
                break;
            default:
                result.push(`${item}`);
        }
    });
    return result.join(' ');
}
export function mapToDataAttributes(object) {
    const dataAttributes = {};
    Object.keys(object).forEach((key) => {
        dataAttributes[`data-${key}`] = object[key];
    });
    return dataAttributes;
}
export function sanitizeUrl(url) {
    if (!url) {
        return '';
    }
    const sanitized = url
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    return /* @elephizeTypecast string */ sanitized;
}
//# sourceMappingURL=helpers.js.map