export const getWaitingHall = (state) => state.waitingHall;
export const getWaitingHallHasNew = (state) => {
    const waitingHall = getWaitingHall(state);
    return Boolean(waitingHall && waitingHall.members.size !== 0 && waitingHall.hasNew);
};
//# sourceMappingURL=waitingHall.js.map