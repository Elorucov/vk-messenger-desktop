export function createUnsubscribes() {
    let subscriptions = [];
    const add = (...unsubscribes) => {
        subscriptions.push(...unsubscribes);
    };
    const clear = () => {
        subscriptions.forEach((unsubscribe) => unsubscribe());
        subscriptions = [];
    };
    return {
        add,
        clear,
    };
}
//# sourceMappingURL=serviceUnsubscribers.js.map