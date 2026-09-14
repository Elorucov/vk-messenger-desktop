import { jsx } from 'react/jsx-runtime';
import { IconIllustrationConfirmationNotification120h } from '@vkontakte-internal/icons-private';
import { memo, useContext, useEffect } from 'react';
import { CuaCodeBase } from '../../components/CuaCodeBase/CuaCodeBase.js';
import { CuaTimer } from '../../components/CuaTimer/CuaTimer.js';
import { cuaCodePush } from '../../constants/testIds.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import { CuaPages } from '../../types.js';
import Lang from '../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
var CuaCodePushComponent = function CuaCodePushComponent() {
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsConfirmationCode = _useCuaSendStatsServi.sendStatsConfirmationCode;
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    sendPushCodeToDevice = _useCuaStore.sendPushCodeToDevice,
    savePushCode = _useCuaStore.savePushCode,
    methods = _useCuaStore.methods,
    errors = _useCuaStore.errors,
    setErrors = _useCuaStore.setErrors,
    canChangeMethod = _useCuaStore.canChangeMethod,
    canBindPhone = _useCuaStore.canBindPhone,
    goToPage = _useCuaStore.goToPage,
    additionalServiceFooter = _useCuaStore.additionalServiceFooter,
    disableIcon = _useCuaStore.disableIcon;
  var _useCountdown = useCountdown(),
    seconds = _useCountdown.seconds,
    timerStart = _useCountdown.timerStart,
    timerStop = _useCountdown.timerStop;
  var data = methods[ValidationMethodsType.Push];
  var error = errors[ValidationMethodsType.Push];
  useEffect(function () {
    sendStatsConfirmationCode(AnalyticsFactors.push);
  }, []);
  useEffect(function () {
    (data == null ? void 0 : data.timeout) && timerStart(data.timeout);
    return function () {
      return timerStop();
    };
  }, [data]);
  return jsx(CuaCodeBase, {
    icon: !disableIcon && jsx(IconIllustrationConfirmationNotification120h, {
      "data-test-id": cuaCodePush.icon
    }),
    sendCodeToDevice: function sendCodeToDevice() {
      return sendPushCodeToDevice(false);
    },
    saveCode: savePushCode,
    header: jsx("div", {
      "data-test-id": cuaCodePush.title,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_code_push_title"
      })
    }),
    description: jsx("div", {
      role: "heading",
      "aria-label": getLang('vkconnect_sak_cua_code_push_description_aria_label'),
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_code_push_description"
      })
    }),
    codeLength: 6,
    goToChangeMethod: function goToChangeMethod() {
      return goToPage(CuaPages.MAIN);
    },
    goToSetPhone: function goToSetPhone() {
      return goToPage(CuaPages.SET_PHONE);
    },
    canChangeMethod: canChangeMethod,
    canBindPhone: canBindPhone,
    loading: loading,
    timer: !!seconds && jsx(CuaTimer, {
      lang: "vkconnect_sak_cua_code_push_timer",
      langLabelMinutes: "vkconnect_sak_cua_code_push_timer_label_minutes",
      value: seconds
    }),
    error: error,
    setErrors: setErrors,
    additionalFooter: additionalServiceFooter
  });
};
var CuaCodePush = memo(CuaCodePushComponent);
export { CuaCodePush };
