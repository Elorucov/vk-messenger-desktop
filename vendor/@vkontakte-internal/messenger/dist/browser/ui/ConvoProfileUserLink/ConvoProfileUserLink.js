import React from 'react';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import { ExternalLink } from '../../ui/Link/Link';
import { Icon20LogoVkOutline } from '@vkontakte/icons';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import '../../ui/ConvoProfileUserLink/ConvoProfileUserLink.css';
import { exhaustivenessCheck } from '../../../core/utils/misc';
export const ConvoProfileUserLink = ({ className, peerId, }) => {
    const peers = usePeers();
    const peer = Peer.safeGet(peers, peerId);
    const screenName = Peer.screenName(peer);
    return (React.createElement(ProfileUserLink, { kind: peer.kind, className: className, screenName: screenName || '' }));
};
export const ProfileUserLink = ({ kind, className, screenName }) => {
    const { lang, vkDomain } = useBrowserEnv();
    const url = `https://${vkDomain}/${screenName}`;
    const renderButtonName = () => {
        switch (kind) {
            case 'User':
                return lang.use('me_convo_profile_user_link');
            case 'Group':
                return lang.use('me_convo_profile_group_link');
            default:
                return exhaustivenessCheck(kind);
        }
    };
    return (React.createElement(InfoCell, { left: React.createElement("div", { className: "ConvoProfileUserLink__icon" },
            React.createElement(Icon20LogoVkOutline, null)), className: cx('ConvoProfileUserLink', className) },
        React.createElement(ExternalLink, { href: url, className: "ConvoProfileUserLink__link" }, renderButtonName())));
};
//# sourceMappingURL=ConvoProfileUserLink.js.map