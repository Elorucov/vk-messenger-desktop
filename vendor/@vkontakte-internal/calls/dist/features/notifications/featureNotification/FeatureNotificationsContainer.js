import { jsx as _jsx } from "react/jsx-runtime";
import { AsrEndedNotification } from './AsrEndedNotification';
import { AsrEndedNotificationForOwner } from './AsrEndedNotificationForOwner';
import { AsrStartedNotificationWidget } from './AsrStartedNotificationWidget';
import { RecordEndedNotification } from './RecordEndedNotification';
import { VideoSuspendAppliedNotification } from './VideoSuspendAppliedNotification';
import { VideoSuspendSuggestNotification } from './VideoSuspendSuggestNotification';
import { FeatureNotification } from '@vkontakte-internal/calls-core';
export const FeatureNotificationsContainer = ({ featureNotification, }) => {
    switch (featureNotification) {
        case FeatureNotification.RecordEnded: {
            return _jsx(RecordEndedNotification, {});
        }
        case FeatureNotification.AsrEndedForOwner: {
            return _jsx(AsrEndedNotificationForOwner, {});
        }
        case FeatureNotification.AsrEnded: {
            return _jsx(AsrEndedNotification, {});
        }
        case FeatureNotification.AsrStarted: {
            return _jsx(AsrStartedNotificationWidget, {});
        }
        case FeatureNotification.VideoSuspendApplied: {
            return _jsx(VideoSuspendAppliedNotification, {});
        }
        case FeatureNotification.VideoSuspendSuggest: {
            return _jsx(VideoSuspendSuggestNotification, {});
        }
        default: {
            return null;
        }
    }
};
//# sourceMappingURL=FeatureNotificationsContainer.js.map