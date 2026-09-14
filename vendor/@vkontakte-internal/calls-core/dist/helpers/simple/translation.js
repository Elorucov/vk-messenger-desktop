export const updateBroadcastId = (editStreamingResponse, broadcastId) => {
    if (editStreamingResponse && editStreamingResponse.access_key) {
        const broadcastIdArr = broadcastId?.split('_');
        if (broadcastIdArr && broadcastIdArr.length > 0) {
            broadcastIdArr[2] = editStreamingResponse.access_key;
            return broadcastIdArr.join('_');
        }
    }
    return broadcastId;
};
//# sourceMappingURL=translation.js.map