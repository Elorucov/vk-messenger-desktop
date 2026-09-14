export const getValidSize = ({ size, maxViewportSize, isSidesSwapped, }) => {
    let { w: width, h: height } = size;
    const ratio = width / height;
    const isLandscape = width > height;
    if (isLandscape) {
        width = Math.min(width, maxViewportSize.w);
        height = width / ratio;
    }
    else {
        height = Math.min(height, maxViewportSize.h);
        width = height * ratio;
    }
    return {
        w: isSidesSwapped ? Math.floor(height) : Math.floor(width),
        h: isSidesSwapped ? Math.floor(width) : Math.floor(height),
    };
};
export const getSizeSwapped = ({ size, isSidesSwapped, }) => {
    return {
        w: isSidesSwapped ? size.h : size.w,
        h: isSidesSwapped ? size.w : size.h,
    };
};
//# sourceMappingURL=utils.js.map