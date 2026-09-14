import { getNextTrackFromPlaylist, getPrevTrackFromPlaylist, } from '../../env/AudioPlayer/utils';
export class ConvoVoicesPlaylist {
    list;
    source;
    constructor(sequence, currentConvoVoiceTrack, source) {
        this.source = source;
        // убираем разрывы и преобразуем в двумерный массив (каждый массив - непрерывная последовательность голосовых)
        const allSequencesWithoutBreak = [];
        let sequenceWithoutBreak;
        for (let i = 0; i < sequence.length; i++) {
            const voice = sequence[i];
            if (voice) {
                if (!Array.isArray(sequenceWithoutBreak)) {
                    sequenceWithoutBreak = [];
                }
                sequenceWithoutBreak.push(voice);
            }
            else {
                if (Array.isArray(sequenceWithoutBreak)) {
                    allSequencesWithoutBreak.push(sequenceWithoutBreak);
                    sequenceWithoutBreak = undefined;
                }
            }
            // edge кейс - последний элемент, нужно не забыть добавить в allSequencesWithoutBreak последнюю последовательность
            if (i === sequence.length - 1 && Array.isArray(sequenceWithoutBreak)) {
                allSequencesWithoutBreak.push(sequenceWithoutBreak);
            }
        }
        // находим последовательность, к которой принадлежит текущий голосовой currentConvoVoiceTrack
        this.list =
            allSequencesWithoutBreak.find((sequence) => sequence.find((convoVoiceTrack) => convoVoiceTrack.audioTrack.id ===
                currentConvoVoiceTrack.audioTrack.id)) || [];
    }
    getNext(currentTrackEntity) {
        return getNextTrackFromPlaylist(currentTrackEntity, this.list);
    }
    getPrev(currentTrackEntity) {
        return getPrevTrackFromPlaylist(currentTrackEntity, this.list);
    }
    getPlaylistMeta() {
        const type = 'voices';
        return {
            type,
            source: this.source,
        };
    }
}
export function toMessagedConvoVoiceTrackFromMessage(progress, voice, sentAt, authorId, message) {
    const url = isOpusSupported() ? voice.linkOgg : voice.linkMp3;
    const urlOgg = voice.linkOgg;
    const isForeign = message?.kind === 'Foreign';
    let fromMessage;
    if (isForeign && 'rootCmid' in message && message.rootCmid) {
        fromMessage = {
            cmid: message.rootCmid,
            peerId: message.rootPeerId,
        };
    }
    else if (message && message.cmid && message.peerId) {
        fromMessage = {
            cmid: message.cmid,
            peerId: message.peerId,
        };
    }
    return {
        kind: 'MessagedConvoVoiceTrack',
        sentAt,
        authorId,
        source: fromMessage && {
            kind: 'message',
            ...fromMessage,
        },
        urlOgg,
        audioTrack: {
            duration: voice.duration,
            progress,
            url: url,
            id: `${voice.ownerId}_${voice.id}`,
        },
    };
}
export function toRecordedConvoVoiceTrack(progress, voice, viewerId) {
    const url = isOpusSupported() ? voice.linkOgg : voice.linkMp3;
    return {
        kind: 'RecordedConvoVoiceTrack',
        authorId: viewerId,
        audioTrack: {
            duration: voice.duration,
            progress,
            url: url,
            id: `${voice.ownerId}_${voice.id}`,
        },
    };
}
/**
 * ogg в приоритете при прослушивании
 *
 * На Сафари ogg не поддерживается, фолбечимся на mp3
 */
function isOpusSupported() {
    const MIME_OGG = 'audio/ogg;codecs="opus"';
    const audio = document.createElement('audio');
    /**
     * audio.canPlayType возвращает "" | "maybe" | "probably"
     * Кодек opus поддерживается, если вернулось непустое значение
     */
    return !!audio.canPlayType(MIME_OGG);
}
//# sourceMappingURL=ConvoVoicesPlaylist.js.map