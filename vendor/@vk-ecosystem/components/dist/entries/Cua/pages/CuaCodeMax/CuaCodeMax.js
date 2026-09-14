import { jsx } from 'react/jsx-runtime';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
import { memo, useEffect } from 'react';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { CuaCodeMaxDesktop } from './CuaCodeMaxDesktop/CuaCodeMaxDesktop.js';
import { CuaCodeMaxMobile } from './CuaCodeMaxMobile/CuaCodeMaxMobile.js';
var CuaCodeMaxComponent = function CuaCodeMaxComponent() {
  var _useAdaptivityWithJSM = useAdaptivityWithJSMediaQueries(),
    isDesktop = _useAdaptivityWithJSM.isDesktop;
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsConfirmationCode = _useCuaSendStatsServi.sendStatsConfirmationCode;
  useEffect(function () {
    sendStatsConfirmationCode(AnalyticsFactors.max);
  }, []);
  return isDesktop ? jsx(CuaCodeMaxDesktop, {}) : jsx(CuaCodeMaxMobile, {});
};
var CuaCodeMax = memo(CuaCodeMaxComponent);
export { CuaCodeMax };
