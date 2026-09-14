import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { createWidget } from '@vkontakte-internal/di';
import { AppearanceProvider, Appearance } from '@vkontakte-internal/vkcom-kit';
import { observer } from 'mobx-react-lite';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getWaitingHall, getWaitingHallHasNew } from '../../selectors';
import { FeatureNotificationsContainer, getFeatureNotificationType } from './featureNotification';
import { OnboardingNotificationWidget } from '../onboarding';
import { WaitingHallNotificationWidget } from '../waitingHall';
import styles from './NotificationsWidget.module.css';
import { NotificationsModelProvider, useNotificationsModel } from './NotificationsModel';
import { AdminMessagesWidget } from '../adminMessages';
export const NotificationsView = observer(() => {
    const { shouldShowAdminMessages, isOnboardingBannerOpen, onboardingFeatureType: onboardingFeature, closeOnboardingBanner, } = useNotificationsModel();
    const waitingHall = useTypedSelector(getWaitingHall);
    const waitingHallHasNew = useTypedSelector(getWaitingHallHasNew);
    const featureNotification = useTypedSelector(getFeatureNotificationType);
    if (shouldShowAdminMessages) {
        return _jsx(AdminMessagesWidget, {});
    }
    let ntfElement;
    if (waitingHall && waitingHallHasNew) {
        ntfElement = _jsx(WaitingHallNotificationWidget, { waitingHall: waitingHall });
    }
    else if (featureNotification) {
        ntfElement = _jsx(FeatureNotificationsContainer, { featureNotification: featureNotification });
    }
    else if (onboardingFeature && isOnboardingBannerOpen) {
        ntfElement = (_jsx(OnboardingNotificationWidget, { closeOnboardingBanner: closeOnboardingBanner, onboardingFeature: onboardingFeature }));
    }
    return (ntfElement && (_jsx(AppearanceProvider, { value: Appearance.DARK, children: _jsx("div", { className: styles.container, children: ntfElement }) })));
});
export const NotificationsWidget = createWidget(NotificationsModelProvider, NotificationsView);
//# sourceMappingURL=NotificationsWidget.js.map