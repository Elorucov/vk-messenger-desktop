/**
 * Возвращает текущие время в микросекундах как строку
 */
export function getCurrentMicroseconds() {
    const strTime = Date.now().toString(10);
    return strTime + '000';
}
//# sourceMappingURL=time.js.map