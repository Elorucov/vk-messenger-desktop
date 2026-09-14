import { useCallback, useRef } from 'react';
export function useScaleImage() {
    const $canvas = useRef(null);
    const getScaledImage = useCallback(({ img, width, height, dx, dy, scale, density = 1, format = 'png', quality = 1, }) => {
        return new Promise((resolve) => {
            const canvas = $canvas.current;
            if (!canvas) {
                return resolve(null);
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return resolve(null);
            }
            canvas.width = width * density;
            canvas.height = height * density;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width * density, height * density);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, dx * density, dy * density, img.width * density * scale, img.height * density * scale);
            canvas.toBlob((blob) => resolve(blob), 'image/' + format, quality);
        });
    }, []);
    return {
        canvasRef: $canvas,
        getScaledImage,
    };
}
//# sourceMappingURL=useScaleImage.js.map