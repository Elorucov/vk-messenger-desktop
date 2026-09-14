/** проверяет, что `value` равен любому из `inArgs` */
export const hasIn = (value, ...inArgs) => {
    return inArgs.includes(value);
};
/** проверяем, пустой ли объект */
export const isEmpty = (value) => {
    const type = typeof value;
    switch (type) {
        case 'boolean':
        case 'string':
        case 'undefined':
        case 'number':
            return !value;
        case 'function':
        case 'bigint':
        case 'symbol':
            return true;
        case 'object':
            if (value === null) {
                return false;
            }
            if (Array.isArray(value)) {
                return !value.length;
            }
            // @ts-expect-error TS2769: No overload matches this call.
            return !Object.keys(value).length;
    }
};
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export const objectFilter = (obj, callback) => {
    const result = [];
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        if (callback(obj[key])) {
            result.push(obj[key]);
        }
    }
    return result;
};
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export const objectMap = (obj, callback) => {
    const result = [];
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        result.push(callback(obj[key], key));
    }
    return result;
};
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export const objectReduce = (obj, callback, initialValue) => {
    let currentValue = initialValue;
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        currentValue = callback(currentValue, obj[key], key);
    }
    return currentValue;
};
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export const objectForEach = (obj, callback) => {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        callback(obj[key], key);
    }
};
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export function objectSome(obj, callback) {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        if (callback(obj[key], key)) {
            return true;
        }
    }
    return false;
}
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export function objectFind(obj, callback) {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        if (callback(obj[key], key)) {
            return obj[key];
        }
    }
}
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const noop = (...args) => { };
export const capitalize = (str) => {
    if (!str.length) {
        return '';
    }
    return str.charAt(0)?.toLocaleUpperCase() + str.slice(1);
};
export const shorten = (str, maxLen) => {
    if (str.length <= maxLen) {
        return str;
    }
    return str
        .slice(0, Math.max(maxLen - 3, 0))
        .trim()
        .concat('...');
};
export const getCallable = (value) => {
    return typeof value === 'function' ? value() : value;
};
/**
 * @description Selects an index in the specified array using the binary search algorithm.
 *  The evaluator receives an element and determines whether the desired index
 *  is before, at, or after it
 * @param compareFn Evaluator function that receives 2 arguments (the element and the index).
 *  Should return a negative number, zero, or a positive number
 *  depending on whether the desired index is before, at, or after the
 *  element passed to it.
 * @returns index of the search key, if it is contained in the array
 *  otherwise, <tt>(-(<i>insertion point</i>) - 1)</tt>.
 *  The <i>insertion point</i> is defined as the point at which the
 *  key would be inserted into the array
 */
export function binarySearch(arr, compareFn) {
    let min = 0;
    let max = arr.length;
    let found = false;
    while (min < max) {
        const middle = Math.floor((min + max) / 2);
        const result = compareFn(arr[middle], middle);
        if (result > 0) {
            min = middle + 1;
        }
        else {
            max = middle;
            found = !result;
        }
    }
    return found ? min : ~min;
}
export const isBoolean = (value) => {
    return typeof value === 'boolean';
};
/**
 * проверяет, что `x` больше или равен `min` или меньше или равен `max`
 * @param inclusive - включать `min` и `max` в сравнение, по-умолчанию `true`;
 */
export const minmax = (x, min, max, inclusive = true) => {
    if (!inclusive) {
        return x > min && x < max;
    }
    return x >= min && x <= max;
};
export const anyMatchInArray = (source, _target) => {
    if (!source || !_target) {
        return false;
    }
    const target = Array.isArray(_target) ? _target : [_target];
    if (!source.length && !target.length) {
        return true;
    }
    if (source.length && !target.length) {
        return false;
    }
    const set = new Set(source);
    return target.every((value) => set.has(value));
};
export const isArraysEqual = (source, target) => {
    if (!source && !target) {
        return true;
    }
    else if (!source || !target) {
        return false;
    }
    return source.length === target.length && source.every((element, index) => element === target[index]);
};
/** вернет последний элемент массива или `undefined` */
export const last = (arr) => {
    if (!arr.length) {
        return undefined;
    }
    return arr[arr.length - 1];
};
export const deepClone = (source) => {
    return Array.isArray(source)
        ? source.map((item) => deepClone(item))
        : source instanceof Date
            ? new Date(source.getTime())
            : source && typeof source === 'object'
                ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
                    const propDesc = Object.getOwnPropertyDescriptor(source, prop);
                    propDesc && Object.defineProperty(o, prop, propDesc);
                    o[prop] = deepClone(source[prop]);
                    return o;
                }, Object.create(Object.getPrototypeOf(source)))
                : source;
};
export const shuffle = (array) => {
    const length = array.length;
    const shuffled = array.slice();
    let index = -1;
    while (++index < length) {
        const rand = Math.floor(Math.random() * length);
        const value = shuffled[rand];
        shuffled[rand] = shuffled[index];
        shuffled[index] = value;
    }
    return shuffled;
};
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export const createTimeout = (fn, delay) => {
    const t = setTimeout(fn, delay);
    return () => clearTimeout(t);
};
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export const createImmediate = (fn) => {
    setTimeout(fn, 0);
};
/** возвращает `value`, если `check == true`, в противном случае возвращает `undefined` */
export function vou(check, value) {
    return check ? value : undefined;
}
export function is(state, value) {
    return (state & value) === value;
}
/** маппер побитовых значений для ключей */
export function createFlags(keys) {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */
    const result = {};
    for (let i = 0; i < keys.length; ++i) {
        result[keys[i]] = 1 << i;
    }
    return result;
}
/** вычисляет значение переданных флагов по словарю */
export function calcFlags(flags, permissions) {
    return objectReduce(permissions, (acc, value, flag) => (value ? acc | flags[flag] : acc), 0);
}
/** вычисляет значение переданных флагов по массиву */
export function calcFlagsArray(flags, permissions) {
    return permissions.reduce((acc, flag) => acc | flags[flag], 0);
}
//# sourceMappingURL=index.js.map