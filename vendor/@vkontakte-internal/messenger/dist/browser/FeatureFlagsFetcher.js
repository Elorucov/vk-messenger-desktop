import { DEFAULT_FEATURE_FLAGS } from '../core/config/featureFlags';
export class FeatureFlagsFetcher {
    api;
    constructor(api) {
        this.api = api;
    }
    parse(apiToggles) {
        try {
            const flags = {};
            for (const toggle of apiToggles.toggles) {
                if (toggle.enabled && toggle.value) {
                    try {
                        const parsed = JSON.parse(toggle.value);
                        flags[toggle.name] = parsed;
                    }
                    catch {
                        // В случае, если парсинг сфелился, просто оставим дефолтное значение
                    }
                }
                else {
                    flags[toggle.name] = toggle.enabled;
                }
            }
            // TODO: Специальный оверрайд для существующих ручек с префиксом me_.
            // Нужно удалить, как только мы все их уберем.
            for (const toggle of apiToggles.toggles) {
                if (!toggle.name.startsWith('vkm_')) {
                    continue;
                }
                const mappedName = `me_${toggle.name.slice(4)}`;
                if (toggle.enabled && toggle.value) {
                    try {
                        const parsed = JSON.parse(toggle.value);
                        flags[mappedName] = parsed;
                    }
                    catch {
                        // В случае, если парсинг сфелился, просто оставим дефолтное значение
                    }
                }
                else {
                    flags[mappedName] = toggle.enabled;
                }
            }
            return {
                ...DEFAULT_FEATURE_FLAGS,
                ...flags,
            };
        }
        catch {
            return DEFAULT_FEATURE_FLAGS;
        }
    }
    fromPreload(apiToggles) {
        return this.parse(apiToggles);
    }
    async fromApi() {
        try {
            const res = await this.api.fetch('account.getTogglesExternal', {
                toggles: Object.keys(DEFAULT_FEATURE_FLAGS)
                    .map((key) => {
                    // TODO: Специальный оверрайд для существующих ручек с префиксом me_.
                    // Нужно удалить, как только мы все их уберем.
                    if (key.startsWith('me_')) {
                        return `vkm_${key.slice(3)}`;
                    }
                    else {
                        return key;
                    }
                })
                    .join(','),
            }, { retries: 1, usePrefetch: true });
            return this.parse(res);
        }
        catch {
            return DEFAULT_FEATURE_FLAGS;
        }
    }
}
//# sourceMappingURL=FeatureFlagsFetcher.js.map