import React from 'react';
import * as Convo from '../../../core/model/Convo';
import '../../ui/ConvoProfileInvitationLink/ConvoProfileInvitationLink.css';
import { ChatInvitationLink } from '../../ui/ChatInvitationLink/ChatInvitationLink';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { ProfileInvitationRightPanel } from '../../ui/ProfileInvitationRightPanel/ProfileInvitationRightPanel';
import { Separator } from '@vkontakte/vkui';
export const ConvoProfileInvitationLink = ({ convo, openConvo, className, }) => {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    if (!convo.inviteLinks) {
        return null;
    }
    const canEdit = convo.acl.canChangeInviteLink;
    const link = convo.inviteLinks.withHistory || convo.inviteLinks.noHistory || '';
    const forwardListFilter = (convo) => {
        return (Convo.canForwardTo(convo) || Convo.isRestrictedToWrite(convo, viewer.id));
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Separator, null),
        React.createElement(ProfileInvitationRightPanel, { link: link, title: lang.use('me_convo_profile_link_title'), copyMessage: lang.use('me_convo_profile_link_copy_notification'), showSettings: canEdit, className: className },
            React.createElement(ChatInvitationLink, { canEdit: canEdit, links: convo.inviteLinks, peerId: convo.peerId, openConvo: openConvo, listFilter: forwardListFilter, isLinkWithHistory: true, className: "ConvoProfileInvitationLink__invitation" }))));
};
//# sourceMappingURL=ConvoProfileInvitationLink.js.map