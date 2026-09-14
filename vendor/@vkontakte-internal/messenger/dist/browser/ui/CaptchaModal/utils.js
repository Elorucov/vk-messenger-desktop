import { CLIENT_ID, STATIC_BASE_URL } from '../../../core/config/config';
// Взято из vk.com
export function getCaptchaLink({ sid, hash, type, isRefresh, swapCount, isFirst, captchaImage, captchaTrack, deviceId, }) {
    const withHash = hash ? `&v=${hash}` : '';
    const withRefresh = isRefresh ? '&refresh=1' : '';
    const withSwapType = !isRefresh && swapCount > 0 ? '&swap_type=1' : '';
    const first = isFirst ? '&first=1' : '';
    const appId = CLIENT_ID;
    switch (type) {
        case 'image': {
            let base = '';
            if (captchaImage) {
                const captchaImageParams = new URLSearchParams(captchaImage);
                if (!captchaImageParams.has('device_id')) {
                    base = `${captchaImage}&resized=1&width=400&app_id=${appId}&device_id=${deviceId}`;
                }
                else if (captchaImageParams.has('device_id') &&
                    !!captchaImageParams.get('device_id')) {
                    base = `${captchaImage}&s=1&width=400&resized=1`;
                }
                else {
                    base = `${captchaImage.replace('device_id=', `device_id=${deviceId}`)}&s=1&width=400&resized=1`;
                }
            }
            else {
                base = `${STATIC_BASE_URL}/captcha.php?sid=${sid}&s=1&resized=1&width=400&app_id=${appId}&device_id=${deviceId}`;
            }
            return `${base}${withHash}${withRefresh}${withSwapType}${first}`;
        }
        case 'audio': {
            let base = '';
            if (captchaTrack) {
                const captchaTrackParams = new URLSearchParams(captchaTrack);
                if (!captchaTrackParams.has('device_id')) {
                    base = `${captchaTrack}&app_id=${appId}&device_id=${deviceId}`;
                }
                else if (captchaTrackParams.has('device_id') &&
                    !!captchaTrackParams.get('device_id')) {
                    base = `${captchaTrack}`;
                }
                else {
                    base = `${captchaTrack.replace('device_id=', `device_id=${deviceId}`)}`;
                }
            }
            else {
                base = `${STATIC_BASE_URL}/sound_captcha.php?act=get&captcha_sid=${sid}&app_id=${appId}&device_id=${deviceId}`;
            }
            return `${base}${withHash}${withRefresh}${withSwapType}${first}`;
        }
        default:
            return '';
    }
}
//# sourceMappingURL=utils.js.map