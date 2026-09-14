/**
 * Максимальное кол-во разных реакций на одном сообщении
 */
export const MAX_MESSAGE_REACTIONS_COUNT = 16;
export function resolveId(id) {
    if (Number.isNaN(id) || !id) {
        id = 0;
    }
    return id;
}
//# sourceMappingURL=Reaction.js.map