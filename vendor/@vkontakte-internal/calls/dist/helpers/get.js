import { isObjectLike, isArray, isString } from '@vkontakte/vkjs';
/** а-ля `lodash.get` */
export const get = (key, value) => {
    if (!isString(key) && !isArray(key)) {
        return undefined;
    }
    const _keys = isArray(key) ? key : key.split('.').filter(Boolean);
    const last = _keys.length - 1;
    let curr = value;
    for (let i = 0; i < _keys.length; i += 1) {
        if (!isObjectLike(curr)) {
            return undefined;
        }
        const _curr = curr[_keys[i]];
        if (!_curr) {
            return undefined;
        }
        if (i === last) {
            return _curr;
        }
        curr = _curr;
    }
};
//# sourceMappingURL=get.js.map