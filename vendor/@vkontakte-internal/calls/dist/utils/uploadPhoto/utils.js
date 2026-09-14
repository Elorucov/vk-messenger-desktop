export function getImageSize(url) {
    return new Promise(function (resolve, reject) {
        const newImg = new Image();
        newImg.onload = function () {
            const height = Number(newImg.height);
            const width = Number(newImg.width);
            resolve([width, height]);
        };
        newImg.onerror = reject;
        newImg.onabort = reject;
        newImg.src = url;
    });
}
export function getImageSizeByBlob(file) {
    return getImageSize(URL.createObjectURL(file));
}
//# sourceMappingURL=utils.js.map