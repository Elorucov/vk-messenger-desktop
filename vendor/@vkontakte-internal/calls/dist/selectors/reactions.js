export const getReactionsIcons = (state) => state.reactions?.reactions;
export const getReactionsHistory = (state) => state.reactions?.feedbackHistory;
export const getReactionsHistoryState = (state) => {
    const history = getReactionsHistory(state);
    const historyValues = Object.values(history || {});
    const total = historyValues.length;
    const userIds = [];
    const reactionsKeysMap = {};
    historyValues.forEach((historyValue) => {
        const { key: reactionKey, peerId } = historyValue;
        if (!reactionsKeysMap[reactionKey]) {
            reactionsKeysMap[reactionKey] = new Set();
        }
        userIds.push(peerId);
        reactionsKeysMap[reactionKey].add(peerId);
    });
    const popularReactions = Object.entries(reactionsKeysMap)
        .sort((a, b) => {
        const aSize = a[1].size;
        const bSize = b[1].size;
        return aSize > bSize ? -1 : 1;
    })
        .slice(0, 3)
        .map((item) => item[0]);
    return {
        total,
        reactionsKeysMap,
        userIds,
        popularReactions,
    };
};
//# sourceMappingURL=reactions.js.map