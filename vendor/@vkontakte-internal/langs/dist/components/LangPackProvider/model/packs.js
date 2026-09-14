import { lang } from './domain.js';
const getDomain = (hostname) => {
    if (!hostname) {
        return `https://${location.hostname}`;
    }
    if (hostname.startsWith('http')) {
        return hostname;
    }
    return `https://${hostname}`;
};
export const loadPack = async ({ name, lang, domain, cacheAge = 600, }) => {
    const url = new URL('/js/lang-pack.js', getDomain(domain));
    url.searchParams.set('name', name);
    url.searchParams.set('format', 'json');
    url.searchParams.set('cache_age', String(cacheAge));
    if (lang !== undefined) {
        url.searchParams.set('lang', String(lang));
    }
    // eslint-disable-next-line no-restricted-globals
    const response = await fetch(String(url));
    return await response.json();
};
export const loadPackFx = lang.createEffect(async ({ id, name, lang, domain, cacheAge = 600 }) => {
    const pack = await loadPack({ name, lang, domain, cacheAge });
    return {
        id,
        pack,
    };
});
export const $packs = lang.createStore({}).on(loadPackFx.doneData, (state, { id, pack }) => ({
    ...state,
    [id]: pack,
}));
//# sourceMappingURL=packs.js.map