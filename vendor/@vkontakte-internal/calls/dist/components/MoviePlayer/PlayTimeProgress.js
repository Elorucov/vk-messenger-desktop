import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":4,"style":2}]} */
/*
 * Компонент отвечающий за таймлайн видео
 * Для достижения плавности анимации используется transition на изменение width таймлайна.
 *
 * ПЕРЕМОТКА
 *  Для перемотки есть 2 способа
 *  1) Тыкнуть по таймлайну
 *  2) Зажать ползунок и потянуть в рамках границ таймлайна
 *
 *  В момент перемотки transition необходимо отключать.
 *  Но т.к. обновление состояния мувика происходит независимо от перемотки есть кейсы когда мы получаем еще старое состояние offset из датаканала
 *  Для этого была реализована оптимистичная перемотка
 *  Это заставило синхронизировать состояние offset с бека и локальное время в состоянии actualTime
 *  Если мы находимся на паузе или в стостоянии одной из двух перемоток, будет установлено локально выбранное время
 *
 *  Так же для кейса когда из датаканала приходит offset === 0 и isPlayed === false это значит, что видео закончилось и перемоталось вначало.
 *  В этом случае мы сетим actualTime в 0
 * */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { formatTimeHHMMSS } from './utils';
import { valueToPercent } from '../../helpers/number';
import { getOffsetRect, classNames as cn } from '@vkontakte/vkjs';
export const PlayTimeProgress = ({ current, total, onRewind, isEditable, className, vkMovieId, isLive, isRewindButtonPushed, setIsRewindButtonPushed, isPlayed, }) => {
    const [actualTime, setActualTime] = useState(current);
    const [isRewindClick, setIsRewindClick] = useState(false);
    const playtimeRef = useRef(null);
    const [hintPosition, setHintPosition] = useState(0);
    const [hintText, setHintText] = useState('');
    const getRewindTimeValue = useCallback((percent) => Math.round((total * percent) / 100), [total]);
    const handleRewind = useCallback((vkMovieId, rewindTime) => {
        return Promise.resolve(onRewind?.(vkMovieId, rewindTime));
    }, [onRewind, vkMovieId]);
    const onRewindClick = () => {
        if (!onRewind || !isEditable || isLive || isRewindButtonPushed) {
            return;
        }
        const value = getRewindTimeValue(hintPosition);
        setActualTime(value);
        setIsRewindClick(true);
        handleRewind(vkMovieId, value).finally(() => {
            setIsRewindClick(false);
        });
    };
    /* Передвижение хинта со временем по таймлайну */
    const updateHintPosition = useCallback((e) => {
        const { left, width } = getOffsetRect(playtimeRef.current);
        const offset = e.clientX - left;
        const percent = valueToPercent(offset, 0, width);
        const value = getRewindTimeValue(percent);
        setHintText(formatTimeHHMMSS(value));
        setHintPosition(percent);
    }, [getRewindTimeValue]);
    useEffect(() => {
        if (isLive) {
            return;
        }
        playtimeRef.current?.addEventListener('mousemove', updateHintPosition);
        return () => {
            playtimeRef.current?.removeEventListener('mousemove', updateHintPosition);
        };
    }, [updateHintPosition, isLive]);
    /* ===================================== */
    /* Передвижение ползунка перемотки */
    const onRewindButtonMove = useCallback((e) => {
        if (!isEditable) {
            return;
        }
        const x = e.clientX;
        const { left, width } = getOffsetRect(playtimeRef.current);
        if (x < left || x > left + width || !isRewindButtonPushed) {
            return;
        }
        const percent = valueToPercent(x - left, 0, width);
        const value = getRewindTimeValue(percent);
        setActualTime(value);
    }, [isRewindButtonPushed, getRewindTimeValue, isEditable]);
    useEffect(() => {
        window.addEventListener('mousemove', onRewindButtonMove);
        return () => {
            window.removeEventListener('mousemove', onRewindButtonMove);
        };
    }, [onRewindButtonMove]);
    /* ===================================== */
    /* Нажатие на ползунок перемотки */
    const handleRewindButtonDown = useCallback((e) => {
        if (!isEditable) {
            return;
        }
        const el = e.target;
        if (el.classList.contains('CallsMoviePlayerPlayTimeProgress__button')) {
            setIsRewindButtonPushed(true);
        }
    }, [setIsRewindButtonPushed, isEditable]);
    useEffect(() => {
        window.addEventListener('mousedown', handleRewindButtonDown);
        return () => {
            window.removeEventListener('mousedown', handleRewindButtonDown);
        };
    }, [handleRewindButtonDown]);
    /* ===================================== */
    /* Отпустили ползунок перемотки */
    const handleRewindButtonUp = useCallback(() => {
        if (!isEditable) {
            if (isRewindButtonPushed) {
                setIsRewindButtonPushed(false);
            }
            return;
        }
        if (isRewindButtonPushed) {
            handleRewind(vkMovieId, actualTime).finally(() => {
                setIsRewindButtonPushed(false);
            });
        }
    }, [isRewindButtonPushed, vkMovieId, actualTime, handleRewind, isEditable]);
    useEffect(() => {
        window.addEventListener('mouseup', handleRewindButtonUp);
        return () => {
            window.removeEventListener('mouseup', handleRewindButtonUp);
        };
    }, [handleRewindButtonUp]);
    /* ===================================== */
    /* Актуализируем локальное время  (см комментарии)*/
    useLayoutEffect(() => {
        setActualTime((prevTime) => {
            if (isRewindClick || isRewindButtonPushed || !isPlayed) {
                return prevTime;
            }
            return current;
        });
    }, [current, isRewindButtonPushed, isRewindClick, isPlayed]);
    useLayoutEffect(() => {
        if (!isPlayed && current === 0) {
            setActualTime(current);
        }
    }, [isPlayed, current]);
    /* ===================================== */
    const isDisableTransition = isRewindClick || isRewindButtonPushed || actualTime === total || actualTime === 0;
    const progressStyle = {
        width: isLive ? '100%' : `${(actualTime * 100) / total}%`,
        transition: isDisableTransition ? 'none' : 'width 1s ease-out',
    };
    const hintStyle = {
        left: `${hintPosition}%`,
    };
    const progressContainerClasses = cn('CallsMoviePlayerPlayTimeProgress', {
        'CallsMoviePlayerPlayTimeProgress--live': isLive,
    }, className);
    const progressClasses = cn('CallsMoviePlayerPlayTimeProgress__progress', {
        'CallsMoviePlayerPlayTimeProgress__progress--live': isLive,
    });
    const rewindButtonClasses = cn('CallsMoviePlayerPlayTimeProgress__button', {
        'CallsMoviePlayerPlayTimeProgress__button--visible': isRewindButtonPushed,
    });
    return (_jsxs("div", { className: progressContainerClasses, ref: playtimeRef, onClick: onRewindClick, "data-testid": "calls_watch_together_player_progress_bar", children: [_jsx("div", { className: progressClasses, style: progressStyle, children: _jsx("div", { className: rewindButtonClasses, "data-testid": "calls_watch_together_player_progress_point" }) }), _jsx("div", { className: "CallsMoviePlayerPlayTimeProgress__hint", style: hintStyle, children: hintText })] }));
};
//# sourceMappingURL=PlayTimeProgress.js.map