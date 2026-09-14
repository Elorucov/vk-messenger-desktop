import React from 'react';
import cx from 'classnames';
import './ArchiveTopTabs.css';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useFeatureFlags, useViewer } from '../../hooks/misc';
import { Tabs, TabsItem } from '@vkontakte/vkui';
export const ArchiveTopTabs = ({ tab, className, onArchiveTabClick, isChannelsFolderExists, }) => {
    const { lang } = useBrowserEnv();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const featureFlags = useFeatureFlags();
    return (React.createElement("div", { className: cx('ArchiveTabs', className) },
        React.createElement(Tabs, { mode: "accent" },
            React.createElement(TabsItem, { onClick: () => onArchiveTabClick('convos'), selected: tab === 'convos' }, lang.use('me_aside_toolbar_chats_title')),
            isChannelsFolderExists && (React.createElement(TabsItem, { onClick: () => onArchiveTabClick('channels'), selected: tab === 'channels' }, !isEdu && featureFlags.vkm_channel_name_to_community
                ? lang.use('me_aside_toolbar_channels_community_title')
                : lang.use('me_aside_toolbar_channels_title'))))));
};
//# sourceMappingURL=ArchiveTopTabs.js.map