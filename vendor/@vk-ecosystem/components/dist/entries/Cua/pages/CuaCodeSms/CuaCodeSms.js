import { jsx, jsxs } from 'react/jsx-runtime';
import { IconIllustrationConfirmationSms120h } from '@vkontakte-internal/icons-private';
import { memo, useContext, useEffect } from 'react';
import { CuaCodeBase } from '../../components/CuaCodeBase/CuaCodeBase.js';
import { CuaTimer } from '../../components/CuaTimer/CuaTimer.js';
import { cuaCodeSms } from '../../constants/testIds.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import { CuaPages } from '../../types.js';
import { withDotMask } from '../../../../shared/helpers/text.js';
import Lang, { langReplaceVar } from '../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import styles from './CuaCodeSms.module.css.js';
var CuaCodeSmsComponent = function CuaCodeSmsComponent() {
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
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
    sendStatsConfirmationCode(AnalyticsFactors.smsOrMax, libverifyFlowEnabled);
  }, []);
  useEffect(function () {
    (data == null ? void 0 : data.timeout) && timerStart(data.timeout);
    return function () {
      return timerStop();
    };
  }, [data]);
  var phoneNumberBegin = data != null && data.phone ? data == null ? void 0 : data.phone.slice(0, 2) : '';
  var phoneNumberEnd = data != null && data.phone ? data == null ? void 0 : data.phone.slice(-2) : '';
  var descriptionAriaLabel = "\n    " + getLang('vkconnect_sak_cua_code_sms_or_max_description') + " " + getLang('vkconnect_sak_cua_phone_aria_label').replace('{begin}', phoneNumberBegin).replace('{end}', phoneNumberEnd) + "\n  ";
  var getHeader = function getHeader() {
    var header = langReplaceVar(getLang('vkconnect_sak_cua_code_sms_or_max_title'), 'br', jsx("br", {}));
    return jsx("span", {
      children: header
    });
  };
  return jsx(CuaCodeBase, {
    icon: !disableIcon && jsx(IconIllustrationConfirmationSms120h, {
      "data-test-id": cuaCodeSms.icon
    }),
    sendCodeToDevice: function sendCodeToDevice() {
      sendStatsResetCode(AnalyticsFactors.smsOrMax);
      sendPhoneCodeToDevice(false);
    },
    saveCode: savePhoneCode,
    header: jsx("div", {
      "data-test-id": cuaCodeSms.title,
      children: getHeader()
    }),
    description: jsx("div", {
      "aria-label": descriptionAriaLabel,
      role: "heading",
      children: jsxs("div", {
        "aria-hidden": true,
        children: [jsx(Lang, {
          lang: "vkconnect_sak_cua_code_sms_or_max_description"
        }), jsx("div", {
          "data-test-id": cuaCodeSms.phone,
          className: styles.phoneNumber,
          children: withDotMask(data == null ? void 0 : data.phone)
        })]
      })
    }),
    codeLength: (data == null ? void 0 : data.code_length) || 0,
    goToChangeMethod: function goToChangeMethod() {
      return goToPage(CuaPages.MAIN);
    },
    canChangeMethod: canChangeMethod,
    loading: loading,
    timer: !!seconds && jsx(CuaTimer, {
      lang: "vkconnect_sak_cua_code_sms_or_max_timer",
      langLabelMinutes: "vkconnect_sak_cua_code_sms_timer_label_minutes",
      value: seconds
    }),
    error: error,
    setErrors: setErrors,
    additionalFooter: additionalServiceFooter
  });
};
var CuaCodeSms = memo(CuaCodeSmsComponent);
export { CuaCodeSms };
