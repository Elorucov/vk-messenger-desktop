/**
 * Возвращает полный ID в виде строки формата `${ownerId}_${id}`
 */
export function getIdentityRawId({ id, ownerId }) {
    return `${ownerId}_${id}`;
}
/**
 * Возвращает полный ID в виде строки формата `${ownerId}_${id}`
 */
export function getIdentityRawIdOrUndefined({ id, ownerId }) {
    if (id === undefined || ownerId === undefined) {
        return undefined;
    }
    return `${ownerId}_${id}`;
}
/**
 * Возвращает полный ID в виде строки формата `${ownerId}_${id}` или `${ownerId}_${id}_${accessKey}`
 */
export function getIdentityAccessRawId(data) {
    const { accessKey } = data;
    const rawId = getIdentityRawId(data);
    if (accessKey) {
        return `${rawId}_${accessKey}`;
    }
    return rawId;
}
//# sourceMappingURL=getIdentityRawId.js.map