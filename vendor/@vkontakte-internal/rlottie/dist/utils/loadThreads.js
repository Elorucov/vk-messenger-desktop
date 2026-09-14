import { asyncImportLoader } from '@vkontakte/vkjs';
export function loadThreads() {
    return asyncImportLoader(async () => {
        const { EsThread, Transfer } = await import(/* webpackChunkName: "threads-es" */ 'threads-es');
        return { EsThread, Transfer };
    });
}
//# sourceMappingURL=loadThreads.js.map