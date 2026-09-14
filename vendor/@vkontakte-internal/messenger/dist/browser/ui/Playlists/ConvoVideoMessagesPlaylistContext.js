import React, { useRef, useCallback } from 'react';
import { ConvoVideoMessagesPlaylist } from '../../env/VideoMessagePlayer/ConvoVideoMessagesPlaylist';
export const ConvoVideoMessagesPlaylistContext = React.createContext(null);
export const ConvoVideoMessagesPlaylistProvider = ({ convo, children }) => {
    const convoRef = useRef(convo);
    convoRef.current = convo;
    const getConvoVideoMessagesPlaylist = useCallback(() => new ConvoVideoMessagesPlaylist(convoRef.current), []);
    return (React.createElement(ConvoVideoMessagesPlaylistContext.Provider, { value: getConvoVideoMessagesPlaylist }, children));
};
//# sourceMappingURL=ConvoVideoMessagesPlaylistContext.js.map