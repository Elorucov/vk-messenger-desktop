export function readBlobAsText(blob) {
    return readBlobAs(blob, 'readAsText');
}
function readBlobAs(blob, method) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', ({ target }) => {
            resolve(target?.result);
        });
        reader[method](blob);
    });
}
//# sourceMappingURL=readBlobAs.js.map