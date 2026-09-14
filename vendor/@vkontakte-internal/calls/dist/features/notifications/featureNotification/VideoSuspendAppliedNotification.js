import { jsx as _jsx } from "react/jsx-runtime";
import { useLang } from '../../../hooks/useLang';
import { FeatureNotification } from './FeatureNotification';
export const VideoSuspendAppliedNotification = () => {
    const { getLang } = useLang();
    // Видео некоторых участников скрыто: у вас нестабильное соединение
    const title = getLang('calls_video_suspended_ntf_title');
    // Это поможет вам снизить нагрузку на сеть и оставаться в звонке
    const text = getLang('calls_video_suspended_ntf_hint');
    return _jsx(FeatureNotification, { autoDismissDelay: 60000, header: title, text: text });
};
//# sourceMappingURL=VideoSuspendAppliedNotification.js.map