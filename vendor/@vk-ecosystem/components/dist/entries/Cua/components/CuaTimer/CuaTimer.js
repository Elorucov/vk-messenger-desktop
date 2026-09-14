import { jsx } from 'react/jsx-runtime';
import { Subhead } from '@vkontakte/vkui';
import { memo, useContext } from 'react';
import { useCountdown } from '../../hooks/useCountdown.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import styles from './CuaTimer.module.css.js';
var CuaTimerComponent = function CuaTimerComponent(_ref) {
  var lang = _ref.lang,
    value = _ref.value,
    langLabelMinutes = _ref.langLabelMinutes;
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang,
    getLangNumeric = _useContext.getLangNumeric;
  var _useCountdown = useCountdown(),
    formatTime = _useCountdown.formatTime;
  var formattedTime = formatTime(value);
  var _formattedTime$split$ = formattedTime.split(':').map(Number),
    minutes = _formattedTime$split$[0],
    seconds = _formattedTime$split$[1];
  var timerLabel = getLangNumeric(minutes, langLabelMinutes) + ' ' + getLangNumeric(seconds, 'vkconnect_sak_cua_code_timer_label_seconds');
  return jsx("time", {
    tabIndex: 0,
    role: "timer",
    "aria-live": "off",
    children: jsx(Subhead, {
      className: styles.timer,
      "aria-label": timerLabel,
      children: getLang(lang).replace('{timer}', formattedTime)
    })
  });
};
var CuaTimer = memo(CuaTimerComponent);
export { CuaTimer };
