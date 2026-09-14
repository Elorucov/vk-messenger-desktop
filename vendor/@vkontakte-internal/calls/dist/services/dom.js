export function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = resolve;
        image.onerror = reject;
    });
}
//# sourceMappingURL=dom.js.map