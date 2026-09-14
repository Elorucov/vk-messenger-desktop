import '../../ui/ConvoHistoryPlaceholderActions/ConvoHistoryPlaceholderActions.css';
import React, { useCallback } from 'react';
import { Button } from '@vkontakte/vkui';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, useOwner } from '../../hooks/misc';
import { ExternalLink } from '../../ui/Link/Link';
export const ConvoHistoryPlaceholderActions = ({ peer, isService }) => {
    const { lang, vkDomain } = useBrowserEnv();
    const dispatch = useDispatch();
    const owner = useOwner();
    const url = `https://${vkDomain}/${Peer.screenName(peer)}`;
    const actionButtons = [
        React.createElement(ExternalLink, { href: url, key: 1 },
            React.createElement(Button, { mode: "secondary", size: "m", className: "ConvoHistoryPlaceholderActions__button" }, lang.use('me_view_profile'))),
    ];
    const handleChangeFriendship = useCallback(() => {
        const change = ['unfamiliar', 'incomingRequest'].includes(peer.friendship)
            ? 'add'
            : 'delete';
        dispatch({
            type: 'UserChangedFriendship',
            userId: peer.id,
            change,
        });
    }, [dispatch, peer]);
    if (!isService &&
        peer.friendship !== 'friends' &&
        peer.canChangeFriendship &&
        owner.kind !== 'Group') {
        const textMap = {
            unfamiliar: lang.use('me_add_to_friends'),
            outgoingRequest: lang.use('me_friend_request_sent'),
            incomingRequest: lang.use('me_friend_request_confirm'),
            friends: lang.use('me_in_your_friends'),
        };
        const friendButtonText = textMap[peer.friendship];
        const friendButtonMode = peer.friendship === 'outgoingRequest' ? 'secondary' : 'primary';
        actionButtons.push(React.createElement(Button, { key: 2, size: "m", onClick: handleChangeFriendship, mode: friendButtonMode, className: "ConvoHistoryPlaceholderActions__button" }, friendButtonText));
    }
    return React.createElement("div", { className: "ConvoHistoryPlaceholderActions" }, actionButtons);
};
//# sourceMappingURL=ConvoHistoryPlaceholderActions.js.map