import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Icon16Clear } from '@vkontakte/icons';
import { useAdaptivityWithJSMediaQueries, FormItem, Input, IconButton, Spacing, Div, ButtonGroup, Button } from '@vkontakte/vkui';
import { IconIllustrationCreatePhoneNumber120h } from '@vkontakte-internal/icons-private';
import { parsePhoneNumber } from 'awesome-phonenumber';
import { memo, useRef, useEffect } from 'react';
import { CuaBase } from '../../components/CuaBase/CuaBase.js';
import { cuaSetPhone } from '../../constants/testIds.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import Lang from '../../../../shared/providers/LangProvider/Lang.js';
import styles from './CuaSetPhone.module.css.js';
var CuaSetPhoneComponent = function CuaSetPhoneComponent() {
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsShowBind = _useCuaSendStatsServi.sendStatsShowBind;
  var _useAdaptivityWithJSM = useAdaptivityWithJSMediaQueries(),
    isDesktop = _useAdaptivityWithJSM.isDesktop;
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    errors = _useCuaStore.errors,
    setErrors = _useCuaStore.setErrors,
    bindPhone = _useCuaStore.bindPhone,
    setBindPhone = _useCuaStore.setBindPhone,
    sendPhoneBindCode = _useCuaStore.sendPhoneBindCode;
  var inputRef = useRef(null);
  var error = errors[ValidationMethodsType.Phone];
  useEffect(function () {
    sendStatsShowBind(AnalyticsFactors.phone);
  }, []);
  useEffect(function () {
    // из-за особенностей React, autoFocus ломает CSS анимацию.
    // поэтому ставим фокус с задержкой
    setTimeout(function () {
      var _inputRef$current;
      inputRef == null || (_inputRef$current = inputRef.current) == null || _inputRef$current.focus();
    }, 100);
  }, [inputRef]);
  var onSubmit = function onSubmit() {
    !loading && !error && bindPhone && sendPhoneBindCode(bindPhone);
  };
  var handleChange = function handleChange(e) {
    var _phoneNumber$number, _phoneNumber$number2;
    error && setErrors({});
    var value = e.currentTarget.value;
    var inputValue = (value.match(/[0-9]/g) || ['']).join('').replace(/^[78]/, '+7').replace(/^[9]/, '+79');
    var phoneNumber = parsePhoneNumber(inputValue);
    var data = (phoneNumber == null || (_phoneNumber$number = phoneNumber.number) == null ? void 0 : _phoneNumber$number.international) || (phoneNumber == null || (_phoneNumber$number2 = phoneNumber.number) == null ? void 0 : _phoneNumber$number2.input) || '';
    setBindPhone(data);
  };
  var clear = function clear() {
    setBindPhone('');
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
      "data-test-id": cuaSetPhone.input,
      type: "tel",
      placeholder: "+7",
      onChange: handleChange,
      value: bindPhone,
      disabled: loading,
      after: bindPhone && jsx(IconButton, {
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
          stretched: true,
          disabled: !error && bindPhone.length < 1 || loading,
          "data-test-id": cuaSetPhone.submitBtn,
          onClick: onSubmit,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_set_phone_next_btn"
          })
        })
      })
    })]
  });
  return jsx(CuaBase, {
    onSubmit: onSubmit,
    header: jsx("div", {
      "data-test-id": cuaSetPhone.title,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_set_phone_title"
      })
    }),
    description: jsx("span", {
      className: styles.text,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_set_phone_description"
      })
    }),
    icon: jsx(IconIllustrationCreatePhoneNumber120h, {
      "data-test-id": cuaSetPhone.icon
    }),
    content: content,
    footer: footer
  });
};
var CuaSetPhone = memo(CuaSetPhoneComponent);
export { CuaSetPhone };
