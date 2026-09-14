import '../../ui/ChannelPostDeletedSecondary/ChannelPostDeletedSecondary.css';
import React from 'react';
import { ChannelPostMarkedDeleted } from '../../ui/ChannelPost/ChannelPost';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import { Footnote } from '@vkontakte/vkui';
import { useRouter } from '../../ui/Router/Router';
import { ChannelPostSecondaryHighlightWrapper } from '../../ui/ChannelPostHighlightWrapper/ChannelPostSecondaryHighlightWrapper';
export const ChannelPostDeletedSecondary = React.memo(({ channelName, channelPhoto, isPostponed, channelId, postCmid, canRestore, isHighlighted, }) => {
    const { screenRoute, rightPanel, replace, navigate } = useRouter();
    const handleLinkClick = (e) => {
        const nextRoute = {
            organiser: screenRoute.organiser,
            ...rightPanel,
            kind: 'ChannelPanel',
            channelId: channelId,
            section: undefined,
        };
        if (rightPanel?.kind === 'ChannelPanel' &&
            channelId === rightPanel.channelId) {
            e.preventDefault();
            if (rightPanel.section !== undefined) {
                replace(nextRoute);
            }
            return;
        }
        navigate(nextRoute);
    };
    return (React.createElement("div", { className: "ChannelPostDeletedSecondary" },
        React.createElement(ChannelPostSecondaryHighlightWrapper, { isActive: isHighlighted },
            React.createElement("div", { className: "ChannelPostDeletedSecondary__avatar", onClick: handleLinkClick, tabIndex: 0, role: "button", "aria-label": channelName },
                React.createElement(ChannelAvatar, { name: channelName, photo: channelPhoto, size: 36 })),
            React.createElement(Footnote, { weight: "1", className: "ChannelPostDeletedSecondary__header", onClick: handleLinkClick, role: "button", "aria-label": channelName, useAccentWeight: true }, channelName),
            React.createElement(ChannelPostMarkedDeleted, { className: "ChannelPostDeletedSecondary__content", channelId: channelId, cmid: postCmid, isPostponed: isPostponed, canRestore: canRestore }))));
});
//# sourceMappingURL=ChannelPostDeletedSecondary.js.map