import { AnalyticsFactors } from '../CuaSendStatsService/types.js';
import { CuaLibverifyStates } from './types.js';
import { CuaPages } from '../../types.js';
var castToAnalyticFactor = function castToAnalyticFactor(methods) {
  switch (methods) {
    case CuaLibverifyStates.CALL_RESET:
    case CuaPages.CALL:
      return AnalyticsFactors.callReset;
    case CuaLibverifyStates.MOBILE_ID:
      return AnalyticsFactors.mobileId;
    case CuaPages.SMS:
    case CuaLibverifyStates.SMS:
      return AnalyticsFactors.smsOrMax;
    case CuaPages.TELEGRAM:
      return AnalyticsFactors.msgTelegram;
    case CuaPages.VIBER:
      return AnalyticsFactors.msgViber;
    case CuaPages.WHATSAPP:
      return AnalyticsFactors.msgWhatsapp;
    default:
      return AnalyticsFactors.smsOrMax;
  }
};
export { castToAnalyticFactor };
