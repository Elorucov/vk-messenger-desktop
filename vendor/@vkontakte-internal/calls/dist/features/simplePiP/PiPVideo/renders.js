import { createVideoTag } from '../../../helpers/video';
export function downloadImage(src) {
    let resolve;
    const promise = new Promise((r) => {
        resolve = r;
    });
    const downloadedImg = new Image();
    downloadedImg.crossOrigin = 'anonymous';
    downloadedImg.addEventListener('load', () => {
        resolve(downloadedImg);
    }, false);
    downloadedImg.alt = 'avatar';
    downloadedImg.src = src;
    return promise;
}
function getSizesOfCanvas(ctx) {
    return { width: ctx.canvas.width, height: ctx.canvas.height };
}
export function drawAvatar(img) {
    return (ctx) => {
        const { width, height } = getSizesOfCanvas(ctx);
        const grad = ctx.createRadialGradient(width / 2, height / 2, 5, width / 2, height / 2, width * 0.7);
        grad.addColorStop(0.4, '#38304c');
        grad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        if (img) {
            const sizeImg = Math.floor(width * 0.4);
            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, sizeImg / 2, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(img, width / 2 - sizeImg / 2, height / 2 - sizeImg / 2, sizeImg, sizeImg);
            ctx.restore();
        }
    };
}
function roundedImage(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
let localVideo;
function safePlay(videoElement) {
    videoElement.load();
    function playOnLoad() {
        videoElement.play();
        videoElement.removeEventListener('loadedmetadata', playOnLoad);
    }
    videoElement.addEventListener('loadedmetadata', playOnLoad);
}
export function drawSelfPreview(decorateFn, localStream, withFlip = false) {
    if (!localStream) {
        return decorateFn;
    }
    if (localVideo) {
        localVideo.srcObject = localStream;
    }
    else {
        localVideo = createVideoTag(localStream);
    }
    safePlay(localVideo);
    return (ctx, pipCanvas) => {
        decorateFn(ctx, pipCanvas);
        const sizesOfCanvas = getSizesOfCanvas(ctx);
        const { videoWidth, videoHeight } = localVideo;
        // Размер превью должен быть 30% от минимального измерения канваса
        const rectSize = Math.floor(Math.min(sizesOfCanvas.width, sizesOfCanvas.height) * 0.3);
        // Рассчитываем размер и позицию, чтобы видео было квадратным и центрированным
        const minSize = Math.min(videoWidth, videoHeight);
        const sWidth = minSize;
        const sHeight = minSize;
        const sx = (videoWidth - minSize) / 2;
        const sy = (videoHeight - minSize) / 2;
        // Координаты, где должно быть нарисовано превью на канвасе
        const dx = sizesOfCanvas.width - rectSize - 10;
        const dy = 10;
        ctx.save();
        // беру 10% округление от размера квадрата превью
        roundedImage(ctx, dx, dy, rectSize, rectSize, Math.floor(rectSize * 0.1));
        ctx.clip();
        ctx.translate(dx + rectSize / 2, dy + rectSize / 2);
        if (withFlip) {
            // Отражаем контекст горизонтально и настраиваем координаты для отзеркаливания видео
            ctx.scale(-1, 1); // Отзеркаливание по горизонтали
        }
        ctx.translate(-rectSize / 2, -rectSize / 2);
        ctx.drawImage(localVideo, sx, sy, sWidth, sHeight, 0, 0, rectSize, rectSize);
        ctx.restore();
    };
}
let mainVideo;
export function drawVideo(mainStream, withFlip = false, objectFit = 'cover') {
    if (mainVideo) {
        mainVideo.srcObject = mainStream;
    }
    else {
        mainVideo = createVideoTag(mainStream);
    }
    safePlay(mainVideo);
    return (ctx) => {
        const canvas = getSizesOfCanvas(ctx);
        const { videoWidth, videoHeight } = mainVideo;
        let scale = Math.max(canvas.width / videoWidth, canvas.height / videoHeight);
        if (objectFit === 'contain') {
            scale = Math.min(canvas.width / videoWidth, canvas.height / videoHeight);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        const x = canvas.width / 2 - (videoWidth / 2) * scale;
        const y = canvas.height / 2 - (videoHeight / 2) * scale;
        if (withFlip) {
            ctx.save(); // Сохраняем текущее состояние контекста
            // Перемещаем начальную точку координат в центр канваса и отражаем по горизонтали
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(mainVideo, x, y, videoWidth * scale, videoHeight * scale);
            ctx.restore(); // Восстанавливаем исходное состояние контекста
        }
        else {
            ctx.drawImage(mainVideo, x, y, videoWidth * scale, videoHeight * scale);
        }
    };
}
export function drawVideoSuspendReason(message, drawAvatar) {
    return (ctx, pipCanvas) => {
        if (!message) {
            drawAvatar?.(ctx, pipCanvas);
            return;
        }
        const { width, height } = getSizesOfCanvas(ctx);
        const padding = Math.round(width / 20);
        const availableWidth = width - padding * 2;
        const fontSize = Math.round(height / 20);
        ctx.clearRect(0, 0, width, height);
        drawAvatar?.(ctx, pipCanvas);
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `${fontSize}px Arial, sans-serif`;
        const textMetrics = ctx.measureText(message);
        ctx.fillText(message, width / 2, textMetrics.fontBoundingBoxAscent, availableWidth);
        ctx.restore();
    };
}
//# sourceMappingURL=renders.js.map