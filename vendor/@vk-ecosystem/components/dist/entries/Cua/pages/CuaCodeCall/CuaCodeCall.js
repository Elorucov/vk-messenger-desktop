import { jsx } from 'react/jsx-runtime';
import { IconIllustrationConfirmationPhonecall120h } from '@vkontakte-internal/icons-private';
import { memo, useEffect } from 'react';
import { CuaCodeBase } from '../../components/CuaCodeBase/CuaCodeBase.js';
import { CuaTimer } from '../../components/CuaTimer/CuaTimer.js';
import { cuaCodeCall } from '../../constants/testIds.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import { CuaPages } from '../../types.js';
import Lang from '../../../../shared/providers/LangProvider/Lang.js';
import styles from './CuaCodeCall.module.css.js';
var CuaCodeCallComponent = function CuaCodeCallComponent() {
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsConfirmationCode = _useCuaSendStatsServi.sendStatsConfirmationCode,
    sendStatsResetCode = _useCuaSendStatsServi.sendStatsResetCode;
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    sendPhoneCodeToDevice = _useCuaStore.sendPhoneCodeToDevice,
    savePhoneCode = _useCuaStore.savePhoneCode,
    methods = _useCuaStore.methods,
    errors = _useCuaStore.errors,
    setErrors = _useCuaStore.setErrors,
    canChangeMethod = _useCuaStore.canChangeMethod,
    goToPage = _useCuaStore.goToPage,
    libverifyFlowEnabled = _useCuaStore.libverifyFlowEnabled,
    additionalServiceFooter = _useCuaStore.additionalServiceFooter,
    disableIcon = _useCuaStore.disableIcon;
  var _useCountdown = useCountdown(),
    seconds = _useCountdown.seconds,
    timerStart = _useCountdown.timerStart,
    timerStop = _useCountdown.timerStop;
  var data = methods[ValidationMethodsType.Phone];
  var error = errors[ValidationMethodsType.Phone];
  useEffect(function () {
    sendStatsConfirmationCode(AnalyticsFactors.callReset, libverifyFlowEnabled);
  }, []);
  useEffect(function () {
    (data == null ? void 0 : data.timeout) && timerStart(data.timeout);
    return function () {
      return timerStop();
    };
  }, [data]);
  return jsx(CuaCodeBase, {
    icon: !disableIcon && jsx(IconIllustrationConfirmationPhonecall120h, {
      "data-test-id": cuaCodeCall.icon
    }),
    sendCodeToDevice: function sendCodeToDevice() {
      sendStatsResetCode(AnalyticsFactors.callReset);
      sendPhoneCodeToDevice(false);
    },
    saveCode: savePhoneCode,
    header: jsx("div", {
      "data-test-id": cuaCodeCall.title,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_code_call_title"
      })
    }),
    description: jsx("span", {
      className: styles.text,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_code_call_description"
      })
    }),
    retrySendCodeBtnText: jsx(Lang, {
      lang: "vkconnect_sak_cua_code_retry_send"
    }),
    codeLength: (data == null ? void 0 : data.code_length) || 0,
    goToChangeMethod: function goToChangeMethod() {
      return goToPage(CuaPages.MAIN);
    },
    canChangeMethod: canChangeMethod,
    loading: loading,
    timer: !!seconds && jsx(CuaTimer, {
      lang: "vkconnect_sak_cua_code_call_timer",
      langLabelMinutes: "vkconnect_sak_cua_code_call_timer_label_minutes",
      value: seconds
    }),
    error: error,
    setErrors: setErrors,
    additionalFooter: additionalServiceFooter
  });
};
var CuaCodeCall = memo(CuaCodeCallComponent);
export { CuaCodeCall };
