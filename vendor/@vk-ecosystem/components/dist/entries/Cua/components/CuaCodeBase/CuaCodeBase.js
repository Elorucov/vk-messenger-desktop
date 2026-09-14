import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useAdaptivityWithJSMediaQueries, Input, FormItem, Spacing, Div, ButtonGroup, Button } from '@vkontakte/vkui';
import { memo, useMemo, useState, useRef, useEffect } from 'react';
import { CuaBase } from '../CuaBase/CuaBase.js';
import { cuaCodeBase } from '../../constants/testIds.js';
import Lang from '../../../../shared/providers/LangProvider/Lang.js';
import styles from './CuaCodeBase.module.css.js';
var CuaCodeComponent = function CuaCodeComponent(_ref) {
  var loading = _ref.loading,
    icon = _ref.icon,
    sendCodeToDevice = _ref.sendCodeToDevice,
    saveCode = _ref.saveCode,
    header = _ref.header,
    description = _ref.description,
    codeLength = _ref.codeLength,
    canChangeMethod = _ref.canChangeMethod,
    canBindPhone = _ref.canBindPhone,
    goToChangeMethod = _ref.goToChangeMethod,
    goToSetPhone = _ref.goToSetPhone,
    timer = _ref.timer,
    error = _ref.error,
    setErrors = _ref.setErrors,
    retrySendCodeBtnText = _ref.retrySendCodeBtnText,
    _ref$canRetry = _ref.canRetry,
    canRetry = _ref$canRetry === void 0 ? true : _ref$canRetry,
    additionalFooter = _ref.additionalFooter;
  var _useAdaptivityWithJSM = useAdaptivityWithJSMediaQueries(),
    isDesktop = _useAdaptivityWithJSM.isDesktop;
  var arr = useMemo(function () {
    return Array.from(Array(codeLength).keys());
  }, [codeLength]);
  var defaultValue = useMemo(function () {
    return arr.reduce(function (acc, i) {
      var _Object$assign;
      return Object.assign({}, acc, (_Object$assign = {}, _Object$assign[i] = '', _Object$assign));
    }, {});
  }, [arr]);
  var _useState = useState(defaultValue),
    values = _useState[0],
    setValues = _useState[1];
  var inputRefs = useRef([]);
  var onChange = function onChange(e) {
    var _e$currentTarget = e.currentTarget,
      name = _e$currentTarget.name,
      value = _e$currentTarget.value;
    var inputValue = (value.match(/[0-9]/g) || ['']).join('').slice(0, codeLength);
    var currentIndex = Number(name);
    var nextIndex;
    var data = Object.assign({}, values);
    if (inputValue.length > 1) {
      for (var i = 0; i < inputValue.length; i++) {
        data[currentIndex] = inputValue[i];
        currentIndex++;
      }
    } else {
      data[name] = inputValue;
    }
    if (inputValue.length > 1 || !value) {
      nextIndex = currentIndex - 1;
    } else if (inputValue.length > 0 && value === inputValue) {
      nextIndex = currentIndex + 1;
    } else {
      nextIndex = currentIndex;
    }
    setErrors({});
    setValues(data);
    var nextInput = inputRefs == null ? void 0 : inputRefs.current[nextIndex];
    if (!!nextInput) {
      nextInput.focus();
      // Ставим фокус в конце строки чтобы избежать проблем с UX при стирании
      nextInput.selectionStart = nextInput.value.length;
    }
    var code = Object.values(data).join('');
    if (code.length === codeLength) {
      saveCode(code);
    }
  };
  var onKeyUp = function onKeyUp(e) {
    var keyCode = e.keyCode;
    var _e$currentTarget2 = e.currentTarget,
      name = _e$currentTarget2.name,
      value = _e$currentTarget2.value;
    if ((keyCode === 8 || keyCode === 46) && !value) {
      var _inputRefs$current$ne;
      var currentIndex = Number(name);
      var nextIndex = currentIndex - 1;
      inputRefs == null || (_inputRefs$current$ne = inputRefs.current[nextIndex]) == null || _inputRefs$current$ne.focus();
    }
  };
  var retryCode = function retryCode() {
    var _inputRefs$current$;
    sendCodeToDevice && sendCodeToDevice();
    setValues(defaultValue);
    inputRefs == null || (_inputRefs$current$ = inputRefs.current[0]) == null || _inputRefs$current$.focus();
  };
  useEffect(function () {
    // из-за особенностей React, autoFocus ломает CSS анимацию.
    // поэтому ставим фокус с задержкой
    setTimeout(function () {
      var _inputRefs$current$2;
      inputRefs == null || (_inputRefs$current$2 = inputRefs.current[0]) == null || _inputRefs$current$2.focus();
    }, 100);
  }, [inputRefs]);
  var inputs = useMemo(function () {
    return arr.map(function (i) {
      return jsx(Input, {
        className: styles.input,
        align: "center",
        "data-test-id": cuaCodeBase.input + "_" + i,
        type: "tel",
        name: i.toString(),
        maxLength: i === codeLength - 1 ? 1 : undefined,
        onChange: onChange,
        onKeyUp: onKeyUp,
        value: values[i],
        getRef: function getRef(el) {
          inputRefs.current[i] = el;
        },
        disabled: loading,
        autoComplete: "off"
      }, "input_" + i);
    });
  }, [codeLength, values, loading]);
  return jsx(CuaBase, {
    icon: icon,
    header: header,
    description: description,
    content: jsxs(FormItem, {
      status: error ? 'error' : 'default',
      bottom: error,
      children: [jsx("div", {
        "data-test-id": cuaCodeBase.inputArray,
        className: styles.group,
        children: inputs
      }), error && jsx(Spacing, {
        size: 4
      })]
    }),
    footer: jsxs(Fragment, {
      children: [!error && !isDesktop && jsx(Spacing, {
        size: 16
      }), jsx(Div, {
        className: !!error ? styles.actions : '',
        children: jsxs(ButtonGroup, {
          mode: "vertical",
          gap: "m",
          stretched: true,
          children: [canRetry && jsx(Button, {
            size: "l",
            mode: "tertiary",
            hasHover: !timer,
            hasActive: !timer,
            onClick: timer ? undefined : retryCode,
            stretched: true,
            disabled: loading,
            tabIndex: timer ? -1 : 0,
            children: timer ? timer : retrySendCodeBtnText ? retrySendCodeBtnText : jsx(Lang, {
              lang: "vkconnect_sak_cua_code_retry"
            })
          }), !canChangeMethod && canBindPhone && jsx(Button, {
            size: "l",
            mode: "tertiary",
            onClick: goToSetPhone,
            stretched: true,
            disabled: loading,
            children: jsx(Lang, {
              lang: "vkconnect_sak_cua_nav_to_set_phone"
            })
          }), canChangeMethod && jsx(Button, {
            size: "l",
            mode: "tertiary",
            onClick: goToChangeMethod,
            stretched: true,
            disabled: loading,
            "data-test-id": cuaCodeBase.changeMethodBtn,
            children: jsx(Lang, {
              lang: "vkconnect_sak_cua_change_method"
            })
          }), additionalFooter && additionalFooter]
        })
      })]
    })
  });
};
var CuaCodeBase = memo(CuaCodeComponent);
export { CuaCodeBase };
