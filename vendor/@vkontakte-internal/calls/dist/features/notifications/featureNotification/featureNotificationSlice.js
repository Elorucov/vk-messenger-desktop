import { E_ACTION } from '../../../constants';
export const initialFeatureNotificationState = {
    shownTypes: new Set(),
};
export const setFeatureNotification = (data) => ({
    type: E_ACTION.SET_FEATURE_NOTIFICATION,
    data,
});
export const getFeatureNotificationType = (state) => state.featureNotification.type;
export const getFeatureNotificationWasShown = (state, type) => state.featureNotification.shownTypes.has(type);
export function featureNotificationReducer(state = initialFeatureNotificationState, action) {
    switch (action.type) {
        case E_ACTION.SET_FEATURE_NOTIFICATION: {
            let nextShownTypes = state.shownTypes;
            const nextType = action.data;
            if (nextType) {
                nextShownTypes = new Set([...nextShownTypes, nextType]);
            }
            return {
                ...state,
                type: nextType,
                shownTypes: nextShownTypes,
            };
        }
        default:
            return state;
    }
}
//# sourceMappingURL=featureNotificationSlice.js.map