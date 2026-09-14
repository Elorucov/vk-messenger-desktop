import React from 'react';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { IncognitoDescription } from '../../ui/ConvoProfileMembers/ConvoProfileMembers';
import { getInitials } from '../../../core/utils/misc';
import './IncognitoProfile.css';
export const IncognitoProfile = ({ convo, incognitoId, }) => {
    const incognitoMember = convo.kind === 'ChatConvo'
        ? convo.members.incognitoMembers?.get(incognitoId)
        : undefined;
    if (!incognitoMember) {
        return null;
    }
    return (React.createElement("div", { className: "IncognitoProfile" },
        React.createElement(BasicAvatar, { size: 80, content: getInitials(incognitoMember.name), color: "contact" }),
        React.createElement("div", { className: "IncognitoProfile__name" }, incognitoMember.name),
        React.createElement("div", { className: "IncognitoProfile__desc" },
            React.createElement(IncognitoDescription, { incognitoMember: incognitoMember }))));
};
//# sourceMappingURL=IncognitoProfile.js.map