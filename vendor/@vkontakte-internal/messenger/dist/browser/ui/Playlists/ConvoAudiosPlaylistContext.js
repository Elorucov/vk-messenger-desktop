import React, { useRef, useCallback } from 'react';
import { ConvoAudiosPlaylist, mapChannelToConvoAudioTrackList, mapConvoToConvoAudioTrackList, mapPostCommentsToConvoAudioTrackList, } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
import { usePixelDensity } from '../../hooks/misc';
export const ConvoAudiosPlaylistContext = React.createContext(() => undefined);
export const ConvoAudiosPlaylistProvider = ({ convo, children }) => {
    const convoRef = useRef(convo);
    const isDense = usePixelDensity();
    convoRef.current = convo;
    const getConvoAudiosPlaylist = useCallback(() => {
        const list = mapConvoToConvoAudioTrackList(convoRef.current, isDense);
        const meta = {
            type: 'temp',
            source: {
                kind: 'message',
                peerId: convoRef.current.peerId,
            },
        };
        return new ConvoAudiosPlaylist({ list, meta });
    }, [isDense]);
    return (React.createElement(ConvoAudiosPlaylistContext.Provider, { value: getConvoAudiosPlaylist }, children));
};
export const ChannelAudiosPlaylistProvider = ({ channel, children }) => {
    const channelRef = useRef(channel);
    const isDense = usePixelDensity();
    channelRef.current = channel;
    const getConvoAudiosPlaylist = useCallback(() => {
        const list = mapChannelToConvoAudioTrackList(channelRef.current, isDense);
        const meta = {
            type: 'temp',
            source: {
                kind: 'channel',
                channelId: channelRef.current.id,
            },
        };
        return new ConvoAudiosPlaylist({ list, meta });
    }, [isDense]);
    return (React.createElement(ConvoAudiosPlaylistContext.Provider, { value: getConvoAudiosPlaylist }, children));
};
export const CommentsAudiosPlaylistProvider = ({ post, children }) => {
    const postRef = useRef(post);
    const isDense = usePixelDensity();
    postRef.current = post;
    const getConvoAudiosPlaylist = useCallback(() => {
        const list = mapPostCommentsToConvoAudioTrackList(postRef.current, isDense);
        const meta = {
            type: 'temp',
            source: {
                kind: 'channel',
                channelId: postRef.current.channelId,
            },
        };
        return new ConvoAudiosPlaylist({ list, meta });
    }, [isDense]);
    return (React.createElement(ConvoAudiosPlaylistContext.Provider, { value: getConvoAudiosPlaylist }, children));
};
//# sourceMappingURL=ConvoAudiosPlaylistContext.js.map