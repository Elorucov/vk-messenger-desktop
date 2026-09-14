let fastRafCallbacks;
export function fastRequestAnimationFrame(callback) {
    if (!fastRafCallbacks) {
        fastRafCallbacks = [callback];
        requestAnimationFrame((...args) => {
            if (!fastRafCallbacks) {
                return;
            }
            const currentCallbacks = fastRafCallbacks;
            fastRafCallbacks = undefined;
            currentCallbacks.forEach((callback) => callback(...args));
        });
        return;
    }
    fastRafCallbacks.push(callback);
}
//# sourceMappingURL=fastRequestAnimationFrame.js.map