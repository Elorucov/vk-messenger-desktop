import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { useUnavailableSchedule } from '../../ui/SettingsSchedule/useUnavailableSchedule';
import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/ComposerMentionUnavailabilityText/ComposerMentionUnavailabilityText.css';
export const ComposerMentionUnavailabilityText = ({ peer, }) => {
    const { lang } = useBrowserEnv();
    const unavailableScheduleData = useUnavailableSchedule(peer);
    if (!unavailableScheduleData.enable) {
        return null;
    }
    const translation = lang.use('me_mention_suggestion_schedule_message', {
        sex: Peer.sex(peer),
        values: {
            time: unavailableScheduleData.time,
            day: unavailableScheduleData.day,
        },
    });
    return (React.createElement("span", { className: "MentionSuggestion__scheduleMessage", title: translation },
        React.createElement("span", { className: "MentionSuggestion__scheduleMessageWrapper" }, translation)));
};
//# sourceMappingURL=ComposerMentionUnavailabilityText.js.map