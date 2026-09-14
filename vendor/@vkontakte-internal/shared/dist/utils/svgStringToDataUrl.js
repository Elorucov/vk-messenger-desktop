export function svgStringToDataUrl(svgString) {
    const uint8Array = new TextEncoder().encode(svgString);
    const base64String = arrayBufferToBase64(uint8Array.buffer);
    return `data:image/svg+xml;base64,${base64String}`;
}
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
/**
 * Функция для преобразования ArrayBuffer в base64
 */
function arrayBufferToBase64(buffer) {
    const binary = new Uint8Array(buffer);
    let base64 = '';
    let byte1;
    let byte2;
    let byte3;
    let enc1;
    let enc2;
    let enc3;
    let enc4;
    let i = 0;
    while (i < binary.length) {
        byte1 = binary[i++];
        byte2 = binary[i++];
        byte3 = binary[i++];
        enc1 = byte1 >> 2;
        enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
        enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
        enc4 = byte3 & 63;
        if (isNaN(byte2)) {
            enc3 = enc4 = 64;
        }
        else if (isNaN(byte3)) {
            enc4 = 64;
        }
        base64 += CHARS.charAt(enc1) + CHARS.charAt(enc2) + CHARS.charAt(enc3) + CHARS.charAt(enc4);
    }
    return base64;
}
//# sourceMappingURL=svgStringToDataUrl.js.map