import { Icon28CopyOutline, Icon28EditOutline, Icon28ListAddOutline, Icon28ShareOutline, } from '@vkontakte/icons';
import { useBrowserEnv, useFeatureFlags, useViewer } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import '../../ui/ChannelEmptyOnboarding/ChannelEmptyOnboarding.css';
import { ChannelEmptyOnboardingBanner } from '../../ui/ChannelEmptyOnboarding/ChannelEmptyOnboardingBanner';
import { CopyText } from '../../ui/CopyText/CopyText';
import React, { useCallback } from 'react';
import * as Viewer from '../../../core/model/Viewer';
import { SFERUM_DOMAIN } from '../../../core/config/config';
import cx from 'classnames';
export const ChannelEmptyOnboarding = ({ channel, isThemed, }) => {
    const { lang, vkDomain, router } = useBrowserEnv();
    const snackbar = useSnackbar();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const featureFlags = useFeatureFlags();
    const channelLink = isEdu
        ? `https://${SFERUM_DOMAIN}/?p=channel&channelId=${channel.id}`
        : `https://${vkDomain}/${channel.screenName}`;
    const onCopy = () => {
        snackbar({
            message: !isEdu && featureFlags.vkm_channel_name_to_community
                ? lang.use('me_channel_community_profile_channel_link_copied')
                : lang.use('me_channel_profile_channel_link_copied'),
            before: (React.createElement(Icon28CopyOutline, { className: "ChannelEmptyOnboarding__notificationIcon" })),
        });
    };
    const handleAddDescClick = useCallback(() => {
        const next = {
            kind: 'ChannelPanel',
            channelId: channel.id,
            section: 'settings',
        };
        const panels = router.screenRoute.rp || [];
        const [current] = panels.slice(-1);
        if (current?.kind === 'ChannelPanel' && channel.id === current.channelId) {
            if (current.section !== 'settings') {
                router.replace(next);
            }
            return;
        }
        router.push(next);
    }, [router, channel.id]);
    return (React.createElement("div", { className: cx('ChannelEmptyOnboarding', {
            'ChannelEmptyOnboarding--themed': isThemed,
        }) },
        React.createElement(ChannelEmptyOnboardingBanner, null),
        React.createElement("div", { className: "ChannelEmptyOnboarding__info" },
            React.createElement("span", { className: "ChannelEmptyOnboarding__title" }, !isEdu && featureFlags.vkm_channel_name_to_community
                ? lang.use('me_channel_community_empty_onboarding_title')
                : lang.use('me_channel_empty_onboarding_title')),
            React.createElement("span", { className: "ChannelEmptyOnboarding__description" }, lang.use('me_channel_empty_onboarding_description'))),
        React.createElement("div", { className: "ChannelEmptyOnboarding__list" },
            React.createElement(ChannelEmptyOnboardingListItem, { icon: React.createElement(Icon28ListAddOutline, null), titleText: lang.use('me_channel_empty_onboarding_item_1_title'), descriptionText: !isEdu && featureFlags.vkm_channel_name_to_community
                    ? lang.use('me_channel_community_empty_onboarding_item_1_description')
                    : lang.use('me_channel_empty_onboarding_item_1_description'), buttonContent: React.createElement("button", { onClick: handleAddDescClick, className: "ChannelEmptyOnboarding__listItemBtn", "aria-label": lang.use('me_channel_empty_onboarding_item_1_button') }, lang.use('me_channel_empty_onboarding_item_1_button')) }),
            React.createElement(ChannelEmptyOnboardingListItem, { icon: React.createElement(Icon28ShareOutline, null), titleText: lang.use('me_channel_empty_onboarding_item_2_title'), descriptionText: !isEdu && featureFlags.vkm_channel_name_to_community
                    ? lang.use('me_channel_community_empty_onboarding_item_2_description')
                    : lang.use('me_channel_empty_onboarding_item_2_description'), buttonContent: React.createElement(CopyText, { text: channelLink, onCopyDone: onCopy },
                    React.createElement("button", { className: "ChannelEmptyOnboarding__listItemBtn", "aria-label": lang.use('me_channel_empty_onboarding_item_2_button') }, lang.use('me_channel_empty_onboarding_item_2_button'))) }),
            React.createElement(ChannelEmptyOnboardingListItem, { icon: React.createElement(Icon28EditOutline, null), titleText: lang.use('me_channel_empty_onboarding_item_3_title'), descriptionText: !isEdu && featureFlags.vkm_channel_name_to_community
                    ? lang.use('me_channel_community_empty_onboarding_item_3_description')
                    : lang.use('me_channel_empty_onboarding_item_3_description') }))));
};
const ChannelEmptyOnboardingListItem = ({ icon, titleText, descriptionText, buttonContent }) => {
    return (React.createElement("div", { className: "ChannelEmptyOnboarding__listItem" },
        React.createElement("i", { role: "img", className: "ChannelEmptyOnboarding__listItemIcon" }, icon),
        React.createElement("div", { className: "ChannelEmptyOnboarding__listItemContennt" },
            React.createElement("span", { className: "ChannelEmptyOnboarding__listItemTitle" }, titleText),
            React.createElement("span", { className: "ChannelEmptyOnboarding__listItemDesc" }, descriptionText),
            buttonContent)));
};
//# sourceMappingURL=ChannelEmptyOnboarding.js.map