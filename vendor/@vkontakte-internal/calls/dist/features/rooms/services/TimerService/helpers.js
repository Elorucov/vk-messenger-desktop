import { leadingZero } from '@vkontakte/vkjs';
function formatDiffDuration(diff) {
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    const formattedHours = leadingZero(hours);
    const formattedMinutes = leadingZero(minutes);
    const formattedSeconds = leadingZero(seconds);
    return hours > 0
        ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
        : `${formattedMinutes}:${formattedSeconds}`;
}
export function calculateTimeLeft(ts) {
    const diff = Math.max(0, Math.floor((ts - Date.now()) / 1000));
    if (diff === 0) {
        return {
            timeString: '00:00',
            shouldSetWarning: true,
            timeFinished: true,
        };
    }
    return {
        timeString: formatDiffDuration(diff),
        shouldSetWarning: diff < 60,
        timeFinished: diff <= 0,
    };
}
//# sourceMappingURL=helpers.js.map