import { clamp } from './clamp';
export const DEFAULT_PIXEL_RATIO = 1;
export const PIXEL_RATIO = typeof window !== 'undefined' ? Math.ceil(clamp(window.devicePixelRatio, 1, 2)) : DEFAULT_PIXEL_RATIO;
//# sourceMappingURL=pixelRatio.js.map