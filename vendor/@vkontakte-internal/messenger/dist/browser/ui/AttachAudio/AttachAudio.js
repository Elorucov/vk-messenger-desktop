import '../../ui/AttachAudio/AttachAudio.css';
import React, { useCallback, useEffect, useState, useContext, useRef, } from 'react';
import cx from 'classnames';
import { formatDuration } from '../../../core/utils/misc';
import { useBrowserEnv, usePixelDensity, useViewer } from '../../hooks/misc';
import { ConvoAudiosPlaylistContext } from '../../ui/Playlists/ConvoAudiosPlaylistContext';
import { getAudioThumb, toConvoAudioTrack, } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
import { useRouter } from '../../ui/Router/Router';
import { Icon12Explicit, Icon20More, Icon20PauseCircle, Icon20PlayCircle, Icon20SongOutline, Icon28SongOutline, Icon28Pause, Icon28Play, } from '@vkontakte/icons';
import { Headline, Footnote, Subhead, useColorScheme } from '@vkontakte/vkui';
import { useHover } from '../../hooks/useHover';
import { AttachAudioSoundBar } from './AttachAudioSoundBar';
import { ProgressCircle } from '../../ui/ProgressCircle/ProgressCircle';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu } from '../../ui/ActionsMenu/ActionsMenu';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const AttachAudio = React.memo(function AttachAudio({ audio, withPhoto = true, isOut, isInBubble, isPrimary, actions, className, withDuration, highlightActiveTrackTitle, source, onWidthChange, }) {
    const isInOutBubble = isInBubble && isOut;
    const isRestricted = Boolean(audio.contentRestricted);
    return isRestricted ? (React.createElement(AttachAudioRestricted, { audio: audio, withPhoto: withPhoto, isInOutBubble: isInOutBubble, isPrimary: isPrimary, className: className, withDuration: withDuration, highlightActiveTrackTitle: highlightActiveTrackTitle, onWidthChange: onWidthChange })) : (React.createElement(AttachAudioPermitted, { audio: audio, withPhoto: withPhoto, isInOutBubble: isInOutBubble, isPrimary: isPrimary, actions: actions, className: className, withDuration: withDuration, highlightActiveTrackTitle: highlightActiveTrackTitle, source: source, onWidthChange: onWidthChange }));
});
export const AttachAudioPermitted = React.memo(function AttachAudio({ audio, withPhoto, isInOutBubble, isPrimary, actions, className, withDuration, highlightActiveTrackTitle, source, onWidthChange, }) {
    const { player } = useBrowserEnv();
    const getConvoAudiosPlaylist = useContext(ConvoAudiosPlaylistContext);
    const isDense = usePixelDensity();
    const [status, setStatus] = useState('stopped');
    const [progress, setProgress] = useState(0);
    const id = useRef(`${audio.ownerId}_${audio.id}`);
    const handlePlayerStateUpdate = useCallback((state) => {
        const { currentTrackEntity, status } = state;
        if (currentTrackEntity?.audioTrack &&
            currentTrackEntity.audioTrack.id === id.current) {
            const { progress } = currentTrackEntity.audioTrack;
            setStatus(status);
            setProgress(progress);
        }
        else {
            setStatus('stopped');
            setProgress(0);
        }
    }, []);
    useEffect(() => {
        player.subscribe('stateupdated', handlePlayerStateUpdate);
        return () => {
            player.unsubscribe('stateupdated', handlePlayerStateUpdate);
        };
    }, [audio, handlePlayerStateUpdate, player]);
    // синхронизируемся с состоянием плеера при маунте
    useEffect(() => {
        handlePlayerStateUpdate(player.getState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /**
     * Обработчик клика по кнопке
     */
    const toggle = useCallback((e) => {
        if (!audio.url) {
            return;
        }
        if (status === 'playing') {
            player.pause();
        }
        else {
            const playlist = getConvoAudiosPlaylist();
            player.play(toConvoAudioTrack(progress, 
            // @ts-expect-error: TS почему-то не учитывает проверку на audio.url выше
            audio, source, isDense), playlist);
        }
        e.preventDefault();
    }, [audio, status, player, getConvoAudiosPlaylist, progress, source, isDense]);
    return (React.createElement(AttachAudioSkin, { audio: audio, progress: progress, status: status, isInOutBubble: isInOutBubble, isPrimary: isPrimary, actions: actions, onClick: toggle, withPhoto: withPhoto, className: className, withDuration: withDuration, highlightActiveTrackTitle: highlightActiveTrackTitle, onWidthChange: onWidthChange }));
});
function AttachAudioRestricted({ audio, withPhoto, isInOutBubble, isPrimary, className, withDuration, highlightActiveTrackTitle, onWidthChange, }) {
    const { navigate } = useRouter();
    const showRestrictionModal = () => {
        navigate({
            kind: 'AudioRestrictionRuntimeRoute',
            audio,
        });
    };
    return (React.createElement(AttachAudioSkin, { progress: 0, audio: audio, status: "stopped", isInOutBubble: isInOutBubble, isPrimary: isPrimary, withPhoto: withPhoto, withDuration: withDuration, highlightActiveTrackTitle: highlightActiveTrackTitle, className: cx('AttachAudio__restricted', className), onClick: showRestrictionModal, onWidthChange: onWidthChange }));
}
export const AttachAudioSkin = ({ progress, audio, status, withPhoto, isInOutBubble, isPrimary, className, withDuration, highlightActiveTrackTitle, actions, onClick, onWidthChange, }) => {
    const { lang, vkcom_me } = useBrowserEnv();
    const isDense = usePixelDensity();
    const isDarkTheme = useColorScheme() === 'dark';
    const { settings } = useViewer();
    const { artist, title, duration, id, ownerId, isExplicit, rightholderMarks, thumb, } = audio;
    const fastActionsTrigger = useFastActionsTrigger();
    const shouldRenderUMAbutton = settings.hasAudioMetaInfo && vkcom_me?.onGetUMAInfo;
    const attachAudioArtist = rightholderMarks
        ? `${rightholderMarks.map((value) => `[${value}]`).join('')}, ${artist}`
        : artist;
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const [itemElement, setItemElement] = useState(null);
    const PauseIcon = isPrimary ? Icon28Pause : Icon20PauseCircle;
    const PlayIcon = isPrimary ? Icon28Play : Icon20PlayCircle;
    const SondIcon = isPrimary ? Icon28SongOutline : Icon20SongOutline;
    const DurationText = isPrimary ? Subhead : Footnote;
    const [ref, isHover] = useHover();
    const isStatusActive = status === 'playing' || status === 'paused';
    const thumbSize = isDense ? 135 : 68;
    const thumbSizePrimary = isDense ? 270 : 135;
    const thumbSrc = getAudioThumb(thumb, isPrimary ? thumbSizePrimary : thumbSize);
    const isHighlightActiveTrackTitle = highlightActiveTrackTitle && isStatusActive;
    const renderAlbumImg = () => {
        if (thumb) {
            return (React.createElement("img", { className: "AttachAudio__albumImg", alt: `${title} — ${artist}`, "aria-hidden": true, src: thumbSrc }));
        }
        return (React.createElement("div", { className: "AttachAudio__albumImg AttachAudio__albumImg--placeholder" }, !isHover && !isStatusActive && React.createElement(SondIcon, null)));
    };
    const renderControls = () => {
        const renderIcon = () => {
            const playAriaLabel = lang.use('me_attach_track_play_aria_label');
            const pauseAriaLabel = lang.use('me_attach_track_play_aria_label');
            if (status === 'playing') {
                return ((isHover || isPrimary) && React.createElement(PauseIcon, { "aria-label": pauseAriaLabel }));
            }
            if (status === 'paused') {
                return (isHover || isPrimary) && React.createElement(PlayIcon, { "aria-label": playAriaLabel });
            }
            if (status === 'stopped') {
                return isHover && React.createElement(PlayIcon, { "aria-label": playAriaLabel });
            }
            return undefined;
        };
        const isVisibleBackdrop = isStatusActive || isHover;
        return (React.createElement("div", { className: "AttachAudio__albumControls" },
            React.createElement("div", { className: cx('AttachAudio__albumControlsBackdrop', {
                    'AttachAudio__albumControlsBackdrop--show': isVisibleBackdrop,
                }) }),
            React.createElement("div", { className: "AttachAudio__albumControlsIcon" }, renderIcon()),
            !isPrimary && isStatusActive && (React.createElement(AttachAudioSoundBar, { isActive: status === 'playing', className: cx('AttachAudio__albumControlsBar', {
                    'AttachAudio__albumControlsBar--hide': isHover,
                }) })),
            isPrimary && isStatusActive && (React.createElement(ProgressCircle, { className: "AttachAudio__albumControlsProgress", progress: Number((progress * 100).toFixed(2)), size: 46, ariaLabel: lang.use('me_attach_track_progress_aria_label') }))));
    };
    useEffect(() => {
        // Ограничиваем ширину сообщения
        if (isPrimary) {
            const ATTACH_AUDIO_PRIMARY_WIDTH = 220;
            onWidthChange?.(ATTACH_AUDIO_PRIMARY_WIDTH);
        }
    }, [isPrimary, onWidthChange]);
    const handleOpenUMAModal = (event) => {
        event.stopPropagation();
        if (!vkcom_me?.onGetUMAInfo) {
            return;
        }
        vkcom_me.onGetUMAInfo({ id, owner_id: ownerId });
    };
    return (React.createElement("button", { ref: (node) => {
            ref(node);
            setItemElement(node);
        }, className: cx('AttachAudio', className, {
            'AttachAudio--dark': isDarkTheme,
            'AttachAudio--out': isInOutBubble,
            'AttachAudio--primary MEAppThemeStylesContrastDisable': isPrimary,
        }), onClick: onClick },
        withPhoto && (React.createElement("div", { className: "AttachAudio__album" },
            renderAlbumImg(),
            renderControls())),
        React.createElement("div", { className: "AttachAudio__info" },
            React.createElement(Headline, { level: isPrimary ? '1' : '2', weight: isPrimary ? '2' : '3', className: "AttachAudio__title", Component: "div", useAccentWeight: true },
                isHighlightActiveTrackTitle && (React.createElement(AttachAudioSoundBar, { isActive: status === 'playing', color: "var(--vkui--color_text_accent)" })),
                React.createElement("span", { className: cx('AttachAudio__titleText', {
                        'AttachAudio__titleText--highlight': isHighlightActiveTrackTitle,
                    }) }, title),
                isExplicit && (React.createElement("span", { className: "AttachAudio__titleExplicit", "aria-label": lang.use('me_attach_track_explicit_aria_label') },
                    React.createElement(Icon12Explicit, null)))),
            isPrimary ? (React.createElement(Subhead, { className: "AttachAudio__artist" }, attachAudioArtist)) : (React.createElement(Footnote, { className: "AttachAudio__artist" }, attachAudioArtist))),
        withDuration && (React.createElement(DurationText, { className: "AttachAudio__duration" },
            React.createElement("span", { role: "timer", className: "AttachAudio__durationProgress", "aria-label": lang.use('me_attach_track_time_left_aria_label') }, isStatusActive
                ? formatDurationProgress(progress, duration)
                : formatDuration(duration)))),
        actions && fastActionsTrigger.button && (React.createElement("div", { className: "AttachAudio__actions" },
            React.createElement(Dropdown, { open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, classNames: {
                    wrapper: cx('AttachAudio__dropdown', {
                        'AttachAudio__dropdown--open': fastActionsTrigger.button === 'tap',
                    }),
                    wrapperOpened: 'AttachAudio__dropdown--open',
                }, content: React.createElement(ActionsMenu, null, actions), align: "center", position: "bottom", adaptive: true, hideOnClick: true, openType: fastActionsTrigger.button === 'tap' ? 'click' : 'hover' },
                React.createElement("button", { className: "AttachAudio__action", "aria-label": lang.use('me_actions_more') },
                    fastActionsTrigger.button === 'tap' && (React.createElement("div", { className: "AttachAudio__actionTapArea" })),
                    React.createElement(Icon20More, null))))),
        actions && fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: { current: itemElement }, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, allowNativeContextMenu: true, content: React.createElement(ActionsMenu, null, actions) })),
        shouldRenderUMAbutton && (React.createElement("button", { className: "AttachAudio__umaButton", onClick: handleOpenUMAModal }, "UMA"))));
};
function formatDurationProgress(progress, duration) {
    return formatDuration(Math.ceil(duration * progress));
}
//# sourceMappingURL=AttachAudio.js.map