import '../../ui/ConvoPlayer/ConvoPlayer.css';
import React, { useMemo, useRef, useState } from 'react';
import { Image, Cell } from '@vkontakte/vkui';
import cx from 'classnames';
import { Icon20Pause, Icon20Play, Icon20SkipBack, Icon24VolumeOutline, Icon24MuteOutline, Icon20SkipForward, Icon24Shuffle, Icon24Repeat, Icon24RepeatOne, Icon24Cancel, } from '@vkontakte/icons';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { isSameYear } from '../../../core/utils/misc';
import { RangeInput } from '../../ui/RangeInput/RangeInput';
import { useBrowserEnv } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const ConvoPlayer = (props) => {
    const { progress, status, thumb, volume, duration, playbackRate, title, subTitle, restedTime, isMuted, isShuffled, repeatMode, availablePlaybackRates, onPlay, onPause, onMute, onShuffle, onVolumeChange, onDescriptionClick, onCancelClick, onSkipForward, onSkipBack, onProgressChange, onRepeatModeChange, onPlaybackRateChange, } = props;
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const isDesktop = !isMobileLayout;
    const [seekProgress, setSeekProgress] = useState(null);
    const isSeeking = typeof seekProgress === 'number'; // во время перемотки смотрим не на прогресс из плеера, а на прогресс из прогрессбара (если сразу перематывать - то будет звучать как зажёванная пластинка)
    const progressBarValue = isSeeking ? seekProgress : progress;
    const restedTimeValue = isSeeking && duration ? duration * (1 - seekProgress) : restedTime;
    const hasRestedTime = typeof restedTimeValue === 'number';
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "ConvoPlayer" },
            React.createElement("div", { className: "ConvoPlayer__controls" },
                React.createElement("button", { className: cx('ConvoPlayer__control', !onSkipBack && 'ConvoPlayer__control--disabled'), onClick: onSkipBack, "aria-label": lang.use('me_convo_player_back') },
                    React.createElement(Icon20SkipBack, null)),
                status === 'playing' ? (React.createElement("button", { className: "ConvoPlayer__control", onClick: onPause, "aria-label": lang.use('me_convo_player_pause') },
                    React.createElement(Icon20Pause, null))) : (React.createElement("button", { className: "ConvoPlayer__control", onClick: onPlay, "aria-label": lang.use('me_convo_player_play') },
                    React.createElement(Icon20Play, null))),
                React.createElement("button", { className: cx('ConvoPlayer__control', !onSkipForward && 'ConvoPlayer__control--disabled'), onClick: onSkipForward, "aria-label": lang.use('me_convo_player_forward') },
                    React.createElement(Icon20SkipForward, null))),
            React.createElement(Cell, { className: "ConvoPlayer__info", hoverMode: "ConvoPlayer__info--hovered", hasHover: true, hasActive: false, subtitle: React.createElement("div", { "aria-label": lang.use('me_convo_player_subtitle') }, subTitle), onClick: onDescriptionClick, before: thumb && React.createElement(Image, { size: 34, src: thumb }) }, title),
            isDesktop && hasRestedTime && (React.createElement("div", { className: "ConvoPlayer__estimateTime" }, secondsToTime(restedTimeValue))),
            onPlaybackRateChange && playbackRate && availablePlaybackRates && (React.createElement(Dropdown, { hideOnClick: true, adaptive: true, openType: "click", content: React.createElement(ActionsMenu, null, availablePlaybackRates.map((playbackRate) => (React.createElement(ActionsMenuAction, { key: playbackRate, type: "secondary", title: playbackRate + 'x', onClick: () => onPlaybackRateChange(playbackRate) })))), forceUpdateContent: true, align: "center", position: "bottom" },
                React.createElement("button", { className: "ConvoPlayer__playbackRate", "aria-label": lang.use('me_convo_player_playback_rate') },
                    React.createElement("div", { className: "ConvoPlayer__playbackRateValue" },
                        playbackRate,
                        "x")))),
            isDesktop && onShuffle && (React.createElement("button", { className: cx('ConvoPlayer__shuffle', isShuffled && 'ConvoPlayer__shuffle--active'), onClick: () => onShuffle(!isShuffled), "aria-label": lang.use('me_convo_player_shuffle') },
                React.createElement(Icon24Shuffle, null))),
            isDesktop && onRepeatModeChange && (React.createElement(React.Fragment, null,
                repeatMode === 'none' && (React.createElement("button", { onClick: () => onRepeatModeChange('all'), className: "ConvoPlayer__repeat", "aria-label": lang.use('me_convo_player_repeat_all') },
                    React.createElement(Icon24Repeat, null))),
                repeatMode === 'all' && (React.createElement("button", { onClick: () => onRepeatModeChange('one'), className: "ConvoPlayer__repeat ConvoPlayer__repeat--active", "aria-label": lang.use('me_convo_player_repeat_one') },
                    React.createElement(Icon24Repeat, null))),
                repeatMode === 'one' && (React.createElement("button", { onClick: () => onRepeatModeChange('none'), className: "ConvoPlayer__repeat ConvoPlayer__repeat--active", "aria-label": lang.use('me_convo_player_repeat_none') },
                    React.createElement(Icon24RepeatOne, null))))),
            isDesktop && (React.createElement("div", { className: "ConvoPlayer__volume" },
                isMuted ? (React.createElement("button", { className: "ConvoPlayer__mute", onClick: () => onMute?.(false), "aria-label": lang.use('me_convo_player_unmute') },
                    React.createElement(Icon24MuteOutline, null))) : (React.createElement("button", { className: "ConvoPlayer__mute", onClick: () => onMute?.(true), "aria-label": lang.use('me_convo_player_mute') }, volume > 0 ? React.createElement(Icon24VolumeOutline, null) : React.createElement(Icon24MuteOutline, null))),
                React.createElement(VolumeControl, { onChange: onVolumeChange, value: isMuted ? 0 : volume, onMute: (val) => {
                        onVolumeChange(val);
                        onMute?.(true);
                    } }))),
            React.createElement("button", { className: "ConvoPlayer__close", onClick: onCancelClick, "aria-label": lang.use('me_convo_player_close') },
                React.createElement(Icon24Cancel, null))),
        React.createElement(RangeInput, { onChangeStart: onProgressChange && setSeekProgress, onChange: onProgressChange && setSeekProgress, onChangeEnd: onProgressChange &&
                ((val) => {
                    onProgressChange(val);
                    setSeekProgress(null);
                }), rangeClassName: cx('ConvoPlayer__progress', onProgressChange && 'ConvoPlayer__progress-interactive') },
            React.createElement("div", { className: 'ConvoPlayer__progressState', style: { width: `${progressBarValue * 100}%` } }))));
};
export const AVAILABLE_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
export const secondsToTime = (e) => {
    const m = Math.floor((e % 3600) / 60)
        .toString()
        .padStart(2, '0'), s = Math.floor(e % 60)
        .toString()
        .padStart(2, '0');
    return m + ':' + s;
};
export function getUserFriendlyTimestamp(lang, now, timestamp) {
    return `${lang.use(isSameYear(now, timestamp) ? 'global_short_date' : 'global_date', {
        now,
        date: timestamp,
    })} в ${lang.formatDate(timestamp, {
        now,
        variant: 'time',
    })}`;
}
export function useCanSkipForwardAndBackward(isShuffled, repeatMode, currentTrackEntity, playlist) {
    const currentTrackEntityRef = useRef(currentTrackEntity);
    currentTrackEntityRef.current = currentTrackEntity;
    const id = currentTrackEntity?.audioTrack?.id;
    const skipDirections = useMemo(() => {
        if (!currentTrackEntityRef.current || !id || !playlist) {
            return { canSkipBackward: false, canSkipForward: false };
        }
        let canSkipBackward = false;
        let canSkipForward = false;
        if (playlist.getNext(currentTrackEntityRef.current, isShuffled, repeatMode)) {
            canSkipForward = true;
        }
        if (playlist.getPrev(currentTrackEntityRef.current, isShuffled, repeatMode)) {
            canSkipBackward = true;
        }
        return { canSkipBackward, canSkipForward };
    }, [isShuffled, playlist, repeatMode, id]);
    return skipDirections;
}
const VolumeControl = (props) => {
    const { value, onChange, onMute } = props;
    const prevValue = useRef(value);
    const [isActive, setIsActive] = useState(false);
    const handleChangeStart = () => {
        prevValue.current = value;
        setIsActive(true);
    };
    const handleChangeEnd = (val) => {
        if (val === 0) {
            onMute(prevValue.current);
        }
        setIsActive(false);
    };
    const handleChange = (val) => onChange(val * 100);
    return (React.createElement(RangeInput, { rangeClassName: cx('ConvoPlayer__volumeRange', isActive && 'ConvoPlayer__volumeRange--active'), onChange: handleChange, onChangeStart: handleChangeStart, onChangeEnd: handleChangeEnd },
        React.createElement("div", { className: "ConvoPlayer__volumeValue", style: { width: `${value}%` } })));
};
//# sourceMappingURL=ConvoPlayer.js.map