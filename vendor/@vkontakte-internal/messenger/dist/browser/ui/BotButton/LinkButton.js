import React from 'react';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { Icon12ArrowUpRight } from '@vkontakte/icons';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { TextWithEmoji } from '../../ui/TextWithEmoji/TextWithEmoji';
export const LinkButton = ({ button, authorId, ...other }) => {
    const { botKeyboard } = useBrowserEnv();
    const peers = usePeers();
    const peer = Peer.safeGet(peers, Peer.resolveId(authorId));
    const name = Peer.name(peer);
    return (React.createElement(Button, { ...other, mode: "secondary", href: button.link, title: button.label, onClick: (e) => {
            e.preventDefault();
            botKeyboard.openLink(button.link, name, false);
        }, after: React.createElement(Icon12ArrowUpRight, null) },
        React.createElement(TextWithEmoji, { text: button.label })));
};
//# sourceMappingURL=LinkButton.js.map