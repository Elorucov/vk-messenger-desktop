const VK_ME_DOMAIN = 'web.vk.me';
export function getHostName(isSferum = false, useCurrentDomainName = false) {
    if (isSferum) {
        if (useCurrentDomainName) {
            const currentDomain = window.location.host;
            if (currentDomain === VK_ME_DOMAIN) {
                return VK_ME_DOMAIN;
            }
            return `${currentDomain}/reforged.php#`;
        }
        return VK_ME_DOMAIN;
    }
    const regEx = /\.?([^.]+\.[^.]+)$/;
    /**
     * Берем только домены первого и второго уровней
     * (актуально для web.vk.*)
     */
    const host = window.location.host.match(regEx)?.[1];
    if (host && /^vk\.(com|ru)$/.test(host)) {
        return host;
    }
    return 'vk.com';
}
export function getCDNLink(imgName, bucketVersion = 1) {
    return `https://st.mycdn.me/static/misc/0-0-${bucketVersion}/${imgName}`;
}
//# sourceMappingURL=url.js.map