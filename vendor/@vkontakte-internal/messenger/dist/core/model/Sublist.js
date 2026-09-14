export function empty() {
    return [];
}
export function isSublistIncludeConvo(sublist, convo) {
    return ((convo.peerFlags & sublist.filter.and) ^ sublist.filter.xor) === 0;
}
export function refresh(sublists, convo) {
    for (const sublist of sublists) {
        const isIncluded = sublist.peerIds.has(convo.peerId);
        const shouldInclude = isSublistIncludeConvo(sublist, convo);
        if (isIncluded && !shouldInclude) {
            sublist.peerIds.delete(convo.peerId);
        }
        if (!isIncluded && shouldInclude) {
            sublist.peerIds.add(convo.peerId);
        }
    }
}
export function getPeerIds(sublists) {
    const peerIds = [];
    for (const sublist of sublists) {
        peerIds.push(...Array.from(sublist.peerIds));
    }
    return new Set(peerIds);
}
//# sourceMappingURL=Sublist.js.map