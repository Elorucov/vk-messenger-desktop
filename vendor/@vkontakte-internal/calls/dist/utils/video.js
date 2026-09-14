import { WEEK } from '../helpers/date';
export const getTimeLabel = (video, getLang) => {
    let startTime = video.date;
    if (video.live_start_time) {
        startTime = video.live_start_time;
    }
    const diff = startTime - Date.now() / 1000;
    if (diff > 0 && diff < WEEK) {
        return getLang('calls_translation_date_label_soon');
    }
    return '';
};
export const getVideoStartTime = (video, langShortDateTime) => {
    let startTime = video.date;
    if (video.live_start_time) {
        startTime = video.live_start_time;
    }
    return langShortDateTime(startTime * 1000);
};
export const getUserName = (userId, upcomingVideoOwnerNames, selectedOwner) => {
    if (userId > 0) {
        const filteredArray = upcomingVideoOwnerNames.filter((user) => {
            return user.id == userId;
        });
        if (filteredArray.length > 0) {
            const user = filteredArray[0];
            if (user) {
                return user.name;
            }
        }
    }
    else {
        return selectedOwner.name;
    }
    return '';
};
//# sourceMappingURL=video.js.map