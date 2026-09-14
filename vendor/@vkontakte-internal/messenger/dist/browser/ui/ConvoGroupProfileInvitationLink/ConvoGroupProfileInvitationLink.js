import React from 'react';
import * as Convo from '../../../core/model/Convo';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { SimpleInvitationLink } from '../../ui/SimpleInvitationLink/SimpleInvitationLink';
import { ProfileInvitationRightPanel } from '../../ui/ProfileInvitationRightPanel/ProfileInvitationRightPanel';
export const ConvoGroupProfileInvitationLink = ({ link, openConvo, className }) => {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    const forwardListFilter = (convo) => {
        return (Convo.canForwardTo(convo) || Convo.isRestrictedToWrite(convo, viewer.id));
    };
    return (React.createElement(ProfileInvitationRightPanel, { link: link, title: lang.use('me_convo_profile_link_title'), copyMessage: lang.use('me_convo_profile_link_copy_notification'), showSettings: true, className: className },
        React.createElement(SimpleInvitationLink, { link: link, openConvo: openConvo, listFilter: forwardListFilter })));
};
//# sourceMappingURL=ConvoGroupProfileInvitationLink.js.map