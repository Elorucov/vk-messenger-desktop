import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import * as Peer from '../../../core/model/Peer';
import { Subhead } from '@vkontakte/vkui';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { FormattedPhoneNumber } from '../../ui/FormattedPhoneNumber/FormattedPhoneNumber';
import { EmployeeVacationMark } from '../../ui/EmployeeVacationMark/EmployeeVacationMark';
export const PeerSubhead = ({ peer, convo, subhead, withRestrictedDisabling, showScreenName, className, showVacation = false, }) => {
    const { lang } = useBrowserEnv();
    const getContent = () => {
        if (showScreenName &&
            (peer.kind === 'User' || peer.kind === 'Group') &&
            peer.screenName) {
            return (React.createElement(React.Fragment, null,
                "@",
                peer.screenName,
                peer.kind === 'User' && showVacation && (React.createElement(EmployeeVacationMark, { peer: peer, hasSeparator: true, isShort: true }))));
        }
        switch (peer.kind) {
            case 'User': {
                if (withRestrictedDisabling && !convo?.canWrite.allowed) {
                    return lang.use('me_forward_modal_restricted_user', {
                        sex: Peer.sex(peer),
                    });
                }
                return (React.createElement(React.Fragment, null,
                    React.createElement(OnlineStatus, { user: peer }),
                    showVacation && (React.createElement(EmployeeVacationMark, { peer: peer, hasSeparator: true, isShort: true }))));
            }
            case 'Chat': {
                if (convo?.kind !== 'ChatConvo') {
                    return '';
                }
                switch (convo.state) {
                    case 'in':
                        if (withRestrictedDisabling && !convo.canWrite.allowed) {
                            return lang.use('me_forward_modal_restricted_convo');
                        }
                        return lang.use(convo.isGroupChannel
                            ? 'me_channel_subscribers_count'
                            : 'me_group_members_count', {
                            num: convo.members.count,
                            formatted: 'short',
                        });
                    case 'left':
                        return lang.use('me_convo_profile_left_chat_label');
                    case 'kicked':
                        return lang.use('me_convo_profile_kicked_chat_label');
                    case 'out':
                        return '';
                    default:
                        const _typeguard = convo.state;
                        return '';
                }
            }
            case 'Group': {
                if (withRestrictedDisabling && !convo?.canWrite.allowed) {
                    return lang.use('me_forward_modal_restricted_group');
                }
                return peer.memberCount > 0
                    ? lang.use('me_channel_subscribers_count', {
                        num: peer.memberCount,
                        formatted: 'short',
                    })
                    : lang.use('me_community_label');
            }
            case 'Contact': {
                if (withRestrictedDisabling && !peer?.canWrite) {
                    return lang.use('me_forward_modal_restricted_user', {
                        sex: Peer.sex(peer),
                    });
                }
                return React.createElement(FormattedPhoneNumber, { phone: peer.phone });
            }
            default:
                exhaustivenessCheck(peer);
        }
    };
    return (React.createElement(Subhead, { className: className, weight: "3", useAccentWeight: true }, subhead || getContent()));
};
//# sourceMappingURL=PeerSubhead.js.map