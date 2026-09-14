import React from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useFeatureFlags, useOwner, useViewer, } from '../../hooks/misc';
import { AvatarFavorites } from '../../ui/AvatarFavorites/AvatarFavorites';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Icon12StarCircleFillYellow, Icon16BookSpread, Icon16Education, Icon16ErrorCircleFill, Icon16Ghost, Icon16LogoVk, Icon16Users, Icon20Verified, Icon24LogoVkColor, } from '@vkontakte/icons';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { AvatarCard } from '../../ui/AvatarCard/AvatarCard';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { StatusIcon } from '../../ui/StatusIcon/StatusIcon';
import { Icon20VerifiedBadgeAltLight } from '@vkontakte-internal/icons-private';
import '../../ui/ConvoProfileName/ConvoProfileName.css';
import { nl2br } from '../../../core/utils/format';
import cx from 'classnames';
import { EmployeeVacationMark } from '../../ui/EmployeeVacationMark/EmployeeVacationMark';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { ConvoProfileScheduleStatus } from '../../ui/ConvoProfileScheduleStatus/ConvoProfileScheduleStatus';
import { useColorScheme } from '@vkontakte/vkui';
export const ConvoProfileName = ({ convo, peer, className, }) => {
    const featureFlags = useFeatureFlags();
    const owner = useOwner();
    const { viewer, profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const { lang, vkDomain } = useBrowserEnv();
    const isFavorites = owner.kind !== 'Group' && Peer.isFavorites(peer.id, owner.id);
    const peerEduRoles = Peer.getEduRoles(peer);
    const screenName = Peer.screenName(peer);
    const url = `https://${vkDomain}/${screenName}`;
    const getAvatar = () => {
        if (isFavorites) {
            return React.createElement(AvatarFavorites, { size: 80 });
        }
        if (peer.kind === 'User' && peer.photoId && !peer.isBlacklisted) {
            return (React.createElement(Link, { to: {
                    kind: 'PhotoModal',
                    ownerId: peer.id,
                    id: peer.photoId,
                }, className: cx({
                    'ConvoProfileName__avatarWrapper--clickable': peer.kind === 'User' && peer.photoId && !peer.isBlacklisted,
                }) },
                React.createElement(PeerAvatar, { peer: peer, size: 80 })));
        }
        return (React.createElement("div", { className: cx({
                'ConvoProfileName__avatarWrapper--clickable': peer.kind === 'User' && peer.photoId && !peer.isBlacklisted,
            }) },
            React.createElement(PeerAvatar, { peer: peer, size: 80 })));
    };
    const renderPeerVerifiedIcon = () => {
        if (isEdu && peer.kind === 'User') {
            return null;
        }
        let Icon;
        switch (true) {
            case isEdu:
                Icon = peer.kind === 'Group' ? Icon20Verified : Icon16Education;
                break;
            default:
                Icon = Icon20VerifiedBadgeAltLight;
        }
        /* Цвет значка верный, но сам значок работает по ссылке, где прошит цвет для fill */
        /* @todo Установить правильный цвет, если появится такая возможность */
        return (React.createElement(Icon, { className: "ConvoProfileName__peerVerifiedIcon", width: 20, height: 20 }));
    };
    const renderRoleIcon = (roleId) => {
        switch (roleId) {
            case 'admin':
            case 'employee':
            case 'teacher':
                return React.createElement(Icon16Education, { className: "ConvoProfileName__rolesIcon" });
            case 'parent':
                return React.createElement(Icon16Users, { className: "ConvoProfileName__rolesIcon" });
            case 'student':
                return React.createElement(Icon16BookSpread, { className: "ConvoProfileName__rolesIcon" });
            default:
                exhaustivenessCheck(roleId);
        }
    };
    const renderUserDescription = (peer) => {
        if (peer.isDeactivated) {
            switch (peer.deactivationReason) {
                case 'deleted':
                    return nl2br(lang.use('me_convo_profile_deleted'));
                case 'banned':
                    return nl2br(lang.use('me_convo_profile_banned'));
                default:
                    return '';
            }
        }
        if (peer.isBlacklisted) {
            return nl2br(lang.use('me_convo_profile_blacklisted', {
                values: { name: Peer.firstName(peer) },
                sex: peer.sex,
            }));
        }
        const renderStatusBlock = () => {
            if (isEdu) {
                return (React.createElement("span", null,
                    React.createElement("span", { className: "ConvoProfileName__rolesIconContainer" },
                        peerEduRoles?.mainRoleCode ? (renderRoleIcon(peerEduRoles.mainRoleCode)) : (React.createElement(Icon16ErrorCircleFill, { className: "ConvoProfileName__rolesIcon" })),
                        "\u00A0"),
                    React.createElement("span", { className: cx({
                            ConvoProfileName__noRole: !peerEduRoles?.mainRoleCode,
                        }) }, peerEduRoles?.mainRole ??
                        lang.use('me_convo_profile_no_edu_roles')),
                    "\u00A0\u00B7 ",
                    React.createElement(OnlineStatus, { user: peer, className: "ConvoProfileName__onlineStatus" })));
            }
            return React.createElement(OnlineStatus, { user: peer });
        };
        const isFavorites = Peer.isFavorites(peer.id, owner.id);
        if (isFavorites) {
            return lang.use('me_favorites_label');
        }
        return (React.createElement("div", { className: "ConvoProfileName__description" },
            renderStatusBlock(),
            peer.kind === 'User' && Peer.isEmployee(peer) && (React.createElement("div", { className: "ConvoProfileName__badges" },
                React.createElement(EmployeeVacationMark, { peer: peer, hasIcon: true, capitalize: true, Wrapper: ({ children }) => (React.createElement("div", { className: "ConvoProfileName__badge" }, children)) })))));
    };
    const renderContactDescription = (peer) => {
        return React.createElement(OnlineStatus, { user: peer });
    };
    const avatar = getAvatar();
    const name = React.createElement(Name, { peer: peer, url: url });
    switch (convo.kind) {
        case 'ChatConvo':
        case 'MessageRequestChatConvo': {
            const badges = [];
            if (convo.isCasper) {
                badges.push(React.createElement(Tooltip, { key: "casper", showOnTouch: true, position: "top", content: React.createElement("span", { className: "ConvoProfileInformation__casperTooltip" }, lang.use('me_casper_chat_info')) },
                    React.createElement("div", { className: "ConvoProfileName__badge ConvoProfileName__badge--casper" },
                        React.createElement(Icon16Ghost, null),
                        lang.use('me_casper_chat_label'))));
            }
            if (convo.isDonut) {
                badges.push(React.createElement("div", { className: "ConvoProfileName__badge", key: "donut" },
                    React.createElement(Icon12StarCircleFillYellow, null),
                    lang.use('me_donut_chat_label')));
            }
            if (convo.isService) {
                badges.push(React.createElement("span", { className: "ConvoProfileName__badge", key: "service" }, lang.use('me_service_chat_label')));
            }
            let state = null;
            switch (convo.state) {
                case 'in':
                    state = lang.use(convo.isGroupChannel
                        ? 'me_channel_subscribers_count'
                        : 'me_group_members_count', {
                        num: convo.members.count,
                        formatted: 'short',
                    });
                    break;
                case 'left':
                    state = lang.use('me_convo_profile_left_chat_label');
                    break;
                case 'kicked':
                    state = lang.use('me_convo_profile_kicked_chat_label');
                    break;
                default:
            }
            return (React.createElement(AvatarCard, { avatar: avatar, name: name, description: React.createElement("div", { className: "ConvoProfileName__description" },
                    React.createElement("div", null, state),
                    badges.length > 0 && (React.createElement("div", { className: "ConvoProfileName__badges" }, badges.map((badge) => badge)))), className: className }));
        }
        case 'BusinessNotify': {
            /**
             * В чате бизнес уведомлений по дефолту пользователь kicked, поэтому скрываем описание состояние пользователя
             */
            return React.createElement(AvatarCard, { avatar: avatar, name: name, className: className });
        }
        case 'UserConvo':
        case 'MessageRequestUserConvo': {
            if (peer.kind !== 'User') {
                return null;
            }
            return (React.createElement(React.Fragment, null,
                React.createElement(AvatarCard, { avatar: avatar, name: React.createElement("div", { className: "ConvoProfileName__nameContainer" },
                        name,
                        peer.isVerified && renderPeerVerifiedIcon()), description: React.createElement("div", { className: "ConvoProfileName__user--description" }, renderUserDescription(peer)), className: className }),
                featureFlags.vkm_enable_schedule_edu &&
                    isEdu &&
                    !Peer.hasEduOrganizationalRoles(viewer) && (React.createElement(ConvoProfileScheduleStatus, { peer: peer }))));
        }
        case 'GroupConvo': {
            if (peer.kind !== 'Group') {
                return null;
            }
            return (React.createElement(AvatarCard, { avatar: avatar, name: React.createElement("div", { className: "ConvoProfileName__nameContainer" },
                    name,
                    peer.isVerified && renderPeerVerifiedIcon()), description: peer.memberCount > 0
                    ? lang.use('me_channel_subscribers_count', {
                        num: peer.memberCount,
                        formatted: 'short',
                    })
                    : lang.use('me_community_label'), className: className }));
        }
        case 'ContactConvo': {
            if (peer.kind !== 'Contact') {
                return null;
            }
            return (React.createElement(AvatarCard, { avatar: avatar, name: React.createElement("div", { className: "ConvoProfileName__nameContainer" }, name), description: React.createElement("div", { className: "ConvoProfileName__user--description" }, renderContactDescription(peer)), className: className }));
        }
        default:
            return null;
    }
};
const Name = ({ peer, url }) => {
    const owner = useOwner();
    const viewer = useViewer();
    const { lang } = useBrowserEnv();
    const isFavorites = owner.kind !== 'Group' && Peer.isFavorites(peer.id, owner.id);
    const isEmployee = !isFavorites && peer.kind === 'User' && Peer.isEmployee(peer);
    const isEdu = Viewer.isEdu(viewer.profileType);
    const isDarkTheme = useColorScheme() === 'dark';
    const content = (React.createElement(React.Fragment, null,
        isFavorites ? lang.use('me_favorites') : Peer.name(peer),
        !isFavorites && (React.createElement(StatusIcon, { peer: peer, size: 16, className: "ConvoProfileName__status" })),
        isEmployee && (React.createElement(Tooltip, { align: "right", content: lang.use('me_employees_vk_employee'), delay: 1000, position: "bottom" },
            React.createElement("span", { className: "ConvoTitle__icon ConvoTitle__employeeIcon" }, isDarkTheme ? (React.createElement(Icon16LogoVk, { height: 20, width: 20 })) : (React.createElement(Icon24LogoVkColor, { height: 20, width: 20 })))))));
    return (React.createElement("h2", { className: "ConvoProfileName__longName" }, !isEdu && (peer.kind === 'User' || peer.kind === 'Group') ? (React.createElement(ExternalLink, { href: url, className: "ConvoProfileName__link" }, content)) : (content)));
};
//# sourceMappingURL=ConvoProfileName.js.map