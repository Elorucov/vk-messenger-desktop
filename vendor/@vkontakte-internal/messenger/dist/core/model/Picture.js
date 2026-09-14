/**
 * Очищает baseUrl изображения от параметра размера
 */
export function getClearBaseUrl(url) {
    if (!url) {
        return;
    }
    const urlObject = new URL(url);
    urlObject.searchParams.delete('cs');
    return decodeURIComponent(urlObject.toString());
}
//# sourceMappingURL=Picture.js.map