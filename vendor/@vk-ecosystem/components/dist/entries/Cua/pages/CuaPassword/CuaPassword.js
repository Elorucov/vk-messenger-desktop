import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { Icon20HideOutline, Icon20ViewOutline } from '@vkontakte/icons';
import { useAdaptivityWithJSMediaQueries, Spacing, Link, Text, FormItem, Input, IconButton, Div, ButtonGroup, Button } from '@vkontakte/vkui';
import { IconIllustrationConfirmationPasswordError120h, IconIllustrationConfirmationPasswordCorrect120h } from '@vkontakte-internal/icons-private';
import { memo, useContext, useState, useRef, useEffect, useMemo } from 'react';
import { CuaBase } from '../../components/CuaBase/CuaBase.js';
import { cuaPassword } from '../../constants/testIds.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import { CuaPages } from '../../types.js';
import { withDotMask } from '../../../../shared/helpers/text.js';
import Lang, { langReplaceVar } from '../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import styles from './CuaPassword.module.css.js';
var CuaPasswordComponent = function CuaPasswordComponent() {
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsConfirmationCode = _useCuaSendStatsServi.sendStatsConfirmationCode,
    sendStatsPasswordRestore = _useCuaSendStatsServi.sendStatsPasswordRestore;
  var _useAdaptivityWithJSM = useAdaptivityWithJSMediaQueries(),
    isDesktop = _useAdaptivityWithJSM.isDesktop;
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    goToPage = _useCuaStore.goToPage,
    savePasswordCode = _useCuaStore.savePasswordCode,
    methods = _useCuaStore.methods,
    errors = _useCuaStore.errors,
    setErrors = _useCuaStore.setErrors,
    canChangeMethod = _useCuaStore.canChangeMethod,
    canBindPhone = _useCuaStore.canBindPhone;
  var _useState = useState(''),
    data = _useState[0],
    setData = _useState[1];
  var _useState2 = useState(false),
    view = _useState2[0],
    setView = _useState2[1];
  var inputRef = useRef(null);
  var password = methods[ValidationMethodsType.Password];
  var error = errors[ValidationMethodsType.Password];
  var phoneNumberBegin = password != null && password.phone ? password == null ? void 0 : password.phone.slice(0, 2) : '';
  var phoneNumberEnd = password != null && password.phone ? password == null ? void 0 : password.phone.slice(-2) : '';
  var getDescriptionAriaLabel = function getDescriptionAriaLabel() {
    return "\n  " + getLang('vkconnect_sak_cua_password_description_phone').replace('{phone}', getLang('vkconnect_sak_cua_phone_aria_label').replace('{begin}', phoneNumberBegin).replace('{end}', phoneNumberEnd)) + "\n  ";
  };
  useEffect(function () {
    sendStatsConfirmationCode(AnalyticsFactors.password);
  }, []);
  useEffect(function () {
    // из-за особенностей React, autoFocus ломает CSS анимацию.
    // поэтому ставим фокус с задержкой
    setTimeout(function () {
      var _inputRef$current;
      inputRef == null || (_inputRef$current = inputRef.current) == null || _inputRef$current.focus();
    }, 100);
  }, [inputRef]);
  var changeView = function changeView() {
    setView(!view);
  };
  var handleSubmit = function handleSubmit() {
    !loading && !error && !!data && savePasswordCode(data);
  };
  var handleChange = function handleChange(e) {
    var value = e.target.value;
    setData(value);
    setErrors({});
  };
  var bindPhone = function bindPhone() {
    sendStatsPasswordRestore(AnalyticsFactors.password);
    goToPage(CuaPages.SET_PHONE);
  };
  var setPhoneLink = jsxs(Fragment, {
    children: [error && jsx(Spacing, {
      size: 6
    }), canBindPhone && jsx("div", {
      className: styles.link,
      children: jsx(Link, {
        onClick: bindPhone,
        disabled: loading,
        children: jsx(Text, {
          className: styles.text,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_password_restore"
          })
        })
      })
    })]
  });
  var content = jsx(FormItem, {
    className: styles.formItem,
    status: error ? 'error' : 'default',
    bottom: (error || !canChangeMethod) && jsxs(Fragment, {
      children: [error, !canChangeMethod && setPhoneLink]
    }),
    children: jsx(Input, {
      getRef: function getRef(el) {
        inputRef.current = el;
      },
      type: view ? 'text' : 'password',
      onChange: handleChange,
      "data-test-id": cuaPassword.input,
      after: jsx(IconButton, {
        "aria-label": view ? getLang('vkconnect_sak_cua_password_hide_aria_label') : getLang('vkconnect_sak_cua_password_view_aria_label'),
        hoverMode: "opacity",
        onClick: changeView,
        children: view ? jsx(Icon20HideOutline, {}) : jsx(Icon20ViewOutline, {})
      }),
      disabled: loading
    })
  });
  var description = useMemo(function () {
    if (password != null && password.phone) {
      return jsx("div", {
        role: "heading",
        "aria-label": getDescriptionAriaLabel(),
        children: langReplaceVar(getLang('vkconnect_sak_cua_password_description_phone'), 'phone', jsx("text", {
          className: styles.account,
          children: withDotMask(password == null ? void 0 : password.phone)
        }))
      });
    }
    if (password != null && password.email) {
      return jsx("div", {
        children: langReplaceVar(getLang('vkconnect_sak_cua_password_description_email'), 'email', jsx("text", {
          className: styles.account,
          children: withDotMask(password == null ? void 0 : password.email)
        }))
      });
    }
    if (password != null && password.screen_name) {
      return jsx("div", {
        children: langReplaceVar(getLang('vkconnect_sak_cua_password_description_login'), 'login', jsx("text", {
          className: styles.account,
          children: password == null ? void 0 : password.screen_name
        }))
      });
    }
    return '';
  }, [password]);
  var footer = jsxs(Fragment, {
    children: [!error && !isDesktop && jsx(Spacing, {
      size: 22
    }), jsx(Div, {
      children: jsxs(ButtonGroup, {
        mode: "vertical",
        gap: "m",
        stretched: true,
        children: [jsx(Button, {
          size: "l",
          stretched: true,
          disabled: !data || loading,
          onClick: handleSubmit,
          "data-test-id": cuaPassword.submitBtn,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_password_next_btn"
          })
        }), canChangeMethod && jsx(Button, {
          size: "l",
          mode: "tertiary",
          stretched: true,
          disabled: loading,
          onClick: function onClick() {
            return goToPage(CuaPages.MAIN);
          },
          "data-test-id": cuaPassword.changeMethodBtn,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_change_method"
          })
        })]
      })
    })]
  });
  return jsx(CuaBase, {
    header: jsx("div", {
      className: styles.header,
      "data-test-id": cuaPassword.title,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_password_title"
      })
    }),
    description: description,
    icon: error ? jsx(IconIllustrationConfirmationPasswordError120h, {
      "data-test-id": cuaPassword.icon
    }) : jsx(IconIllustrationConfirmationPasswordCorrect120h, {
      "data-test-id": cuaPassword.icon
    }),
    content: content,
    footer: footer,
    onSubmit: handleSubmit
  });
};
var CuaPassword = memo(CuaPasswordComponent);
export { CuaPassword };
