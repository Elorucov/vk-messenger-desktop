import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { useCallback, useState, useEffect, useRef } from 'react';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { classNames as cn, isNumber } from '@vkontakte/vkjs';
import { Icon24Mute, Icon24Volume } from '@vkontakte/icons';
import { shortPercentFormat } from '../../helpers/number';
import { IconButton, TextTooltip, LegacySlider as Slider } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
export const Volume = ({ onChange, value = 0, className, vkMovieId, isMuted, onMute, onUnMute, isShowControls, }) => {
    const { getLang } = useLang();
    const isMounted = useIsMounted();
    /** значение громкости от 0 до 1 */
    const [volume, setVolume] = useState(() => {
        return isNumber(value) ? value : 1;
    });
    const [isChanged, setIsChanged] = useState(false);
    /** таймаут выдачи громкости наружу */
    const timeout = useRef(null);
    /** последнее значение звука, которое было получено сверху */
    const lastReceivedVolume = useRef(volume);
    const handleChange = useCallback((value) => {
        /** конвертируем значение из `0 - 100` в `0 - 1` */
        setIsChanged(true);
        setVolume(value / 100);
    }, []);
    useEffect(() => {
        if (isNumber(value)) {
            setVolume(value);
            lastReceivedVolume.current = value;
        }
    }, [value]);
    useEffect(() => {
        if (onChange) {
            timeout.current = setTimeout(() => {
                if (isMounted() && volume !== lastReceivedVolume.current) {
                    Promise.resolve(onChange?.(vkMovieId, volume, isMuted)).finally(() => {
                        setIsChanged(false);
                    });
                }
            }, 300);
        }
        return () => {
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
        };
    }, [volume, onChange, isMuted]);
    /** вкл / выкл звук */
    const handleToggleMute = useCallback(() => {
        if (!isMuted && value) {
            onMute(vkMovieId, value);
        }
        else {
            onUnMute(vkMovieId, value || 0.1);
        }
    }, [isMuted, onMute, onUnMute, vkMovieId, value]);
    const volumeTooltipText = !!volume
        ? getLang('calls_movie_player_sound_off')
        : getLang('calls_movie_player_sound_on');
    const localVolume = isMuted && !isChanged ? 0 : volume * 100;
    return (_jsxs("div", { className: cn('CallsMovieVolumeSlider', className), children: [_jsx(TextTooltip, { hidden: !isShowControls, text: volumeTooltipText, placement: "top", children: _jsx("div", { className: "CallsMovieVolumeSlider__icon", children: _jsx(IconButton, { noPadding: true, onClick: handleToggleMute, "data-testid": "calls_watch_together_player_mute", children: !localVolume ? _jsx(Icon24Mute, {}) : _jsx(Icon24Volume, {}) }) }) }), _jsx(Slider, { onChange: handleChange, value: localVolume, formatHint: shortPercentFormat, size: "xl", tooltipProps: {
                    usePortal: false,
                    disableCloseAfterClick: true,
                }, "data-testid": "calls_watch_together_player_volume" })] }));
};
//# sourceMappingURL=Volume.js.map