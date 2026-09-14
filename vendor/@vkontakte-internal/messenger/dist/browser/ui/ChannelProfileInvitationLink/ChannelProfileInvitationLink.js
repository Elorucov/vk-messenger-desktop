import React from 'react';
import * as Convo from '../../../core/model/Convo';
import { useBrowserEnv, useFeatureFlags, useViewer } from '../../hooks/misc';
import { SimpleInvitationLink } from '../../ui/SimpleInvitationLink/SimpleInvitationLink';
import * as Viewer from '../../../core/model/Viewer';
import { ProfileInvitationRightPanel } from '../../ui/ProfileInvitationRightPanel/ProfileInvitationRightPanel';
import './ChannelProfileInvitationLink.css';
export const ChannelProfileInvitationLink = ({ link, openConvo, showSettings = true }) => {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    const forwardListFilter = (convo) => {
        return (Convo.canForwardTo(convo) || Convo.isRestrictedToWrite(convo, viewer.id));
    };
    const isEdu = Viewer.isEdu(viewer.profileType);
    const featureFlags = useFeatureFlags();
    return (React.createElement(ProfileInvitationRightPanel, { link: link, title: !isEdu && featureFlags.vkm_channel_name_to_community
            ? lang.use('me_convo_channel_community_link_title')
            : lang.use('me_convo_channel_link_title'), copyMessage: !isEdu && featureFlags.vkm_channel_name_to_community
            ? lang.use('me_channel_community_profile_channel_link_copied')
            : lang.use('me_channel_profile_channel_link_copied'), className: "ChannelProfileInvitationLink", showSettings: showSettings },
        React.createElement(SimpleInvitationLink, { link: link, openConvo: openConvo, listFilter: forwardListFilter })));
};
//# sourceMappingURL=ChannelProfileInvitationLink.js.map