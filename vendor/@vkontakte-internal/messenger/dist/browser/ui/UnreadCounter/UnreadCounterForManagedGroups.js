import '../../ui/UnreadCounter/UnreadCounter.css';
import React, { useEffect, useRef, useState } from 'react';
import { useBrowserEnv, useDispatch, useHelpHints } from '../../hooks/misc';
import { OnboardingMarkedTooltip, } from '@vkontakte-internal/vkcom-kit';
import { UnreadCounter, } from '../../ui/UnreadCounter/UnreadCounter';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const UnreadCounterForManagedGroups = ({ onContainerCapture, onContainerRelease, onboardingPosition = 'bottom-left', onboardingTilt = 'right', ...rest }) => {
    const onboardingKey = 'im:groups_folder_counter';
    const { lang, stats } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const dispatch = useDispatch();
    const helpHints = useHelpHints();
    const isManagedGroupsCounterOnboardingActive = helpHints.has(onboardingKey);
    const onboardingResources = helpHints.get(onboardingKey) || [];
    const isCounterConsideringTurnedOn = useRef(false);
    useEffect(() => {
        if (isManagedGroupsCounterOnboardingActive) {
            isCounterConsideringTurnedOn.current =
                onboardingResources.find((r) => r.key === 'type')?.value === 'turned-on';
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isManagedGroupsCounterOnboardingActive]);
    const [showOnboarding, setShowOnboarding] = useState(false);
    useEffect(() => {
        const showOnboarding = () => {
            setShowOnboarding(true);
        };
        let onboardingTimeout;
        let onVisibilityChange;
        if (isManagedGroupsCounterOnboardingActive) {
            if (document.hidden) {
                onVisibilityChange = () => {
                    if (!document.hidden) {
                        onContainerCapture?.();
                        onboardingTimeout = window.setTimeout(showOnboarding, 500);
                        document.removeEventListener('visibilitychange', onVisibilityChange);
                    }
                };
                document.addEventListener('visibilitychange', onVisibilityChange);
            }
            else {
                onContainerCapture?.();
                onboardingTimeout = window.setTimeout(showOnboarding, 500);
            }
        }
        return () => {
            onContainerRelease?.();
            clearTimeout(onboardingTimeout);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const onOnboardingClose = () => {
        setShowOnboarding(false);
    };
    const onOnboardingHideEnd = () => {
        onContainerRelease?.();
    };
    const onOnboardingShowEnd = () => {
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'counter_community_onboarding',
                    label: isCounterConsideringTurnedOn.current
                        ? 'сounter_сonsidering_turned_on'
                        : 'сounter_сonsidering_turned_off',
                },
            },
        });
        dispatch({
            type: 'UserSeenHelpHint',
            hintId: onboardingKey,
        });
    };
    return (React.createElement(OnboardingMarkedTooltip, { shown: showOnboarding, content: lang.use(isCounterConsideringTurnedOn.current
            ? 'me_managed_groups_counter_onboarding_few'
            : 'me_managed_groups_counter_onboarding_many'), onClose: onOnboardingClose, onHideEnd: onOnboardingHideEnd, onShowEnd: onOnboardingShowEnd, tipPosition: onboardingPosition, tilt: onboardingTilt, mode: "4", size: 56, maxWidth: isMobileLayout ? undefined : 280, disableFlipMiddleware: !isMobileLayout },
        React.createElement(UnreadCounter, { ...rest })));
};
//# sourceMappingURL=UnreadCounterForManagedGroups.js.map