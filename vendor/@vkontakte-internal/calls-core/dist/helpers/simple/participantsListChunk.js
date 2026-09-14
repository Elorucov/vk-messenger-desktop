/**
 * @param index a list index
 * @param self should we substract or add local device to the index
 */
export function countLocalDeviceForIndex(index, self) {
    return Math.max(index + self, 0);
}
export function getCountNotLoadedDevicesBeforeForList(participantsChunk) {
    if (participantsChunk) {
        const countBefore = participantsChunk.countBefore ?? 0;
        // Current local device always first so
        // we should not forget count it
        return countBefore ? countLocalDeviceForIndex(countBefore, 1) : countBefore;
    }
    return 0;
}
//# sourceMappingURL=participantsListChunk.js.map