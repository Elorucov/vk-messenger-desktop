import { useOwner, usePeers } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { ActionsMenu } from '../../ui/ActionsMenu/ActionsMenu';
import '../../ui/CommentsComposerAuthorMenu/CommentsComposerAuthorMenu.css';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import React, { useMemo, useState } from 'react';
import * as Peer from '../../../core/model/Peer';
import { BurgerMenuOwnerAction } from '../../ui/BurgerMenu/BurgerMenu';
import { Avatar } from '../../ui/Avatar/Avatar';
import cx from 'classnames';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
export const CommentsComposerAuthorMenu = ({ channelId, ariaLabel, className, buttonClassName, commentGroupIds, onSelect, }) => {
    const { isMobileLayout } = useLayoutData();
    const owner = useOwner();
    const peers = usePeers();
    const [selectedPeer, setSelectedPeer] = useState(owner);
    const groups = useMemo(() => Array.from(peers.values()).reduce((acc, peer) => {
        if (peer.kind !== 'Group' || peer.id === owner.id) {
            return acc;
        }
        if (peer.id === Peer.resolveId(channelId) &&
            peer.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */) {
            return [peer, ...acc];
        }
        if (commentGroupIds.has(peer.id)) {
            acc.push(peer);
        }
        return acc;
    }, []), [channelId, commentGroupIds, owner.id, peers]);
    const actionsList = useMemo(() => {
        return (React.createElement(React.Fragment, null,
            React.createElement(BurgerMenuOwnerAction, { key: owner.id, title: Peer.name(owner), photo: owner.photo, isActive: owner.id === selectedPeer.id, onClick: () => setSelectedPeer((prev) => {
                    if (prev.id !== owner.id) {
                        onSelect?.(owner.id);
                    }
                    return owner;
                }) }),
            groups.map((group) => (React.createElement(BurgerMenuOwnerAction, { key: group.id, title: Peer.name(group), photo: group.photo, isActive: group.id === selectedPeer.id, onClick: () => setSelectedPeer((prev) => {
                    if (prev.id !== group.id) {
                        onSelect?.(group.id);
                    }
                    return group;
                }) })))));
    }, [groups, onSelect, owner, selectedPeer.id]);
    if (groups.length === 0) {
        return null;
    }
    return (React.createElement(Dropdown, { align: "left", position: "top", hideOnClick: true, ...(isMobileLayout
            ? {
                openType: 'click',
            }
            : {
                openType: 'hover',
                delay: 200,
            }), content: React.createElement(ActionsMenu, { className: className },
            React.createElement(ScrollbarProvider, { forceVisible: "y", className: "CommentsComposerAuthorMenu__scrollbar", overflowX: "hidden" }, actionsList)) },
        React.createElement("button", { className: cx(buttonClassName, 'CommentsComposerAuthorMenu__button'), "aria-label": ariaLabel },
            React.createElement(Avatar, { peer: selectedPeer, size: 24 }))));
};
//# sourceMappingURL=CommentsComposerAuthorMenu.js.map