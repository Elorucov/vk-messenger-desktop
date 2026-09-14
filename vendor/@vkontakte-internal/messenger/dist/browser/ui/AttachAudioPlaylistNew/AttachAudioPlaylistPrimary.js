import '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistPrimary.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import cx from 'classnames';
import { Button, Subhead } from '@vkontakte/vkui';
import { Icon16Pause, Icon16Play, Icon16ShuffleOutline, Icon56PlaylistOutline, } from '@vkontakte/icons';
import { AttachAudio, } from '../../ui/AttachAudio/AttachAudio';
import { useBrowserEnv } from '../../hooks/misc';
import { getAudioThumb, toConvoAudioTrack, } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
import { ConvoAudiosPlaylist } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
import { ConvoAudiosPlaylistContext } from '../../ui/Playlists/ConvoAudiosPlaylistContext';
import { AttachAudioPlaylistControlButton } from '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistControlButton';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useIsCompactPlaylist } from '../../ui/AttachAudioPlaylistNew/useIsCompactPlaylist';
const MAX_WIDTH = 400;
const MAX_WIDTH_COMPACT = 240;
export const AttachAudioPlaylistPrimary = ({ audios, title, titleText, author, description, footer, photoUrl, thumbs, isDense, isCompact: isCompactInitial, circlePhoto = false, attachAudioProps, playlistMeta, source, className, onWidthChange, }) => {
    const { lang, player } = useBrowserEnv();
    const ref = useRef(null);
    const isCompactValue = useIsCompactPlaylist(ref, isCompactInitial);
    // Status конкретно этого плейлиста внутри компонента
    const [playlistStatus, setPlaylistStatus] = useState('stopped');
    const playlistPlaying = playlistStatus === 'playing';
    const toggle = () => {
        const playerState = player.getState();
        switch (playlistStatus) {
            case 'playing':
                player.pause();
                break;
            case 'paused':
                const currentTrack = playerState.currentTrackEntity;
                if (currentTrack && audiosPlaylist)
                    player.play(currentTrack, audiosPlaylist);
                break;
            case 'stopped':
            case 'ended':
                if (!audiosPlaylist)
                    return;
                // Сбрасываем Shuffle, так как тут включаем плейлист с "чистого листа"
                player.setShuffle(false);
                const [audio] = audiosPlaylist.getConvoAudiosList();
                audio && player.play(audio, audiosPlaylist);
                break;
            default:
                exhaustivenessCheck(playlistStatus);
        }
    };
    // Находится ли текущий плейлист в глобальном плеере в данный момент
    const isCurrentPlaylistInPlayer = () => {
        const playerTrackId = player.getState().currentTrackEntity?.audioTrack.id;
        return playerTrackId && audiosPlaylistIdsMap[playerTrackId];
    };
    const shuffle = () => {
        player.setShuffle(true);
        audiosPlaylist.shuffle();
        const [audio] = audiosPlaylist.getConvoAudiosShuffledList();
        audio && player.play(audio, audiosPlaylist);
    };
    const handlePlayerStateUpdate = (state) => {
        // Если обновлся стейт плеера в текущем контексте плейлиста
        if (isCurrentPlaylistInPlayer()) {
            setPlaylistStatus(state.status);
        }
        else {
            setPlaylistStatus('stopped');
        }
    };
    useEffect(() => {
        // Если player был восстановлен из LocalStorage, то он не вызовет stateupdated
        // Поэтому, запустим один раз при первоначальном рендере компонента, чтобы выставить изначальные значения локальных стейтов
        handlePlayerStateUpdate(player.getState());
        player.subscribe('stateupdated', handlePlayerStateUpdate);
        return () => {
            player.unsubscribe('stateupdated', handlePlayerStateUpdate);
        };
        // Тут не нужен handlePlayerStateUpdate
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player]);
    useEffect(() => {
        onWidthChange?.(isCompactValue ? MAX_WIDTH_COMPACT : MAX_WIDTH, true);
    }, [onWidthChange, isCompactValue]);
    const playlistImage = useMemo(() => {
        if (photoUrl) {
            return React.createElement("img", { alt: titleText, src: photoUrl });
        }
        if (thumbs && thumbs.length >= 4) {
            return (React.createElement("figure", { className: "AttachAudioPlaylistPrimary__imageThumbs" }, thumbs.map((thumb, index) => (React.createElement("img", { key: index, alt: titleText, src: getAudioThumb(thumb, isDense ? 135 : 68) })))));
        }
        if (thumbs && thumbs.length) {
            return (React.createElement("img", { alt: titleText, src: getAudioThumb(thumbs[0], isDense ? 300 : 135) }));
        }
        return React.createElement(Icon56PlaylistOutline, null);
    }, [isDense, photoUrl, titleText, thumbs]);
    const audiosPlaylist = useMemo(() => {
        const list = audios
            .filter((audio) => !!audio.url)
            .map((audio) => toConvoAudioTrack(0, audio, source, isDense));
        return new ConvoAudiosPlaylist({
            list,
            meta: playlistMeta,
        });
    }, [source, audios, playlistMeta, isDense]);
    const audiosPlaylistIdsMap = useMemo(() => audiosPlaylist
        .getConvoAudiosList()
        .reduce((ids, { audioTrack }) => {
        ids[audioTrack.id] = true;
        return ids;
    }, {}), [audiosPlaylist]);
    const visibleAudios = useMemo(() => audios.slice(0, 5), [audios]);
    const playAriaLabel = lang.use('me_attach_playlist_play_aria_label');
    const pauseAriaLabel = lang.use('me_attach_playlist_play_aria_label');
    const isVisibleAudios = !!audios.length && !isCompactValue;
    const isVisibleFooter = !!footer && !isCompactValue;
    return (React.createElement("div", { className: cx(className, 'AttachAudioPlaylistPrimary MEAppThemeStylesContrastDisable', {
            'AttachAudioPlaylistPrimary--compact': isCompactValue,
        }), ref: ref },
        React.createElement("div", { className: "AttachAudioPlaylistPrimary__header" },
            React.createElement("div", { className: cx('AttachAudioPlaylistPrimary__image', {
                    'AttachAudioPlaylistPrimary__image--circle': circlePhoto,
                }) }, playlistImage),
            React.createElement("div", { className: "AttachAudioPlaylistPrimary__headerInfo" },
                author && (React.createElement("div", { className: "AttachAudioPlaylistPrimary__headerAuthor" }, author)),
                React.createElement("span", { className: "AttachAudioPlaylistPrimary__headerTitle" }, title),
                React.createElement(Subhead, { className: "AttachAudioPlaylistPrimary__headerDesc" }, description),
                audios.length > 0 && (React.createElement("div", { className: "AttachAudioPlaylistPrimary__headerControls" },
                    React.createElement(Button, { className: "AttachAudioPlaylistPrimary__playBtn", appearance: "overlay", "aria-label": playlistPlaying ? playAriaLabel : pauseAriaLabel, onClick: toggle, before: playlistPlaying ? React.createElement(Icon16Pause, null) : React.createElement(Icon16Play, null) }, lang.use('me_attach_playlist_play_btn_title')),
                    React.createElement(AttachAudioPlaylistControlButton, { ariaLabel: lang.use('me_attach_playlist_shuffle_aria_label'), onClick: shuffle },
                        React.createElement(Icon16ShuffleOutline, null)))))),
        isVisibleAudios && (React.createElement("div", { className: "AttachAudioPlaylistPrimary__tracks" },
            React.createElement(AudiosPlaylistProvider, { playlist: audiosPlaylist }, visibleAudios.map((audio) => (React.createElement(AttachAudio, { key: audio.id, audio: audio, source: source, withDuration: true, isOut: attachAudioProps?.isOut ?? false, isInBubble: attachAudioProps?.isInBubble ?? false, ...attachAudioProps })))))),
        isVisibleFooter && (React.createElement("div", { className: "AttachAudioPlaylistPrimary__footer" }, footer))));
};
/**
 * Мы воспроизводим треки из плейлистов в отдельном контексте, не смешивая их с треками всей беседы
 */
const AudiosPlaylistProvider = ({ children, playlist }) => {
    const getPlaylist = useCallback(() => playlist, [playlist]);
    return (React.createElement(ConvoAudiosPlaylistContext.Provider, { value: getPlaylist }, children));
};
//# sourceMappingURL=AttachAudioPlaylistPrimary.js.map