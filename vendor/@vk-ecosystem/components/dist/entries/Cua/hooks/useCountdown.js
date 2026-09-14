import { useState, useEffect } from 'react';
import { useCuaStore } from '../services/CuaStore/CuaStore.js';
var timerId = null;
function useCountdown() {
  var _useCuaStore = useCuaStore(),
    libverifyTimer = _useCuaStore.libverifyTimer,
    setLibverifyTimer = _useCuaStore.setLibverifyTimer,
    libverifyFlowEnabled = _useCuaStore.libverifyFlowEnabled;
  var _useState = useState(0),
    seconds = _useState[0],
    setSeconds = _useState[1];
  var timerStart = function timerStart(seconds) {
    setSeconds(libverifyFlowEnabled ? libverifyTimer : seconds);
  };
  var timerStop = function timerStop() {
    timerId && window.clearInterval(timerId);
  };
  useEffect(function () {
    if (seconds > 0) {
      timerId = window.setInterval(function () {
        setSeconds(seconds - 1);
        setLibverifyTimer(seconds - 1);
      }, 1000);
      return function () {
        return timerStop();
      };
    }
  }, [seconds]);
  var formatTime = function formatTime(timeInSeconds) {
    var minutes = Math.floor(timeInSeconds % 3600 / 60).toString().padStart(2, '0');
    var seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return minutes + ":" + seconds;
  };
  return {
    seconds: seconds,
    timerStart: timerStart,
    timerStop: timerStop,
    formatTime: formatTime
  };
}
export { useCountdown };
