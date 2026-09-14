import { getVoiceRoomPromotionRequestsState } from '../simple';
export const getVoiceRoomPromotionRequests = (state) => {
    const { profiles, requests } = getVoiceRoomPromotionRequestsState(state);
    const requestsList = Object.entries(profiles).reduce((acc, [profileId, profile]) => {
        const request = requests[profileId];
        if (request) {
            const { externalId, timestamp } = request;
            acc.push({ profile, externalId, timestamp });
        }
        return acc;
    }, []);
    return requestsList.sort(({ timestamp: timestampA }, { timestamp: timestampB }) => timestampA > timestampB ? 1 : -1);
};
//# sourceMappingURL=promotionRequests.js.map