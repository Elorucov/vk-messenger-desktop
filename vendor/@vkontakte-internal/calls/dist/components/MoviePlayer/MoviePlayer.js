import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}],"video":["global",{"className":1}],"Icon64PauseButton":["@vkontakte-internal/icons-private",{"className":1}],"Icon64PlayButton":["@vkontakte-internal/icons-private",{"className":1}],"Icon24Pause":["@vkontakte/icons",{"className":1}],"Icon24Play":["@vkontakte/icons",{"className":1}]} */
import { memo, useCallback, useEffect, useState } from 'react';
import { PlayTime } from './PlayTime';
import { PlayTimeProgress } from './PlayTimeProgress';
import { Volume } from './Volume';
import { Icon16Cancel, Icon24Pause, Icon24Play } from '@vkontakte/icons';
import { Icon64PauseButton, Icon64PlayButton, Icon20LiveBadge } from '@vkontakte-internal/icons-private';
import { classNames as cn, isUndefined } from '@vkontakte/vkjs';
import { useContainerControlsVisibility } from '../../hooks/useContainerControlsVisibility';
import { useMovieStream } from './useMovieStream';
import { MediaType } from '@vkontakte/calls-sdk';
import { IconButton } from '@vkontakte-internal/vkcom-kit';
import { KeyboardCodes } from '@vkontakte-internal/calls-core';
/** плеер для проигрывания видео в окне оратора */
const MoviePlayerComponent = ({ title, current, total, isEditable, onRewind, volumeValue, onChangeVolume, vkMovieId, onPause, onPlay, onRemove, streamData, isPlayed, handleShowCallControls, isMovieStreamEnabled, mode, onMute, onUnMute, isMuted, className, isMovieOwner, }) => {
    const isMovie = mode === MediaType.MOVIE;
    const isLive = mode === MediaType.STREAM;
    const { videoRef } = useMovieStream(streamData?.data);
    const [isRewindButtonPushed, setIsRewindButtonPushed] = useState(false);
    const { isShowControls, handleMouseLeave, handleMouseMove, handleMouseOver, handleShowControls, handleFocusCaptured, handleBlurCaptured, } = useContainerControlsVisibility();
    const showControls = () => {
        handleShowControls();
        handleShowCallControls?.();
    };
    /** коллбек переключения состояния проигрывания */
    const togglePlay = useCallback(() => {
        if (!isEditable) {
            return;
        }
        if (!isShowControls) {
            showControls();
        }
        if (isPlayed) {
            onPause?.(vkMovieId);
        }
        else {
            onPlay?.(vkMovieId);
        }
    }, [
        onPause,
        onPlay,
        isPlayed,
        isShowControls,
        handleShowControls,
        handleShowCallControls,
        vkMovieId,
        isEditable,
    ]);
    const toggleRemove = useCallback(() => {
        onRemove?.(vkMovieId);
    }, [onRemove, vkMovieId]);
    const handleKeyDown = (e) => {
        const keyDownInsidePlayer = !!e?.target?.closest?.('.CallsMoviePlayer');
        if (!(e?.target?.localName === 'body' || keyDownInsidePlayer) || !isEditable) {
            return;
        }
        switch (e.code) {
            case KeyboardCodes.Space: {
                togglePlay();
                break;
            }
            case KeyboardCodes.ArrowDown: {
                const nextVolumeValue = !isUndefined(volumeValue) && volumeValue > 0.05 ? volumeValue - 0.05 : 0;
                onChangeVolume(vkMovieId, nextVolumeValue, isMuted);
                showControls();
                break;
            }
            case KeyboardCodes.ArrowUp: {
                const nextVolumeValue = !isUndefined(volumeValue) && volumeValue < 0.95 ? volumeValue + 0.05 : 1;
                onChangeVolume(vkMovieId, nextVolumeValue, isMuted);
                showControls();
                break;
            }
            case KeyboardCodes.ArrowLeft: {
                const nextPlaytime = current > 10 ? current - 10 : 0;
                onRewind?.(vkMovieId, nextPlaytime);
                showControls();
                break;
            }
            case KeyboardCodes.ArrowRight: {
                const nextPlaytime = current < total - 10 ? current + 10 : total;
                onRewind?.(vkMovieId, nextPlaytime);
                showControls();
                break;
            }
        }
        if (e?.target?.localName === 'body' && e.code === KeyboardCodes.Space && isEditable) {
            togglePlay();
        }
    };
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditable, onPlay, onPause, isPlayed, volumeValue, current]);
    useEffect(() => {
        if (!isMovieStreamEnabled && isMovieOwner) {
            toggleRemove();
        }
    }, [isMovieOwner, isMovieStreamEnabled, toggleRemove]);
    const mainPlayClasses = cn('CallsMoviePlayer__playPauseMain', 'CallsMoviePlayer__opacity');
    const _current = isLive ? 100 : current;
    const _total = isLive ? 100 : total;
    return (_jsxs("div", { className: cn(className, 'CallsMoviePlayer', {
            'CallsMoviePlayer--rewindNow': isRewindButtonPushed,
            'CallsMoviePlayer--editable': isEditable,
            'CallsMoviePlayer__show-controls': isShowControls || isRewindButtonPushed,
        }), onMouseOver: handleMouseOver, onMouseLeave: handleMouseLeave, onMouseMove: handleMouseMove, onFocusCapture: handleFocusCaptured, onBlurCapture: handleBlurCaptured, children: [_jsx("video", { ref: videoRef, className: "CallsMoviePlayer__video", controls: false, crossOrigin: "anonymous", playsInline: true, muted: true, onClick: togglePlay }), isPlayed && isEditable && (_jsx(Icon64PauseButton, { "data-testid": "calls_watch_together_player_pause", className: mainPlayClasses, onClick: togglePlay })), !isPlayed && isEditable && (_jsx(Icon64PlayButton, { "data-testid": "calls_watch_together_player_play", className: mainPlayClasses, onClick: togglePlay })), _jsx("div", { className: cn('CallsMoviePlayer__title', 'CallsMoviePlayer__opacity'), "data-testid": "calls_watch_together_player_title", children: title }), _jsxs("div", { className: cn('CallsMoviePlayer__controls', 'CallsMoviePlayer__opacity'), children: [!!isPlayed && !!isEditable && (
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                    _jsx(IconButton, { noPadding: true, onClick: togglePlay, "data-testid": "calls_watch_together_player_control_pause", children: _jsx(Icon24Pause, { className: "CallsMoviePlayer__playPause" }) })), !isPlayed && !!isEditable && (
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                    _jsx(IconButton, { noPadding: true, onClick: togglePlay, "data-testid": "calls_watch_together_player_control_play", children: _jsx(Icon24Play, { className: "CallsMoviePlayer__playPause" }) })), isLive && _jsx(Icon20LiveBadge, {}), _jsx(PlayTimeProgress, { current: _current, isEditable: isEditable, onRewind: onRewind, vkMovieId: vkMovieId, total: _total, isLive: isLive, isRewindButtonPushed: isRewindButtonPushed, setIsRewindButtonPushed: setIsRewindButtonPushed, isPlayed: Boolean(isPlayed) }), isMovie && _jsx(PlayTime, { current: _current, total: _total }), !!isEditable && (_jsx(Volume, { onChange: onChangeVolume, isShowControls: isShowControls, value: volumeValue, vkMovieId: vkMovieId, onMute: onMute, onUnMute: onUnMute, isMuted: isMuted }))] }), !!isEditable && (_jsx("div", { className: cn('CallsMoviePlayer__closeMovieIcon', 'CallsMoviePlayer__opacity'), children: _jsx(IconButton, { "data-testid": "calls_watch_together_player_close", hasHover: false, hasActive: false, onClick: toggleRemove, children: _jsx(Icon16Cancel, {}) }) })), _jsx("div", { className: cn({
                    CallsMoviePlayer__overlay: true,
                    CallsMoviePlayer__opacity: true,
                }) })] }));
};
export const MoviePlayer = memo(MoviePlayerComponent);
//# sourceMappingURL=MoviePlayer.js.map