/**
 * Функция перезагружает ресурс сбрасывая локальный кеш.
 * @param src адрес ресурса.
 * @returns промис, который завершается вместе с перезагрузкой ресурса.
 */
export async function reloadResource(src) {
    // eslint-disable-next-line no-restricted-globals
    await fetch(src, { cache: 'reload', mode: 'no-cors' });
    return;
}
//# sourceMappingURL=reloadResource.js.map