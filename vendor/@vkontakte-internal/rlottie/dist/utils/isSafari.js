import { userAgent } from './userAgent';
export const isSafari = 'safari' in globalThis ||
    (userAgent &&
        (/\b(iPad|iPhone|iPod)\b/.test(userAgent) || (userAgent.match('Safari') && !userAgent.match('Chrome'))));
//# sourceMappingURL=isSafari.js.map