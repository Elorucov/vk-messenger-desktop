import '../../ui/ConvoListFoldersDropdown/ConvoListFoldersDropdown.css';
import React, { useState } from 'react';
import { useBrowserEnv, useFeatureFlags, useHelpHints, } from '../../hooks/misc';
import * as Organisers from '../../../core/model/Organisers';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { Icon20AdvertisingOutline, Icon20Check, Icon20FolderOutline, Icon20FolderSimpleOutline, Icon20GearOutline, Icon20MessageOutline, } from '@vkontakte/icons';
import cx from 'classnames';
import { UnreadCounter, } from '../../ui/UnreadCounter/UnreadCounter';
import { UnreadCounterForManagedGroups } from '../../ui/UnreadCounter/UnreadCounterForManagedGroups';
export const ConvoListFoldersDropdown = ({ activeOrganiser, activeOrganiserCount, activeOrganiserIndex, isHaveUnreadUnmutedActiveOrganiserCount, onOrganiserSelect, organisers, convoOrganiserToggles, handleFoldersSettingsClick, }) => {
    const { lang } = useBrowserEnv();
    const helpHints = useHelpHints();
    const featureFlags = useFeatureFlags();
    const isManagedGroupsCounterOnboardingActive = helpHints.has('im:groups_folder_counter');
    const managedGroupsFolder = organisers.folders.find((f) => f.type === 'managed_groups');
    let managedGroupsCounterValue = 0;
    if (managedGroupsFolder) {
        managedGroupsCounterValue =
            managedGroupsFolder.unreadUnmutedCount > 0
                ? managedGroupsFolder.unreadUnmutedCount
                : managedGroupsFolder.unreadCount;
    }
    const [isOnboardingInProgress, setIsOnboardingInProgress] = useState(false);
    const onOnboardingContainerCapture = () => {
        setIsOnboardingInProgress(true);
    };
    const onOnboardingContainerRelease = () => {
        setIsOnboardingInProgress(false);
    };
    const shouldDisplayManagedGroupsCounterOnboarding = (isManagedGroupsCounterOnboardingActive &&
        managedGroupsCounterValue > 0 &&
        featureFlags.vkm_comm_counter_onboarding) ||
        isOnboardingInProgress;
    return (React.createElement("div", { className: "ConvoListFoldersDropdown" },
        React.createElement(Dropdown, { open: shouldDisplayManagedGroupsCounterOnboarding, openType: shouldDisplayManagedGroupsCounterOnboarding ? 'click' : undefined, classNames: {
                trigger: 'ConvoListFoldersDropdown__Trigger',
            }, content: React.createElement(React.Fragment, null,
                React.createElement(ActionsMenu, { closeButton: false, className: 'ConvoListFoldersDropdown__ActionsMenu' },
                    convoOrganiserToggles.map((item, i) => (React.createElement(ConvoListDropdownItem, { item: item, index: i, organisers: organisers, onOrganiserSelect: onOrganiserSelect, activeOrganiserIndex: activeOrganiserIndex, onOnboardingContainerCapture: onOnboardingContainerCapture, onOnboardingContainerRelease: onOnboardingContainerRelease }))),
                    handleFoldersSettingsClick && (React.createElement(React.Fragment, null,
                        React.createElement(ActionsMenuSeparator, null),
                        React.createElement(ActionsMenuAction, { onClick: handleFoldersSettingsClick, title: lang.use('me_folders_settings_gear_icon'), leftIcon: React.createElement(Icon20GearOutline, { className: "ConvoListFoldersDropdown__ActionsMenuItemLeftIcon" }), titleClassName: "ConvoListFoldersDropdown__ActionsMenuItemTitle", type: "primary" }))))), align: "top", position: "right" },
            React.createElement(React.Fragment, null,
                React.createElement("div", { className: "ConvoListFoldersDropdown__Icon" },
                    React.createElement(Icon20FolderOutline, null),
                    !!activeOrganiserCount && (React.createElement("span", { className: cx('ConvoListFoldersDropdown__Counter', {
                            'ConvoListFoldersDropdown__Counter--muted': !isHaveUnreadUnmutedActiveOrganiserCount,
                        }) }, activeOrganiserCount
                        ? lang.formatNumber(activeOrganiserCount, 'short')
                        : ''))),
                React.createElement("div", { className: "ConvoListFoldersDropdown__Caption" },
                    React.createElement("span", { className: "ConvoListFoldersDropdown__Title" }, activeOrganiser?.name))))));
};
const ConvoListDropdownItem = ({ item, index, activeOrganiserIndex, organisers, onOrganiserSelect, onOnboardingContainerCapture, onOnboardingContainerRelease, }) => {
    const tabId = Organisers.getId(item.organiser);
    const featureFlags = useFeatureFlags();
    const isChannelFolder = item.organiser.kind === 'folders' && item.organiser.type === 'channels';
    const isManagedGroups = item.organiser.kind === 'folders' &&
        item.organiser.type === 'managed_groups';
    let leftIcon = (React.createElement(Icon20FolderSimpleOutline, { className: "ConvoListFoldersDropdown__ActionsMenuItemLeftIcon" }));
    if (isChannelFolder) {
        leftIcon = (React.createElement(Icon20AdvertisingOutline, { className: "ConvoListFoldersDropdown__ActionsMenuItemLeftIcon" }));
    }
    if (item.organiser.kind === 'filters' && item.organiser.filter === 'all') {
        leftIcon = (React.createElement(Icon20MessageOutline, { className: "ConvoListFoldersDropdown__ActionsMenuItemLeftIcon" }));
    }
    const unreadCounterProps = {
        count: item.primaryCount > 0 ? item.primaryCount : item.count,
        isMuted: item.primaryCount === 0,
        size: 18,
    };
    let after = item.count > 0 ? (isManagedGroups && featureFlags.vkm_comm_counter_onboarding ? (React.createElement(UnreadCounterForManagedGroups, { ...unreadCounterProps, onboardingPosition: "bottom-right", onboardingTilt: "left", onContainerCapture: onOnboardingContainerCapture, onContainerRelease: onOnboardingContainerRelease })) : (React.createElement(UnreadCounter, { ...unreadCounterProps }))) : null;
    if (isChannelFolder && organisers.channelFilters.all.unreadCount) {
        after = (React.createElement(UnreadCounter, { count: organisers.channelFilters.all.unreadUnmutedCount ||
                organisers.channelFilters.all.unreadCount, isMuted: !organisers.channelFilters.all.unreadUnmutedCount, size: 18 }));
    }
    return (React.createElement(ActionsMenuAction, { onClick: () => onOrganiserSelect(item.organiser), key: tabId, title: React.createElement(React.Fragment, null,
            item.name,
            after), leftIcon: leftIcon, rightIcon: activeOrganiserIndex === index && React.createElement(Icon20Check, null), titleClassName: "ConvoListFoldersDropdown__ActionsMenuItemTitle", type: "primary" }));
};
//# sourceMappingURL=ConvoListFoldersDropdown.js.map