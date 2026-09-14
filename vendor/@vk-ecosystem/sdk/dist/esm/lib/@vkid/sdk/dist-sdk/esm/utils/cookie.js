const COOKIE_EXPIRES_TIME_1_YEAR = 31_536_000_000;
function setExtIdCookie(value) {
    if (!value) {
        return;
    }
    try {
        const expireTime = new Date(new Date().getTime() + COOKIE_EXPIRES_TIME_1_YEAR).toUTCString();
        const allowedDomain = location.host.split('.').slice(-2).join('.');
        document.cookie = [
            `vkidExtId=${encodeURIComponent(value || '')}`,
            `expires=${expireTime}`,
            'path=/',
            `domain=.${allowedDomain}`,
            'SameSite=Strict',
            'Secure'
        ].join('; ');
    } catch (e) {}
}

export { setExtIdCookie };
