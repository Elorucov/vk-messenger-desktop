export function calculateThumbStyles(scrollOffset, croppedSize, contentSize, barSize) {
    const positionRatio = scrollOffset / (contentSize - croppedSize);
    const sizeRatio = croppedSize / contentSize;
    let size = Math.max(~~(sizeRatio * croppedSize), barSize.min);
    if (barSize.max) {
        size = Math.min(size, barSize.max);
    }
    const position = ~~((croppedSize - size) * positionRatio);
    return {
        size,
        position,
    };
}
