import * as Peer from '../../../core/model/Peer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import React, { useEffect, useRef } from 'react';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import { Provider } from '../../ui/Provider/Provider';
import { RenderCustomEmojiProvider } from '../../ui/Emoji/Emoji';
export const NotificationApp = ({ message, env, store, withName = true, onReady, }) => {
    let notify = null;
    const state = store.getState();
    const owner = Peer.safeGet(state.peers, state.ownerId);
    const $imagesLayoutEdgeSizes = useRef({
        width: 250,
        minHeight: 50,
        maxSingleHeight: 250,
        preferredRatio: 1,
    });
    switch (message.kind) {
        case 'Normal':
            const peer = Peer.safeGet(state.peers, message.peerId);
            const author = Peer.safeGet(state.peers, message.authorId);
            notify = (React.createElement(React.Fragment, null,
                author && peer.kind === 'Chat' && withName
                    ? `${Peer.name(author)}: `
                    : '',
                React.createElement(MessagePreview, { message: message, attachPreviewBrackets: true })));
            break;
        case 'Service':
            notify = React.createElement(MessagePreview, { message: message });
            break;
        case 'Expired':
        case 'Queued':
            break;
        default:
            exhaustivenessCheck(message);
    }
    useEffect(() => {
        onReady?.();
    }, [onReady]);
    return (React.createElement(Provider, { env: env, state: state, store: store, owner: owner, layoutMode: "two-column", imagesLayoutEdgeSizes: $imagesLayoutEdgeSizes.current },
        React.createElement(RenderCustomEmojiProvider, { value: false }, notify)));
};
//# sourceMappingURL=NotificationApp.js.map