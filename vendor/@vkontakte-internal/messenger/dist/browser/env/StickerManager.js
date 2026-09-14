import { isRetina } from '@vkontakte/vkjs';
import { getRandomInt } from '../../core/utils/misc';
const STICKER_SIZE = 64;
const LIKE_SIZE = 20;
const MAX_STICKER_PER_FRAME = 8;
const MIN_ROTATE_DEGREE = 0;
const MAX_ROTATE_DEGREE = 4;
function getIcon20LikeCircleFillRed() {
    return {
        icon: `<svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><linearGradient id="like_circle_fill_red_20__a" gradientUnits="userSpaceOnUse" x1="-10" x2="10" y1="10" y2="30"><stop offset="0" stop-color="#ff5263"/><stop offset="1" stop-color="#ff3347"/></linearGradient><path d="M0 10a10 10 0 1 1 20 0 10 10 0 0 1-20 0z" fill="url(#like_circle_fill_red_20__a)"/><path d="M12.2 6.5c1.55 0 2.8 1.2 2.8 2.7 0 1.5-.63 2.24-3.28 4.23l-1.2.9a.86.86 0 0 1-1.03 0l-1.21-.9C5.63 11.44 5 10.69 5 9.19 5 7.7 6.25 6.5 7.8 6.5c.83 0 1.55.4 2.2 1.15.65-.75 1.37-1.15 2.2-1.15z" fill="#fff"/></svg>`,
        name: 'like_circle_fill_red_20',
    };
}
/**
 * https://gitlab.mvk.com/vkcom/vkcom/-/blob/master/static/js/modules/web/videoview/StickerManager.ts
 */
export class StickerManager {
    stickers = [];
    ctx = null;
    rAF = null;
    canvasWidth = 0;
    canvasHeight = 0;
    stickerStartX = 0;
    likeStartX = 0;
    startY = 0;
    endY = STICKER_SIZE / 2;
    isRendering = false;
    scaleRatio = 1;
    canvas = null;
    initialized = false;
    constructor() {
        this.init = this.init.bind(this);
    }
    init(canvas) {
        if (!canvas || this.initialized) {
            return;
        }
        this.initialized = true;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.stickerStartX = (this.canvasWidth - STICKER_SIZE) / 2;
        this.likeStartX = 20;
        this.startY = this.canvasHeight - STICKER_SIZE;
        if (this.ctx && isRetina()) {
            this.scaleRatio = window.devicePixelRatio || 1;
            this.ctx.canvas.width = this.canvasWidth * this.scaleRatio;
            this.ctx.canvas.height = this.canvasHeight * this.scaleRatio;
            this.ctx.canvas.style.width = `${this.canvasWidth}px`;
            this.ctx.canvas.style.height = `${this.canvasHeight}px`;
            this.ctx.scale(this.scaleRatio, this.scaleRatio);
        }
    }
    add(sticker) {
        if (this.stickers.length > MAX_STICKER_PER_FRAME) {
            return;
        }
        const isLike = sticker === 'like';
        const img = new Image();
        img.onload = () => {
            this.stickers.push({
                img,
                id: isLike ? 1 : sticker.id,
                x: isLike ? this.likeStartX : this.stickerStartX,
                y: isLike ? this.startY - 60 : this.startY,
                isLike,
                startTime: Date.now() + getRandomInt(0, 600),
                speed: getRandomInt(2, 3),
                size: isLike ? LIKE_SIZE : STICKER_SIZE,
                scale: isLike ? 2 : 1,
                opacity: isLike ? 0.8 : 0,
                rotateDegree: getRandomInt(MIN_ROTATE_DEGREE, MAX_ROTATE_DEGREE),
                rotateDirection: Math.random() < 0.5 ? -1 : 1,
            });
            this.drawNextFrame();
        };
        if (isLike) {
            img.src =
                'data:image/svg+xml; charset=utf8, ' +
                    encodeURIComponent(getIcon20LikeCircleFillRed().icon);
        }
        else {
            img.src = isRetina() ? sticker.photo_128 : sticker.photo_64;
        }
    }
    animate = () => {
        if (!this.ctx) {
            return;
        }
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.canvasWidth * this.scaleRatio, this.canvasHeight * this.scaleRatio);
        this.stickers = this.stickers.filter((sticker) => sticker.y > this.endY);
        this.stickers.forEach((sticker) => {
            this.drawSticker(sticker);
        });
        this.isRendering = false;
        if (this.stickers.some((s) => s.y > this.endY)) {
            this.drawNextFrame();
        }
        else {
            this.ctx.resetTransform();
            this.ctx.clearRect(0, 0, this.canvasWidth * this.scaleRatio, this.canvasHeight * this.scaleRatio);
        }
    };
    drawSticker(sticker) {
        if (sticker.startTime > Date.now() || !this.ctx) {
            return;
        }
        if (sticker.isLike) {
            sticker.scale = 2;
        }
        if (sticker.y <= this.startY && sticker.y >= this.startY - 25) {
            const newOpacity = sticker.opacity + 0.15;
            sticker.opacity = Math.min(newOpacity, 1);
            if (!sticker.isLike) {
                const newScale = sticker.scale + 0.04;
                sticker.scale = Math.min(newScale, 1);
            }
        }
        else if (sticker.y >= this.endY && sticker.y <= this.endY + 25) {
            const newOpacity = sticker.opacity - 0.15;
            sticker.opacity = Math.max(newOpacity, 0);
        }
        const scaledSize = sticker.size * sticker.scale;
        const newX = sticker.scale === 1
            ? sticker.x
            : sticker.x + (sticker.size - scaledSize) / 2;
        sticker.rotateDegree += 0.1 * sticker.rotateDirection;
        if (sticker.rotateDegree < MIN_ROTATE_DEGREE) {
            sticker.rotateDegree = MIN_ROTATE_DEGREE;
            sticker.rotateDirection *= -1;
        }
        else if (sticker.rotateDegree > MAX_ROTATE_DEGREE) {
            sticker.rotateDegree = MAX_ROTATE_DEGREE;
            sticker.rotateDirection *= -1;
        }
        sticker.y -= sticker.speed;
        if (this.ctx) {
            this.ctx.globalAlpha = sticker.opacity;
        }
        this.ctx.setTransform(sticker.scale, 0, 0, sticker.scale, newX, sticker.y); // sets scale and origin
        this.ctx.rotate((sticker.rotateDegree * Math.PI) / 180);
        this.ctx.drawImage(sticker.img, newX, sticker.y);
        if (this.ctx) {
            this.ctx.globalAlpha = 1;
        }
    }
    drawNextFrame() {
        if (!this.isRendering) {
            this.isRendering = true;
            this.rAF = requestAnimationFrame(this.animate);
        }
    }
    destroy() {
        this.initialized = false;
        this.canvas = null;
        if (this.rAF) {
            cancelAnimationFrame(this.rAF);
            this.rAF = null;
        }
    }
}
//# sourceMappingURL=StickerManager.js.map