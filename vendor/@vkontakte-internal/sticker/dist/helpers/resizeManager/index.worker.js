import { resize } from './resize';
onmessage = async ({ data: { id, ...options } }) => {
    let blob = null;
    try {
        blob = await resize(options);
    }
    catch { }
    const message = {
        id,
        blob,
    };
    postMessage(message, undefined);
};
//# sourceMappingURL=index.worker.js.map