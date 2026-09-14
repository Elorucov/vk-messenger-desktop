import { useDebouncedEffect } from '../hooks/useDebouncedEffect';
import { useCallback, useState } from 'react';
import { DEFAULT_TIMER_MINS, TIMER_INPUT_TYPE } from '../constants';
import { objectMap } from '../helpers/helpers';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
import { updateRooms } from '@vkontakte/calls-sdk';
export function useSetRoomCountdown({ countdownSec, rooms, setRoomsCountdown, resetRoomsTimer, }) {
    const [timerMin, setTimerMin] = useState(countdownSec ? Math.floor(countdownSec / 60) : DEFAULT_TIMER_MINS);
    const [isTimerEnabled, setIsTimerEnabled] = useState(!!countdownSec);
    const [lastTimerInputType, setLastTimerInputType] = useState(TIMER_INPUT_TYPE.PRESET);
    const handleTimerInput = (timerMin, inputType) => {
        setTimerMin(timerMin);
        setLastTimerInputType(inputType);
    };
    const toggleIsTimerEnabled = () => {
        setIsTimerEnabled(!isTimerEnabled);
    };
    const resetTimer = useCallback((withState) => {
        setTimerMin(0);
        setIsTimerEnabled(false);
        if (withState) {
            resetRoomsTimer();
        }
    }, []);
    const sendStats = useSendStatsService();
    const commitCountdown = async (areRoomsOpening = false) => {
        const newCountdownSec = isTimerEnabled && +timerMin > 0 ? +timerMin * 60 : 0;
        if (newCountdownSec !== countdownSec) {
            newCountdownSec ? setRoomsCountdown(newCountdownSec) : resetRoomsTimer();
            const roomsUpdate = objectMap(rooms, ({ id }) => ({ id, countdownSec: newCountdownSec }));
            if (roomsUpdate.length) {
                await updateRooms(roomsUpdate);
            }
        }
        if (isTimerEnabled && areRoomsOpening) {
            sendStats(ClickHouseEventType.SESSION_ROOMS_TIMER_ENABLED, {
                event_param: +timerMin,
                reason: lastTimerInputType,
            });
        }
    };
    const { debouncedCallback } = useDebouncedEffect(commitCountdown, [isTimerEnabled], 200);
    const immediatelyCommitCountdown = (areRoomsOpening = false) => {
        debouncedCallback.cancel();
        return commitCountdown(areRoomsOpening);
    };
    return {
        currentTimer: timerMin,
        onTimerInput: handleTimerInput,
        isTimerEnabled,
        onTimerSwitch: toggleIsTimerEnabled,
        immediatelyCommitCountdown,
        resetTimer,
        countdownSec: isTimerEnabled && +timerMin > 0 ? +timerMin * 60 : undefined,
    };
}
//# sourceMappingURL=useSetRoomCountdown.js.map