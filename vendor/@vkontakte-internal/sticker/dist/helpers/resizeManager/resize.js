import { EmptyCanvasContextError, EmptyCanvasError, EmptyImageDataError } from './errors';
export async function resize({ x, y, url, type, width, image, canvas, height, quality }) {
    const data = image ||
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax, no-restricted-globals
        (await fetch(url)
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .then((response) => response.blob())
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .then(createImageBitmap));
    URL.revokeObjectURL(url);
    if (!data) {
        throw new EmptyImageDataError();
    }
    const context = canvas.getContext('2d');
    if (!context) {
        throw new EmptyCanvasContextError();
    }
    if ('drawImage' in context) {
        context.drawImage(data, x, y, width, height);
    }
    const outputType = `image/${type}`;
    // eslint-disable-next-line no-restricted-globals
    if (self.OffscreenCanvas !== undefined && canvas instanceof OffscreenCanvas) {
        return canvas.convertToBlob({
            type: outputType,
            quality,
        });
    }
    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return reject(new EmptyCanvasError());
            }
            resolve(blob);
        }, outputType, quality);
    });
}
//# sourceMappingURL=resize.js.map