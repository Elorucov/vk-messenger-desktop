import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import { toVideoMessageTrack } from '../../env/VideoMessagePlayer/utils';
import { MAX_VIDEO_FORWARD_LEVEL } from '../../../core/config/config';
export class ConvoVideoMessagesPlaylist {
    convo;
    playlist;
    constructor(convo) {
        this.convo = convo;
        this.playlist = Convo.allConfirmedHistoryNodes(convo)
            .map(({ item }) => item)
            .sort(({ cmid: cmidA }, { cmid: cmidB }) => cmidB - cmidA)
            .reduce((playlist, message) => {
            if (message.kind !== 'Normal') {
                return playlist;
            }
            return playlist.concat(getVideoMessageTracksFromMessage(message));
        }, []);
    }
    getNext(videoMessageTrack) {
        const currentTrackIndex = this.playlist.findIndex((playlistTrack) => playlistTrack.id === videoMessageTrack.id);
        return this.playlist[currentTrackIndex - 1];
    }
    getPrev(videoMessageTrack) {
        const currentTrackIndex = this.playlist.findIndex((playlistTrack) => playlistTrack.id === videoMessageTrack.id);
        return this.playlist[currentTrackIndex + 1];
    }
    getPlaylistMeta() {
        const type = 'videomessages';
        return {
            type,
            source: {
                kind: 'message',
                peerId: this.convo.peerId,
            },
        };
    }
}
/**
 * Рекурсивная функция для извлечения всех видеосообщений из самого сообщения и цепочки форвардов
 */
function getVideoMessageTracksFromMessage(message, currentForwardLevel = 0) {
    const videoMessageTracks = [];
    const videoMessageTrackFromMessage = messageToVideoMessageTrack(message);
    if (videoMessageTrackFromMessage) {
        videoMessageTracks.push(videoMessageTrackFromMessage);
    }
    if (!message.forwardedMessages ||
        currentForwardLevel >= MAX_VIDEO_FORWARD_LEVEL) {
        return videoMessageTracks;
    }
    const videoMessageTracksFromForwarded = [...message.forwardedMessages]
        .reverse()
        .reduce((videoMessageTracks, forwardedMessage) => {
        const forwardedVideoMessageTracks = getVideoMessageTracksFromMessage(forwardedMessage, ++currentForwardLevel);
        if (forwardedVideoMessageTracks.length) {
            return videoMessageTracks.concat(forwardedVideoMessageTracks);
        }
        return videoMessageTracks;
    }, []);
    return videoMessageTracks.concat(videoMessageTracksFromForwarded);
}
function messageToVideoMessageTrack(message) {
    if (!message.attaches.videoMessage) {
        return null;
    }
    if (!Peer.isUserPeerId(message.authorId) &&
        !Peer.isGroupPeerId(message.authorId)) {
        return null;
    }
    const rootMessageId = message.kind === 'Foreign' && 'rootCmid' in message
        ? message.rootCmid
        : message.cmid;
    return toVideoMessageTrack(0, message.attaches.videoMessage, rootMessageId, message.sentAt, message.authorId);
}
//# sourceMappingURL=ConvoVideoMessagesPlaylist.js.map