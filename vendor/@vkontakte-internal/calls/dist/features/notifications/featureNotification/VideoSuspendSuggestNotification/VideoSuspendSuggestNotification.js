import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"dangerouslySetInnerHTML":1}]} */
import { useCallback } from 'react';
import { useLang } from '../../../../hooks/useLang';
import { FeatureNotification } from '../FeatureNotification';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useControlledState } from '../../../../components/CallsBanner';
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { useVideoSuspendSuggestNotificationModel, VideoSuspendSuggestNotificationProvider, } from './VideoSuspendSuggestNotificationModel';
const VideoSuspendSuggestNotification = observer(function VideoSuspendSuggestNotification() {
    const { getLang } = useLang();
    const { enableAutoMode } = useVideoSuspendSuggestNotificationModel();
    const [isOpen, toggleBanner] = useControlledState();
    // У вас плохая сеть. Можно временно скрыть видео участников, чтобы снизить нагрузку и оставаться в звонке.
    const title = getLang('calls_video_suspend_suggest_ntf_title');
    // Управлять режимом можно в настройках:<br>Настройки → Учитывать состояние сети
    const text = _jsx("span", { dangerouslySetInnerHTML: { __html: getLang('calls_video_suspend_suggest_ntf_hint') } });
    const handleClick = useCallback(() => {
        enableAutoMode();
        toggleBanner(false);
    }, [enableAutoMode]);
    return (_jsx(FeatureNotification, { actions: _jsx(Button, { mode: "secondary", appearance: "overlay", onClick: handleClick, children: getLang('calls_video_suspend_suggest_action') }), autoDismissDelay: 60000, header: title, isOpen: isOpen, onDismiss: toggleBanner, text: text }));
});
export const VideoSuspendSuggestNotificationWidget = createWidget(VideoSuspendSuggestNotificationProvider, VideoSuspendSuggestNotification);
//# sourceMappingURL=VideoSuspendSuggestNotification.js.map