let lastConfig = {
    domain: 'api.vk.com',
    maxRetries: 10,
    grouping: true,
};
export function getApiConfig() {
    return lastConfig;
}
export function setApiConfig(config) {
    config = Object.assign({}, lastConfig, config);
    lastConfig = config;
}
//# sourceMappingURL=config.js.map