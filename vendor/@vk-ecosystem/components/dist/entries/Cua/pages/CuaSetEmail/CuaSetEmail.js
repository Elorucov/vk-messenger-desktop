import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Icon16Clear } from '@vkontakte/icons';
import { useAdaptivityWithJSMediaQueries, FormItem, Input, IconButton, Spacing, Div, ButtonGroup, Button } from '@vkontakte/vkui';
import { IconIllustrationCreateMail120h } from '@vkontakte-internal/icons-private';
import { memo, useContext, useState, useRef, useEffect } from 'react';
import { CuaBase } from '../../components/CuaBase/CuaBase.js';
import { cuaSetEmail } from '../../constants/testIds.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import Lang from '../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import styles from './CuaSetEmail.module.css.js';
var CuaSetEmailComponent = function CuaSetEmailComponent() {
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsShowBind = _useCuaSendStatsServi.sendStatsShowBind;
  var _useAdaptivityWithJSM = useAdaptivityWithJSMediaQueries(),
    isDesktop = _useAdaptivityWithJSM.isDesktop;
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    saveEmail = _useCuaStore.saveEmail,
    setErrors = _useCuaStore.setErrors,
    errors = _useCuaStore.errors;
  var _useState = useState(''),
    email = _useState[0],
    setEmail = _useState[1];
  var inputRef = useRef(null);
  var error = errors[ValidationMethodsType.Email];
  useEffect(function () {
    sendStatsShowBind(AnalyticsFactors.email);
  }, []);
  useEffect(function () {
    // из-за особенностей React, autoFocus ломает CSS анимацию.
    // поэтому ставим фокус с задержкой
    setTimeout(function () {
      var _inputRef$current;
      inputRef == null || (_inputRef$current = inputRef.current) == null || _inputRef$current.focus();
    }, 200);
  }, [inputRef]);
  var onSubmit = function onSubmit() {
    !loading && !error && email && saveEmail(email);
  };
  var handleChange = function handleChange(e) {
    var value = e.currentTarget.value;
    setEmail(value);
    setErrors({});
  };
  var clear = function clear() {
    setEmail('');
    setErrors({});
  };
  var content = jsx(FormItem, {
    className: styles.formItem,
    status: error ? 'error' : 'default',
    bottom: error,
    children: jsx(Input, {
      getRef: function getRef(el) {
        inputRef.current = el;
      },
      "data-test-id": cuaSetEmail.input,
      type: "email",
      placeholder: getLang('vkconnect_sak_cua_set_email_input_placeholder'),
      onChange: handleChange,
      value: email,
      disabled: loading,
      after: email && jsx(IconButton, {
        hoverMode: "opacity",
        onClick: clear,
        children: jsx(Icon16Clear, {})
      })
    })
  });
  var footer = jsxs(Fragment, {
    children: [!error && !isDesktop && jsx(Spacing, {
      size: 24
    }), jsx(Div, {
      children: jsx(ButtonGroup, {
        mode: "vertical",
        gap: "m",
        stretched: true,
        children: jsx(Button, {
          size: "l",
          "data-test-id": cuaSetEmail.submitBtn,
          stretched: true,
          disabled: !!error || email.length < 1 || loading,
          onClick: onSubmit,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_set_email_next_btn"
          })
        })
      })
    })]
  });
  return jsx(CuaBase, {
    onSubmit: onSubmit,
    header: jsx("div", {
      "data-test-id": cuaSetEmail.title,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_set_email_title"
      })
    }),
    description: jsx(Lang, {
      lang: "vkconnect_sak_cua_set_email_description"
    }),
    icon: jsx(IconIllustrationCreateMail120h, {
      "data-test-id": cuaSetEmail.icon
    }),
    content: content,
    footer: footer
  });
};
var CuaSetEmail = memo(CuaSetEmailComponent);
export { CuaSetEmail };
