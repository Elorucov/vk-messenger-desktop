import * as Convo from '../../../core/model/Convo';
import * as Channel from '../../../core/model/Channel';
import * as Post from '../../../core/model/Post';
import { excludeTracksDoubling, getNextTrackFromPlaylist, getPrevTrackFromPlaylist, } from '../../env/AudioPlayer/utils';
import { exhaustivenessCheck, shuffleArray } from '../../../core/utils/misc';
import { toMessagedConvoVoiceTrackFromMessage } from '../../env/AudioPlayer/ConvoVoicesPlaylist';
export class ConvoAudiosPlaylist {
    list;
    shuffledList;
    meta;
    constructor(playlist) {
        this.list = playlist.list;
        this.shuffledList = shuffleArray(this.list);
        this.meta = playlist.meta;
    }
    getNext(audioTrack, isShuffled, repeatMode) {
        const list = isShuffled ? this.shuffledList : this.list;
        return getNextTrackFromPlaylist(audioTrack, list, repeatMode);
    }
    getPrev(audioTrack, isShuffled, repeatMode) {
        const list = isShuffled ? this.shuffledList : this.list;
        return getPrevTrackFromPlaylist(audioTrack, list, repeatMode);
    }
    getConvoAudiosList() {
        return this.list;
    }
    getConvoAudiosShuffledList() {
        return this.shuffledList;
    }
    getPlaylistMeta() {
        return this.meta;
    }
    shuffle() {
        this.shuffledList = shuffleArray(this.list);
    }
}
export function toConvoAudioTrack(progress, audio, source, isDense) {
    const thumb = getAudioThumb(audio.thumb, isDense ? 270 : 135);
    return {
        title: audio.title,
        artist: audio.artist,
        trackCode: audio.trackCode,
        accessKey: audio.accessKey,
        source,
        thumb,
        audioTrack: {
            id: `${audio.ownerId}_${audio.id}`,
            url: audio.url,
            progress,
            duration: audio.duration,
        },
    };
}
export function audioTrackSourceFromMessage(message) {
    if (message.kind === 'Foreign' && 'rootCmid' in message && message.rootCmid) {
        return {
            kind: 'message',
            cmid: message.rootCmid,
            peerId: message.rootPeerId,
        };
    }
    if (message.peerId) {
        return {
            kind: 'message',
            peerId: message.peerId,
            cmid: message.cmid,
        };
    }
    return;
}
function extractAudioAttachesFromMessage(message) {
    if (message.kind !== 'Normal' &&
        message.kind !== 'Queued' &&
        message.kind !== 'Foreign')
        return [];
    const messageAudios = extractAudioAttaches(message.attaches);
    const messageForwardedMessages = message.forwardedMessages;
    if (Array.isArray(messageForwardedMessages)) {
        messageForwardedMessages.reduce((acc, msg) => {
            acc.push(...extractAudioAttachesFromMessage(msg));
            return acc;
        }, messageAudios);
    }
    const messageRepliedMessage = message.replyMessage?.kind === 'ForeignExpired'
        ? undefined
        : message.replyMessage;
    if (messageRepliedMessage) {
        messageAudios.push(...extractAudioAttachesFromMessage(messageRepliedMessage));
    }
    return messageAudios;
}
function extractAudioAttachesFromPost(post) {
    return extractAudioAttaches(post.attaches);
}
function extractAudioAttachesFromComment(comment) {
    return extractAudioAttaches(comment.attaches);
}
function extractAudioAttaches(attaches) {
    const audios = [];
    if (Array.isArray(attaches.audios)) {
        audios.push(...attaches.audios);
    }
    // в плейлист аудиозаписей попадают как просто посланные аудио, так и аттачи со стены (если там есть треки)
    const wallAttachAudios = attaches.wall?.attaches.audios;
    if (Array.isArray(wallAttachAudios)) {
        audios.push(...wallAttachAudios);
    }
    return audios;
}
export function mapConvoToConvoAudioTrackList(convo, isDense) {
    const list = [];
    const messages = Convo.allHistoryNodes(convo).map((node) => ({
        message: node.item,
    }));
    for (const { message } of messages) {
        const isNormal = message.kind === 'Normal';
        const isQueued = message.kind === 'Queued';
        if (isNormal || isQueued) {
            const messageAudios = extractAudioAttachesFromMessage(message);
            const convoAudiosTrack = messageAudios.filter((audio) => !!audio.url);
            convoAudiosTrack.forEach((audio) => {
                list.push(toConvoAudioTrack(0, audio, message.kind === 'Normal'
                    ? audioTrackSourceFromMessage(message)
                    : undefined, isDense));
            });
        }
    }
    return excludeTracksDoubling(list);
}
export function mapChannelToConvoAudioTrackList(channel, isDense) {
    const list = [];
    const posts = Channel.allHistoryNodes(channel).map((node) => node.item);
    for (const post of posts) {
        const postAudios = extractAudioAttachesFromPost(post);
        const channelAudiosTrack = postAudios.filter((audio) => !!audio.url);
        channelAudiosTrack.forEach((audio) => {
            list.push(toConvoAudioTrack(0, audio, post.kind === 'Normal'
                ? {
                    kind: 'post',
                    cmid: post.cmid,
                    channelId: post.channelId,
                }
                : undefined, isDense));
        });
    }
    return excludeTracksDoubling(list);
}
export function mapPostCommentsToConvoAudioTrackList(post, isDense) {
    const list = [];
    const comments = Post.allNormalSpreadedComments(post);
    for (const comment of comments) {
        const commentAudios = extractAudioAttachesFromComment(comment);
        const commentAudiosTrack = commentAudios.filter((audio) => !!audio.url);
        commentAudiosTrack.forEach((audio) => {
            list.push(toConvoAudioTrack(0, audio, comment.kind === 'Normal'
                ? {
                    kind: 'comment',
                    postCmid: comment.postCmid,
                    channelId: comment.channelId,
                    commentCmid: comment.cmid,
                }
                : undefined, isDense));
        });
    }
    return excludeTracksDoubling(list);
}
export function mapConvoToConvoVoiceTrackList(convo) {
    const sequence = Convo.allHistoryNodes(convo).reduce((acc, { item: message }) => {
        if ((message.kind === 'Normal' || message.kind === 'Queued') &&
            message.attaches?.voice) {
            const fromMessage = message.kind === 'Normal' ? message : undefined;
            const sentAt = message.sentAt;
            const authorId = message.authorId;
            acc.push(toMessagedConvoVoiceTrackFromMessage(0, message.attaches.voice, sentAt, authorId, fromMessage));
        }
        else {
            acc.push(undefined); // разрывы в последовательности сообщений с голосовым аттачем для нас важны, так как мы воспроизводим подряд только голосовые, которые идут подряд
        }
        return acc;
    }, []);
    return sequence;
}
export function mapAudioTrackSourceToPlaylistMetaSource(source) {
    switch (source.kind) {
        case 'message': {
            return {
                kind: 'message',
                peerId: source.peerId,
            };
        }
        case 'post':
        case 'comment': {
            return {
                kind: 'channel',
                channelId: source.channelId,
            };
        }
        default:
            exhaustivenessCheck(source);
    }
}
export function isConvoAudioTrack(track) {
    if (!track || typeof track !== 'object') {
        return false;
    }
    const { title, artist, audioTrack, trackCode, source, thumb } = track;
    if (typeof title !== 'string' ||
        typeof artist !== 'string' ||
        !audioTrack ||
        typeof audioTrack !== 'object' ||
        typeof trackCode !== 'string' ||
        !source ||
        typeof source !== 'object' ||
        typeof thumb !== 'string') {
        return false;
    }
    const { url, id, duration, progress } = audioTrack;
    if (typeof url !== 'string' ||
        typeof id !== 'string' ||
        typeof duration !== 'number' ||
        typeof progress !== 'number') {
        return false;
    }
    switch (source.kind) {
        case 'message': {
            if (typeof source.cmid !== 'number' ||
                typeof source.peerId !== 'number') {
                return false;
            }
            break;
        }
        case 'post': {
            if (typeof source.cmid !== 'number' ||
                typeof source.channelId !== 'number') {
                return false;
            }
            break;
        }
        case 'comment': {
            if (typeof source.postCmid !== 'number' ||
                typeof source.channelId !== 'number' ||
                typeof source.commentCmid !== 'number') {
                return false;
            }
            break;
        }
        default:
            const _typeguard = source;
    }
    return true;
}
export function isRestoredConvoAudiosPlaylist(playlist) {
    if (playlist && typeof playlist === 'object') {
        const { meta, list } = playlist;
        let hasMeta = false;
        let hasList = false;
        if (meta && typeof meta === 'object') {
            const { source, type } = meta;
            const isTempMeta = type === 'temp';
            if (source && typeof source === 'object') {
                switch (source.kind) {
                    case 'message': {
                        hasMeta = typeof source.peerId === 'number' && isTempMeta;
                        break;
                    }
                    case 'channel': {
                        hasMeta = typeof source.channelId === 'number' && isTempMeta;
                        break;
                    }
                    default:
                        const _typeguard = source;
                }
            }
        }
        if (list && Array.isArray(list) && list.length) {
            hasList = !!list.filter((at) => isConvoAudioTrack(at)).length;
        }
        return hasMeta && hasList;
    }
    return false;
}
export function getAudioThumb(thumb, primarySize) {
    const primaryThumb = primarySize && thumb?.[`photo_${primarySize}`];
    if (primaryThumb) {
        return primaryThumb;
    }
    return (thumb?.photo_34 ||
        thumb?.photo_68 ||
        thumb?.photo_135 ||
        thumb?.photo_270 ||
        thumb?.photo_300 ||
        thumb?.photo_600 ||
        thumb?.photo_1200);
}
//# sourceMappingURL=ConvoAudiosPlaylist.js.map