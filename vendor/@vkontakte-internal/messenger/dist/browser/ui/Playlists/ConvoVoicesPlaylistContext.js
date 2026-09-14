import React, { useRef, useCallback } from 'react';
import { ConvoVoicesPlaylist } from '../../env/AudioPlayer/ConvoVoicesPlaylist';
import { mapConvoToConvoVoiceTrackList } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
const defaultContextValue = () => {
    return undefined;
};
export const ConvoVoicesPlaylistContext = React.createContext(defaultContextValue);
export const ConvoVoicesPlaylistProvider = ({ convo, children }) => {
    const convoRef = useRef(convo);
    convoRef.current = convo;
    const getConvoVoicesPlaylist = useCallback((currentConvoVoiceTrack) => {
        const list = mapConvoToConvoVoiceTrackList(convoRef.current);
        return new ConvoVoicesPlaylist(list, currentConvoVoiceTrack, {
            kind: 'message',
            peerId: convoRef.current.peerId,
        });
    }, []);
    return (React.createElement(ConvoVoicesPlaylistContext.Provider, { value: getConvoVoicesPlaylist }, children));
};
//# sourceMappingURL=ConvoVoicesPlaylistContext.js.map