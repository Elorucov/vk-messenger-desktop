import { formatDuration } from '@vkontakte/vkjs';
export const getExtendedBadgeText = ({ size, isInteractive, isUpcoming, badgeText, duration, noExtendedBadge, }) => {
    const formattedDuration = duration ? formatDuration(duration) : '';
    if (size === 's' && isInteractive) {
        return formattedDuration;
    }
    if ((size === 'm' && isUpcoming) || noExtendedBadge) {
        return badgeText || '';
    }
    return [badgeText, formattedDuration].filter(Boolean).join(' · ');
};
//# sourceMappingURL=getExtendedBadgeText.js.map