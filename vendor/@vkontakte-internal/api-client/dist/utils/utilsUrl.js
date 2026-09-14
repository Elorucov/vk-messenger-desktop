import { CUA_STATE_PARAM, CUA_SESSION_PARAM } from '../modules/CUA/constants';
const PARAMS_TO_FILTER_IF_EMPTY = [CUA_STATE_PARAM, CUA_SESSION_PARAM];
export function makeParams(params) {
    const pairs = Object.keys(params)
        .map((key) => {
        let param = params[key];
        key = encodeURIComponent(key || '');
        param = encodeURIComponent(param === undefined ? '' : param);
        if (PARAMS_TO_FILTER_IF_EMPTY.includes(key) && !param) {
            return null;
        }
        return `${key}=${param}`;
    })
        .filter(Boolean);
    return pairs.join('&');
}
export function toFormData(data) {
    const formData = new FormData();
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            typeof data[key] === 'string'
                ? formData.append(key, data[key])
                : formData.append(key, JSON.stringify(data[key]));
        }
    }
    return formData;
}
export function corsRequest(url, params, options = {}) {
    const paramsString = makeParams(params);
    // eslint-disable-next-line no-restricted-globals
    return fetch(url, {
        method: 'POST',
        body: paramsString,
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        ...options,
    });
}
//# sourceMappingURL=utilsUrl.js.map