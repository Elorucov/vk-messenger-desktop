/**
 * @deprecated - используется только для старых лайков в каналах
 */
export function resolveId(id) {
    if (Number.isNaN(id) || !id) {
        id = 0;
    }
    return id;
}
//# sourceMappingURL=ReactionOld.js.map