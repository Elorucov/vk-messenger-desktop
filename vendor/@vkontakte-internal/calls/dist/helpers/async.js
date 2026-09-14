export function inParallel(callbacks, max) {
    return new Promise((res) => {
        let index = 0;
        let finished = 0;
        const results = [];
        const tick = async () => {
            const cIndex = index++;
            const [result] = await Promise.allSettled([callbacks[cIndex]()]);
            results[cIndex] = result;
            finished++;
            if (finished === callbacks.length) {
                res(results);
            }
            else if (index < callbacks.length) {
                tick();
            }
        };
        Array.from({ length: Math.min(callbacks.length, max) }).forEach(() => {
            tick();
        });
    });
}
//# sourceMappingURL=async.js.map