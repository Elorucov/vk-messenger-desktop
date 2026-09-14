import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { OnboardingFeature } from '@vkontakte-internal/calls-core';
import { OnboardingBanner } from './components';
import { OnboardingNotificationModelProvider, useOnboardingNotificationModel, } from './OnboardingNotificationModel';
const OnboardingNotification = observer(function OnboardingNotification() {
    const { closeOnboardingBanner, onboardingFeature, toggleAsrPopup, isMeCanManageAsr, asr: asrState, onOpenWatchTogetherFeature, onOpenVmojiFeature, onStartSubtitlesFeature, } = useOnboardingNotificationModel();
    // Показываем кнопку запуска расшифровки, если пункт меню доступен и расшифровка не запущена
    const isStartAsrBtnShown = isMeCanManageAsr && !asrState;
    let onPrimaryClick;
    let onSecondaryClick;
    let setHtmlSubtitle = false;
    switch (onboardingFeature) {
        case OnboardingFeature.WATCH_TOGETHER: {
            onPrimaryClick = onOpenWatchTogetherFeature;
            break;
        }
        case OnboardingFeature.REACTIONS: {
            // Пока нет экшенов для запуска фичей
            break;
        }
        case OnboardingFeature.VMOJI: {
            onPrimaryClick = onOpenVmojiFeature;
            break;
        }
        case OnboardingFeature.ASR: {
            onPrimaryClick = onStartSubtitlesFeature;
            if (isStartAsrBtnShown) {
                onSecondaryClick = toggleAsrPopup;
            }
            setHtmlSubtitle = true;
            break;
        }
    }
    return (_jsx(OnboardingBanner, { featureType: onboardingFeature, onClose: closeOnboardingBanner, onPrimaryClick: onPrimaryClick, onSecondaryClick: onSecondaryClick, setHtmlSubtitle: setHtmlSubtitle }));
});
export const OnboardingNotificationWidget = createWidget(OnboardingNotificationModelProvider, OnboardingNotification);
//# sourceMappingURL=OnboardingNotificationWidget.js.map