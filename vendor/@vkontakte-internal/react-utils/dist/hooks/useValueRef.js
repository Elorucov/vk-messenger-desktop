import { useRef } from 'react';
/**
 * Возвращает Ref, только для чтения, с всегда актуальным значением, переданным в аргументе
 *
 * Полезно для эффектов размонтирования
 */
export function useValueRef(value) {
    const ref = useRef(value);
    ref.current = value;
    return ref;
}
//# sourceMappingURL=useValueRef.js.map