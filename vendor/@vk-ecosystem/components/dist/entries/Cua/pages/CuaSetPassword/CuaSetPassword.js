import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Icon20CopyOutline, Icon20HideOutline, Icon20ViewOutline } from '@vkontakte/icons';
import { debounce } from './../../../../deps/.pnpm/@vkontakte_vkjs@0.32.4/deps/@vkontakte/vkjs/lib/es6/functions.js';
import { useModalRootContext, useAdaptivityWithJSMediaQueries, usePlatform, Platform, FormItem, Footnote, Progress, Link, IconButton, Input, Spacing, Div, ButtonGroup, Button } from '@vkontakte/vkui';
import classnames from '../../../../_virtual/index.js';
import { memo, useContext, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Lottie from 'react-lottie-player';
import { passwordAnimationData } from '../../../../assets/animations/passwordAnimation.js';
import { CuaBase } from '../../components/CuaBase/CuaBase.js';
import { ProgressConfig } from '../../constants/CuaPasswordSecurityLevels.js';
import { PasswordAnimationLevels } from '../../constants/animation.js';
import { cuaSetPassword } from '../../constants/testIds.js';
import { usePasswordAnimation } from '../../hooks/usePasswordAnimation.js';
import styles from './CuaSetPassword.module.css.js';
import { useCuaSendStatsService } from '../../services/CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../../services/CuaSendStatsService/types.js';
import { useCuaStore } from '../../services/CuaStore/CuaStore.js';
import { ValidationMethodsType } from '../../services/CuaStore/types.js';
import { useFeatureTogglesProviderContext } from '../../../../shared/providers/FeatureTogglesProvider/FeatureTogglesProviderContext.js';
import Lang from '../../../../shared/providers/LangProvider/Lang.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
var CuaSetPasswordComponent = function CuaSetPasswordComponent() {
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    sendStatsShowBind = _useCuaSendStatsServi.sendStatsShowBind,
    sendStatsPasswordGenerate = _useCuaSendStatsServi.sendStatsPasswordGenerate,
    sendStatsPasswordGenerateIncorrect = _useCuaSendStatsServi.sendStatsPasswordGenerateIncorrect,
    sendStatsPasswordGenerateSuccess = _useCuaSendStatsServi.sendStatsPasswordGenerateSuccess;
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var _useModalRootContext = useModalRootContext(),
    updateModalHeight = _useModalRootContext.updateModalHeight;
  var _useAdaptivityWithJSM = useAdaptivityWithJSMediaQueries(),
    isDesktop = _useAdaptivityWithJSM.isDesktop;
  var platform = usePlatform();
  var _useCuaStore = useCuaStore(),
    loading = _useCuaStore.loading,
    checkPassword = _useCuaStore.checkPassword,
    generatePassword = _useCuaStore.generatePassword,
    errors = _useCuaStore.errors,
    setPasswordApi = _useCuaStore.setPassword,
    setErrors = _useCuaStore.setErrors;
  var _useState = useState(''),
    password = _useState[0],
    setPassword = _useState[1];
  var _useState2 = useState(''),
    confirmPassword = _useState2[0],
    setConfirmPassword = _useState2[1];
  var _useState3 = useState(''),
    generatedPassword = _useState3[0],
    setGeneratedPassword = _useState3[1];
  var _useState4 = useState(false),
    isPasswordsEqualError = _useState4[0],
    setIsPasswordsEqualError = _useState4[1];
  var _useState5 = useState(PasswordAnimationLevels.INITIAL),
    passwordSecurityLevel = _useState5[0],
    setPasswordSecurityLevel = _useState5[1];
  var _useState6 = useState(''),
    passwordSecurityMessage = _useState6[0],
    setPasswordSecurityMessage = _useState6[1];
  var _useState7 = useState(false),
    view = _useState7[0],
    setView = _useState7[1];
  var _useState8 = useState(false),
    isVisibleCopyPassword = _useState8[0],
    setIsVisibleCopyPassword = _useState8[1];
  var _useState9 = useState(false),
    isGeneratePasswordFlowEnabled = _useState9[0],
    setIsGeneratePasswordFlowEnabled = _useState9[1];
  var _useState10 = useState(false),
    confirmView = _useState10[0],
    setConfirmView = _useState10[1];
  var inputRef = useRef(null);
  var inputConfirmRef = useRef(null);
  var error = errors[ValidationMethodsType.Password];
  var _usePasswordAnimation = usePasswordAnimation(passwordSecurityLevel, password),
    animated = _usePasswordAnimation.animated,
    animationSegments = _usePasswordAnimation.animationSegments,
    resetAnimation = _usePasswordAnimation.resetAnimation;
  var _useFeatureTogglesPro = useFeatureTogglesProviderContext(),
    features = _useFeatureTogglesPro.features;
  var isPasswordGeneratorEnabled = useMemo(function () {
    if (features) {
      var enabledValues = ['3', '4', '5', '6'];
      var webExp = features == null ? void 0 : features['vkc_account_pass_gen_web'];
      var androidExp = features == null ? void 0 : features['vkc_account_pass_gen_android'];
      var iosExp = features == null ? void 0 : features['vkc_account_pass_gen_ios'];
      var isAndroidOn = Boolean(enabledValues.includes((androidExp == null ? void 0 : androidExp.value) || '') && (androidExp == null ? void 0 : androidExp.enabled) && platform === Platform.ANDROID && !isDesktop);
      var isIosOn = Boolean(enabledValues.includes((iosExp == null ? void 0 : iosExp.value) || '') && (iosExp == null ? void 0 : iosExp.enabled) && platform === Platform.IOS && !isDesktop);
      var isWebOn = Boolean(enabledValues.includes((webExp == null ? void 0 : webExp.value) || '') && (webExp == null ? void 0 : webExp.enabled) && isDesktop);
      return isAndroidOn || isIosOn || isWebOn;
    }
    return false;
  }, [features]);
  useEffect(function () {
    sendStatsShowBind(AnalyticsFactors.password);
  }, []);
  useEffect(updateModalHeight, [isPasswordGeneratorEnabled]);
  useEffect(function () {
    if (isPasswordGeneratorEnabled) {
      setIsGeneratePasswordFlowEnabled(generatedPassword === password);
    }
  }, [generatedPassword, password, isPasswordGeneratorEnabled]);
  useEffect(function () {
    setTimeout(function () {
      var _inputRef$current;
      inputRef == null || (_inputRef$current = inputRef.current) == null || _inputRef$current.focus();
    }, 200);
  }, [inputRef, inputConfirmRef]);
  var onSubmit = useCallback(function () {
    if (password !== confirmPassword) {
      setIsPasswordsEqualError(true);
      sendStatsPasswordGenerateIncorrect(isGeneratePasswordFlowEnabled);
    } else {
      sendStatsPasswordGenerateSuccess(isGeneratePasswordFlowEnabled);
      !loading && !error && password && !isPasswordsEqualError && setPasswordApi(password);
    }
  }, [password, confirmPassword, isGeneratePasswordFlowEnabled]);
  var debouncedCheckPassword = useCallback(debounce(function (password) {
    if (!password) {
      setPasswordSecurityMessage('');
      setPasswordSecurityLevel(PasswordAnimationLevels.INITIAL);
      return;
    }
    checkPassword(password).then(function (res) {
      if (res.security_message) {
        setPasswordSecurityMessage(res.security_message);
      } else {
        setPasswordSecurityMessage('');
      }
      setPasswordSecurityLevel(res.security_level);
    })["catch"](console.error);
  }, 250), [password]);
  var setPasswordHandle = function setPasswordHandle(value) {
    setPassword(value);
    setErrors({});
    debouncedCheckPassword(value);
  };
  var handleChange = useCallback(function (e) {
    var value = e.currentTarget.value;
    isPasswordsEqualError && setIsPasswordsEqualError(false);
    setPasswordHandle(value);
  }, [isPasswordsEqualError]);
  var generatePasswordHandler = function generatePasswordHandler() {
    sendStatsPasswordGenerate();
    generatePassword().then(function (res) {
      if (res.password) {
        setPasswordHandle(res.password);
        setGeneratedPassword(res.password);
        setView(true);
        setIsVisibleCopyPassword(true);
      }
    })["catch"](console.error);
  };
  var handleConfirmChange = useCallback(function (e) {
    var value = e.currentTarget.value;
    isPasswordsEqualError && setIsPasswordsEqualError(false);
    setConfirmPassword(value);
    setErrors({});
  }, [isPasswordsEqualError]);
  var handleCopyText = function handleCopyText() {
    if (navigator) {
      navigator.clipboard.writeText(password)["catch"](console.warn);
    }
  };
  var passwordStatusText = useMemo(function () {
    var _colors;
    var securityLevel = password.length > 0 ? passwordSecurityLevel : PasswordAnimationLevels.INITIAL;
    var _ProgressConfig$secur = ProgressConfig[securityLevel],
      strengthLangKey = _ProgressConfig$secur.strengthLangKey,
      progress = _ProgressConfig$secur.progress;
    var colors = (_colors = {}, _colors[styles.passwordWeak] = [PasswordAnimationLevels.WEAK, PasswordAnimationLevels.ERROR].includes(securityLevel), _colors[styles.passwordFair] = securityLevel === PasswordAnimationLevels.FAIR, _colors[styles.passwordStrong] = securityLevel === PasswordAnimationLevels.STRONG, _colors);
    return jsx(FormItem, {
      className: styles.textDiv,
      bottom: jsxs(Fragment, {
        children: [strengthLangKey ? jsx(Footnote, {
          className: classnames(colors),
          weight: securityLevel !== PasswordAnimationLevels.INITIAL ? '1' : '3',
          useAccentWeight: true,
          children: getLang(strengthLangKey)
        }) : null, passwordSecurityMessage && password.length ? jsx(Footnote, {
          className: classnames(colors),
          weight: "3",
          useAccentWeight: true,
          children: passwordSecurityMessage
        }) : null]
      }),
      children: jsx(Progress, {
        className: classnames(styles.progress, colors),
        value: progress
      })
    });
  }, [passwordSecurityLevel, passwordSecurityMessage, password]);
  var icon = jsx(Lottie, {
    animationData: passwordAnimationData,
    segments: animationSegments,
    loop: false,
    play: animated,
    onComplete: resetAnimation,
    className: styles.icon,
    "data-test-id": cuaSetPassword.icon
  });
  var generatePasswordComponent = jsx(FormItem, {
    className: styles.generatePasswordWrapper,
    children: jsx(Link, {
      className: styles.generatePassword,
      onClick: generatePasswordHandler,
      children: getLang('vkconnect_sak_cua_generate_password_title')
    })
  });
  var passwordInputAfter = jsxs(Fragment, {
    children: [isPasswordGeneratorEnabled && isVisibleCopyPassword && jsx("div", {
      className: styles.copyIcon,
      onClick: handleCopyText,
      children: jsx(Icon20CopyOutline, {})
    }), jsx(IconButton, {
      hoverMode: "opacity",
      onClick: function onClick() {
        return setView(function (prev) {
          return !prev;
        });
      },
      children: view ? jsx(Icon20HideOutline, {}) : jsx(Icon20ViewOutline, {})
    })]
  });
  var content = jsxs(Fragment, {
    children: [jsx(FormItem, {
      className: styles.formItem,
      status: isPasswordsEqualError || error ? 'error' : 'default',
      children: jsx(Input, {
        getRef: function getRef(el) {
          inputRef.current = el;
        },
        type: view ? 'text' : 'password',
        placeholder: getLang('vkconnect_sak_cua_set_password_input_placeholder'),
        onChange: handleChange,
        value: password,
        disabled: loading,
        "data-test-id": cuaSetPassword.passwordInput,
        after: passwordInputAfter
      })
    }), passwordStatusText, isPasswordGeneratorEnabled && generatePasswordComponent, jsx(FormItem, {
      className: styles.formItem,
      bottom: isPasswordsEqualError ? jsx(Lang, {
        lang: "vkconnect_sak_cua_set_password_different_passwords_error"
      }) : error,
      status: isPasswordsEqualError || error ? 'error' : 'default',
      children: jsx(Input, {
        getRef: function getRef(el) {
          inputConfirmRef.current = el;
        },
        type: confirmView ? 'text' : 'password',
        placeholder: getLang('vkconnect_sak_cua_set_password_confirm_input_placeholder'),
        onChange: handleConfirmChange,
        value: confirmPassword,
        disabled: loading,
        "data-test-id": cuaSetPassword.confirmPasswordInput,
        after: jsx(IconButton, {
          hoverMode: "opacity",
          onClick: function onClick() {
            return setConfirmView(function (prev) {
              return !prev;
            });
          },
          children: confirmView ? jsx(Icon20HideOutline, {}) : jsx(Icon20ViewOutline, {})
        })
      })
    })]
  });
  var footer = jsxs(Fragment, {
    children: [!error && !isDesktop && jsx(Spacing, {
      size: 22
    }), jsx(Div, {
      children: jsx(ButtonGroup, {
        mode: "vertical",
        stretched: true,
        children: jsx(Button, {
          size: "l",
          stretched: true,
          disabled: !!error || confirmPassword.length < 1 || password.length < 1 || isPasswordsEqualError || passwordSecurityLevel < PasswordAnimationLevels.FAIR || loading,
          "data-test-id": cuaSetPassword.submitBtn,
          onClick: onSubmit,
          children: jsx(Lang, {
            lang: "vkconnect_sak_cua_set_password_next_btn"
          })
        })
      })
    })]
  });
  return jsx(CuaBase, {
    onSubmit: onSubmit,
    header: jsx("div", {
      "data-test-id": cuaSetPassword.title,
      children: jsx(Lang, {
        lang: "vkconnect_sak_cua_set_password_title"
      })
    }),
    description: jsx(Lang, {
      lang: "vkconnect_sak_cua_set_password_description"
    }),
    icon: icon,
    content: content,
    footer: footer
  });
};
var CuaSetPassword = memo(CuaSetPasswordComponent);
export { CuaSetPassword };
