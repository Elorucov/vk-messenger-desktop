export const createVmojiPreview = ({ image, width, height }) => {
    let src = '';
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.pointerEvents = 'none';
    canvas.style.visibility = 'hidden';
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d');
    if (context && image) {
        context.putImageData(image, 0, 0);
        src = canvas.toDataURL();
    }
    canvas.remove();
    return src;
};
//# sourceMappingURL=utils.js.map