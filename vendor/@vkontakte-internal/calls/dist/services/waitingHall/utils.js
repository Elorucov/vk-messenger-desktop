export function groupIdsOnToLoadAndExisted(externalIds, members) {
    return externalIds.reduce(([peerIdsToLoad, peerIdsExisted], { id }) => {
        const peerId = id;
        if (members.has(peerId)) {
            peerIdsExisted.push(peerId);
        }
        else {
            peerIdsToLoad.push(peerId);
        }
        return [peerIdsToLoad, peerIdsExisted];
    }, [[], []]);
}
//# sourceMappingURL=utils.js.map