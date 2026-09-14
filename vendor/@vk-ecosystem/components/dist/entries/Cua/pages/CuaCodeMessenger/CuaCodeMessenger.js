import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Icon56ErrorOutline } from '@vkontakte/icons';
import { Spacing, Div, Button } from '@vkontakte/vkui';
import { Icon56LogoWhatsappColor, Icon56LogoTelegramColor, Icon56LogoViberColor } from '@vkontakte-internal/icons-private';
import { memo, useContext, useEffect, useCallback } from 'react';
import { CuaCodeBase } from '../../components/CuaCodeBase/CuaCodeBase.js';
import { cuaCodeSms, cuaCodeBase } from '../../constants/testIds.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import { CuaPages } from '../../types.js';
import { Interpolate } from '../../../../shared/components/Interpolate.js';
import { withDotMask } from '../../../../shared/helpers/text.js';
import Lang from '../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import { CuaBase } from '../../components/CuaBase/CuaBase.js';
import { useCuaMessengerCheck } from '../../services/CuaMessengerCheckService/CuaMessengerCheckService.js';
import { MessengerStatuses } from '../../services/CuaMessengerCheckService/types.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import styles from './CuaCodeMessenger.module.css.js';
var CuaCodeMessengerComponent = function CuaCodeMessengerComponent() {
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    savePhoneCode = _useCuaStore.savePhoneCode,
    methods = _useCuaStore.methods,
    errors = _useCuaStore.errors,
    setErrors = _useCuaStore.setErrors,
    goToPage = _useCuaStore.goToPage,
    getMethods = _useCuaStore.getMethods,
    additionalServiceFooter = _useCuaStore.additionalServiceFooter,
    disableIcon = _useCuaStore.disableIcon;
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsConfirmationCode = _useCuaSendStatsServi.sendStatsConfirmationCode,
    sendStatsErrors = _useCuaSendStatsServi.sendStatsErrors;
  var _useCuaMessengerCheck = useCuaMessengerCheck(),
    messengerStatus = _useCuaMessengerCheck.messengerStatus,
    stopMessengerCheck = _useCuaMessengerCheck.stopMessengerCheck;
  var data = methods[ValidationMethodsType.Phone];
  var error = errors[ValidationMethodsType.Phone];
  var _ref = (data == null ? void 0 : data.current_code_type) === 'whatsapp' ? ['WhatsApp', Icon56LogoWhatsappColor, AnalyticsFactors.msgWhatsapp] : (data == null ? void 0 : data.current_code_type) === 'telegram' ? ['Telegram', Icon56LogoTelegramColor, AnalyticsFactors.msgTelegram] : ['Viber', Icon56LogoViberColor, AnalyticsFactors.msgViber],
    messengerName = _ref[0],
    MessengerIcon = _ref[1],
    factor = _ref[2];
  useEffect(function () {
    if (messengerStatus === MessengerStatuses.ERROR) {
      sendStatsErrors(999);
    }
  }, [messengerStatus]);
  useEffect(function () {
    sendStatsConfirmationCode(factor);
    return function () {
      return stopMessengerCheck();
    };
  }, []);
  var goToChangeMethod = useCallback(function () {
    // Если метод всего один, то вызываем getMethods, чтобы
    // пройти сразу по этому методу вместо показа экрана доступных методов
    if (Object.keys(methods).length === 1) {
      void getMethods(false, true);
      return;
    }
    goToPage(CuaPages.MAIN);
  }, [methods]);
  if (messengerStatus !== MessengerStatuses.ERROR) {
    return jsx(CuaCodeBase, {
      canRetry: false,
      icon: !disableIcon && jsx(MessengerIcon, {
        "data-test-id": cuaCodeSms.icon
      }),
      saveCode: savePhoneCode,
      header: jsx("div", {
        "data-test-id": cuaCodeSms.title,
        children: jsx(Interpolate, {
          values: {
            messengerName: messengerName
          },
          children: getLang('vkconnect_sak_cua_code_messenger_title')
        })
      }),
      description: jsx("div", {
        role: "heading",
        children: jsx(Interpolate, {
          values: {
            primary: jsx("span", {
              className: styles.phoneNumber
            }),
            messengerName: messengerName,
            phone: withDotMask(data == null ? void 0 : data.phone)
          },
          children: getLang('vkconnect_sak_cua_code_messenger_description')
        })
      }),
      codeLength: (data == null ? void 0 : data.code_length) || 0,
      goToChangeMethod: goToChangeMethod,
      canChangeMethod: true,
      loading: loading,
      error: error,
      setErrors: setErrors,
      additionalFooter: additionalServiceFooter
    });
  } else {
    return jsx(CuaBase, {
      icon: !disableIcon && jsxs(Fragment, {
        children: [jsx(Spacing, {
          size: 8
        }), jsx(Icon56ErrorOutline, {
          className: styles.iconError
        })]
      }),
      header: jsx("div", {
        "data-test-id": cuaCodeSms.title,
        children: getLang('vkconnect_sak_cua_code_messenger_fail_title')
      }),
      description: jsx("div", {
        role: "heading",
        children: getLang('vkconnect_sak_cua_code_messenger_fail_subtitle')
      }),
      content: jsxs(Div, {
        children: [jsx(Spacing, {
          size: 12
        }), jsx(Button, {
          className: styles.buttonMethod,
          size: "l",
          mode: "secondary",
          onClick: goToChangeMethod,
          stretched: true,
          disabled: loading,
          "data-test-id": cuaCodeBase.changeMethodBtn,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_change_method"
          })
        }), additionalServiceFooter && jsxs(Fragment, {
          children: [jsx(Spacing, {
            size: 12
          }), additionalServiceFooter]
        })]
      })
    });
  }
};
var CuaCodeMessenger = memo(CuaCodeMessengerComponent);
export { CuaCodeMessenger };
