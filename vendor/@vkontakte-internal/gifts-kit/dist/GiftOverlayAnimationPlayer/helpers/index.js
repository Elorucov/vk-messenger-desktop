export function getRandomString(length = 6) {
    const source = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const result = [];
    for (let i = 0; i < length; i++) {
        result.push(source.charAt(Math.floor(Math.random() * source.length)));
    }
    return result.join('');
}
//# sourceMappingURL=index.js.map