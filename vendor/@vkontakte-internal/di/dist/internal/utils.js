import { useEffect, useRef } from 'react';
export function shallowCompare(prevProps, nextProps) {
    const prevPropsEntries = Object.entries(prevProps);
    const nextPropsEntries = Object.entries(nextProps);
    return (prevPropsEntries.length === nextPropsEntries.length &&
        prevPropsEntries.every(([key, prop]) => Object.is(prop, nextProps[key])));
}
export function useMemoizeProps(props, equalityCheck = shallowCompare) {
    const ref = useRef(undefined);
    if (ref.current === undefined || !equalityCheck(ref.current, props)) {
        ref.current = props;
    }
    return [ref.current];
}
export function usePostponedEffect(fn, deps) {
    const firstCall = useRef(true);
    useEffect(() => {
        if (!firstCall.current) {
            return fn();
        }
        else {
            firstCall.current = false;
        }
    }, deps);
}
/**
 * Утверждает, что тип значения `never`
 *
 * Должно использоваться для случаев, когда нужно убедиться в обработке всех возможных значений `value`
 *
 * @throws {TypeError} если вызывается во время выполнения
 */
export function expectNever(value) {
    throw new TypeError(`Unexpected value: ${value}`);
}
//# sourceMappingURL=utils.js.map