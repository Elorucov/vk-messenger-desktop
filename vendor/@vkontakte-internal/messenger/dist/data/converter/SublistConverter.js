export function fromApiSublist(sublist) {
    return {
        type: sublist.type,
        filter: sublist.filter,
        name: sublist.name,
        description: sublist.description,
        peerIds: new Set(),
    };
}
//# sourceMappingURL=SublistConverter.js.map