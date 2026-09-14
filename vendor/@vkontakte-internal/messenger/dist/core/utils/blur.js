export function blurImage(image, width, height, radius) {
    if (radius > Math.floor(Math.min(width, height) / 2)) {
        throw new Error('Радиус блюра не может быть больше половины мннимальной стороны изображения');
    }
    const redIn = new Uint8Array(width * height);
    const greenIn = new Uint8Array(width * height);
    const blueIn = new Uint8Array(width * height);
    for (let i = 0; i < width * height * 4; i += 4) {
        const r = image[i];
        const g = image[i + 1];
        const b = image[i + 2];
        if (r === undefined || g === undefined || b === undefined) {
            throw new Error('Wrong index access');
        }
        redIn[i / 4] = r;
        greenIn[i / 4] = g;
        blueIn[i / 4] = b;
    }
    blurGaussian(redIn, width, height, radius);
    blurGaussian(greenIn, width, height, radius);
    blurGaussian(blueIn, width, height, radius);
    for (let i = 0; i < width * height * 4; i += 4) {
        const r = redIn[i / 4];
        const g = greenIn[i / 4];
        const b = blueIn[i / 4];
        if (r === undefined || g === undefined || b === undefined) {
            throw new Error('Wrong index access');
        }
        image[i] = r;
        image[i + 1] = g;
        image[i + 2] = b;
    }
}
export function blurGaussian(source, width, height, radius) {
    const target = new Uint8Array(source);
    boxBlurDirection(target, source, width, height, radius, true);
    boxBlurDirection(source, target, width, height, radius, false);
    source.set(target);
}
function boxBlurDirection(source, target, width, height, radius, isCross) {
    const multiplier = 1.0 / (2 * radius + 1);
    let outerSize, inSize, targetMult, step, oppositeMult;
    if (isCross === false) {
        outerSize = height;
        inSize = width;
        targetMult = width;
        step = 1;
        oppositeMult = 1;
    }
    else {
        outerSize = width;
        inSize = height;
        targetMult = 1;
        step = width;
        oppositeMult = height;
    }
    for (let mainIndex = 0; mainIndex < outerSize; mainIndex++) {
        let targetIndex = mainIndex * targetMult;
        let startIndex = targetIndex;
        let endIndex = targetIndex + radius * step;
        const targetValue = source[targetIndex];
        const oppositeTargetValue = source[targetIndex + width * oppositeMult - step];
        if (targetValue === undefined || oppositeTargetValue === undefined) {
            throw new Error('Wrong index access');
        }
        let resValue = (radius + 1) * targetValue;
        for (let delta = 0; delta < radius; delta++) {
            const value = source[targetIndex + delta * step];
            if (value === undefined) {
                throw new Error('Wrong index access');
            }
            resValue += value;
        }
        for (let delta = 0; delta < inSize; delta++) {
            if (delta <= radius) {
                const endValue = source[endIndex];
                if (endValue === undefined) {
                    throw new Error('Wrong index access');
                }
                resValue += endValue - targetValue;
                endIndex += step;
            }
            else if (delta < inSize - radius) {
                const startValue = source[startIndex];
                const endValue = source[endIndex];
                if (startValue === undefined || endValue === undefined) {
                    throw new Error('Wrong index access');
                }
                resValue += endValue - startValue;
                startIndex += step;
                endIndex += step;
            }
            else {
                const startValue = source[startIndex];
                if (startValue === undefined) {
                    throw new Error('Wrong index access');
                }
                resValue += oppositeTargetValue - startValue;
                startIndex += step;
            }
            target[targetIndex] = Math.floor(resValue * multiplier);
            targetIndex += step;
        }
    }
}
//# sourceMappingURL=blur.js.map