import { jsx } from 'react/jsx-runtime';
import { IconIllustrationConfirmationMail120h } from '@vkontakte-internal/icons-private';
import { memo, useContext, useEffect } from 'react';
import { CuaCodeBase } from '../../components/CuaCodeBase/CuaCodeBase.js';
import { CuaTimer } from '../../components/CuaTimer/CuaTimer.js';
import { cuaCodeEmail } from '../../constants/testIds.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import { CuaPages } from '../../types.js';
import { withDotMask } from '../../../../shared/helpers/text.js';
import Lang, { langReplaceVar } from '../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import styles from './CuaCodeEmail.module.css.js';
var CuaCodeEmailComponent = function CuaCodeEmailComponent() {
  var _data$email, _data$email2;
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsResetCode = _useCuaSendStatsServi.sendStatsResetCode,
    sendStatsConfirmationCode = _useCuaSendStatsServi.sendStatsConfirmationCode;
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    sendEmailCodeToDevice = _useCuaStore.sendEmailCodeToDevice,
    saveEmailCode = _useCuaStore.saveEmailCode,
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
  var data = methods[ValidationMethodsType.Email];
  var error = errors[ValidationMethodsType.Email];
  useEffect(function () {
    sendStatsConfirmationCode(AnalyticsFactors.email);
  }, []);
  useEffect(function () {
    (data == null ? void 0 : data.timeout) && timerStart(data.timeout);
    return function () {
      return timerStop();
    };
  }, [data]);
  var emailBegin = (data == null || (_data$email = data.email) == null ? void 0 : _data$email.slice(0, 2)) || '';
  var emailEnd = (data == null || (_data$email2 = data.email) == null ? void 0 : _data$email2.replace(/.+@/, '@')) || '';
  var hiddenEmail = getLang('vkconnect_sak_cua_email_aria_label').replace('{begin}', emailBegin).replace('{end}', emailEnd);
  var descriptionAriaLabel = getLang('vkconnect_sak_cua_code_email_description').replace('{email}', hiddenEmail);
  return jsx(CuaCodeBase, {
    icon: !disableIcon && jsx(IconIllustrationConfirmationMail120h, {
      "data-test-id": cuaCodeEmail.icon
    }),
    sendCodeToDevice: function sendCodeToDevice() {
      sendStatsResetCode(AnalyticsFactors.email);
      void sendEmailCodeToDevice(false);
    },
    saveCode: saveEmailCode,
    header: jsx("div", {
      "data-test-id": cuaCodeEmail.title,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_code_email_title"
      })
    }),
    description: jsx("div", {
      "aria-label": descriptionAriaLabel,
      role: "heading",
      children: jsx("div", {
        "aria-hidden": true,
        children: langReplaceVar(getLang('vkconnect_sak_cua_code_email_description'), 'email', jsx("text", {
          "data-test-id": cuaCodeEmail.email,
          className: styles.email,
          children: withDotMask(data == null ? void 0 : data.email)
        }))
      })
    }),
    codeLength: (data == null ? void 0 : data.code_length) || 0,
    goToChangeMethod: function goToChangeMethod() {
      return goToPage(CuaPages.MAIN);
    },
    goToSetPhone: function goToSetPhone() {
      sendStatsResetCode(AnalyticsFactors.phone);
      goToPage(CuaPages.SET_PHONE);
    },
    canChangeMethod: canChangeMethod,
    canBindPhone: canBindPhone,
    loading: loading,
    timer: !!seconds && jsx(CuaTimer, {
      lang: "vkconnect_sak_cua_code_email_timer",
      langLabelMinutes: "vkconnect_sak_cua_code_email_timer_label_minutes",
      value: seconds
    }),
    error: error,
    setErrors: setErrors,
    additionalFooter: additionalServiceFooter
  });
};
var CuaCodeEmail = memo(CuaCodeEmailComponent);
export { CuaCodeEmail };
