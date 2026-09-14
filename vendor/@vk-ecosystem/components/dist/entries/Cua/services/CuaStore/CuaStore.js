import _objectWithoutPropertiesLoose from './../../../../deps/.pnpm/@babel_runtime@7.27.0/deps/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js';
import { jsx } from 'react/jsx-runtime';
import vkBridge from '@vkontakte/vk-bridge';
import { usePlatform, Platform, Alert } from '@vkontakte/vkui';
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { CuaEmailAlertError, CuaAlertError, CuaPasswordAlertError, CuaPhoneAlertError, CuaMaxAlertError } from '../../constants/CuaAlertError.js';
import { CuaCode, CuaEmailErrorCode, CuaPasswordErrorCode, CuaPhoneErrorCode, CuaMaxErrorCode } from '../../constants/CuaCode.js';
import { CuaInputErrors } from '../../constants/CuaInputError.js';
import { HARDCODED_TIMOUT, SUPPORTED_VERSION_ANDROID, SUPPORTED_VERSION_IOS } from '../../constants/LibverifyConst.js';
import { CHANGE_PHONE_SUPPORT_URL, PHONE_BANNED_SUPPORT_URL } from '../../constants/Url.js';
import { useMaxInCua } from '../../hooks/useMaxInCua/useMaxInCua.js';
import { useCuaApiService } from '../CuaApiService/CuaApiService.js';
import { useCuaMessengerCheck } from '../CuaMessengerCheckService/CuaMessengerCheckService.js';
import { useCuaSendStatsService } from '../CuaSendStatsService/CuaSendStatsService.js';
import { AnalyticsFactors } from '../CuaSendStatsService/types.js';
import { castToAnalyticFactor } from './helpers.js';
import { CuaPages } from '../../types.js';
import { getCuaState, setCuaState, getPageByMethod } from '../../utils.js';
import { LangProviderContext } from '../../../../shared/providers/LangProvider/LangProviderContext.js';
import { CuaLibverifyEvents, CuaLibverifyStates, ValidationMethodsType, CuaLibverifyError } from './types.js';
var _excluded = ["children"];
var WHITE_LIST = {
  phone: 'phone',
  email: 'email',
  password: 'password',
  push: 'push',
  max: 'max'
};
var useInitCuaStore = function useInitCuaStore(_ref) {
  var session = _ref.session,
    onSuccess = _ref.onSuccess,
    showPopout = _ref.showPopout,
    hidePopout = _ref.hidePopout,
    getExchangeHash = _ref.getExchangeHash,
    exchangeToken = _ref.exchangeToken,
    libverifyEnabled = _ref.libverifyEnabled,
    additionalServiceFooter = _ref.additionalServiceFooter,
    disableIcon = _ref.disableIcon,
    disableToggles = _ref.disableToggles;
  var _useCuaSendStatsServi = useCuaSendStatsService(),
    applyAnalyticsParams = _useCuaSendStatsServi.applyAnalyticsParams,
    sendStatsSuccess = _useCuaSendStatsServi.sendStatsSuccess,
    sendStatsConfirmationCodeError = _useCuaSendStatsServi.sendStatsConfirmationCodeError,
    sendStatsShowBindPasswordSuccess = _useCuaSendStatsServi.sendStatsShowBindPasswordSuccess,
    sendStatsShowBindSuccess = _useCuaSendStatsServi.sendStatsShowBindSuccess,
    sendStatsErrors = _useCuaSendStatsServi.sendStatsErrors,
    sendStatsConfirmationCode = _useCuaSendStatsServi.sendStatsConfirmationCode,
    sendStateLibverifyFallbackTo = _useCuaSendStatsServi.sendStateLibverifyFallbackTo,
    sendStateLibverifyMobileIdFail = _useCuaSendStatsServi.sendStateLibverifyMobileIdFail;
  var _useContext = useContext(LangProviderContext),
    getLang = _useContext.getLang;
  var _useCuaApiService = useCuaApiService(),
    apiRequest = _useCuaApiService.apiRequest,
    loading = _useCuaApiService.loading,
    globalLoading = _useCuaApiService.globalLoading,
    setLoading = _useCuaApiService.setLoading;
  var _useCuaMessengerCheck = useCuaMessengerCheck(),
    startMessengerCheck = _useCuaMessengerCheck.startMessengerCheck,
    stopMessengerCheck = _useCuaMessengerCheck.stopMessengerCheck;
  var _useState = useState(null),
    currentPage = _useState[0],
    setCurrentPage = _useState[1];
  var _useState2 = useState({}),
    methods = _useState2[0],
    setMethods = _useState2[1];
  var _useState3 = useState({}),
    errors = _useState3[0],
    setErrors = _useState3[1];
  var _useState4 = useState(false),
    canChangeMethod = _useState4[0],
    setCanChangeMethod = _useState4[1];
  var _useState5 = useState(''),
    bindPhone = _useState5[0],
    setBindPhone = _useState5[1];
  var _useState6 = useState(false),
    canBindPhone = _useState6[0],
    setCanBindPhone = _useState6[1];
  var _useState7 = useState(false),
    wasTransitionToMethods = _useState7[0],
    setWasTransitionToMethods = _useState7[1];
  var _useMaxInCua = useMaxInCua(currentPage),
    startCheckMaxSession = _useMaxInCua.startCheckMaxSession;
  var canUseLibverify = useRef(false);
  var libverifySupported = useRef(false);
  var platform = usePlatform();
  var fallbackMethod = useRef(CuaPages.MAIN);
  var currentState = useRef();
  var libverifyFlowEnabled = useRef(false);
  var _useState8 = useState(HARDCODED_TIMOUT),
    libverifyTimer = _useState8[0],
    setLibverifyTimer = _useState8[1];
  var isWebView = vkBridge.isWebView();
  var bindedPhone = useRef('');
  function asyncGoToPage(page, withGlobalLoader) {
    if (withGlobalLoader === void 0) {
      withGlobalLoader = false;
    }
    window.setTimeout(function () {
      return goToPage(page, withGlobalLoader);
    }, 0);
  }
  var libverifyErrorHandler = function libverifyErrorHandler(goToPage, error) {
    switch (error) {
      case CuaLibverifyError.INCORRECT_SMS_CODE:
        {
          var _Object$assign;
          setErrors(Object.assign({}, errors, (_Object$assign = {}, _Object$assign[ValidationMethodsType.Phone] = getLang(CuaInputErrors[CuaCode.CODE_ERROR_INCORRECT_CODE]), _Object$assign)));
          sendStatsConfirmationCodeError(castToAnalyticFactor(fallbackMethod.current));
        }
        break;
      case CuaLibverifyError.DEFAULT:
      case CuaLibverifyError.BLACK_LIST:
      case CuaLibverifyError.NO_NETWORK:
      case CuaLibverifyError.RATE_LIMIT:
      case CuaLibverifyError.NO_MORE_ROUTES:
      case CuaLibverifyError.INCORRECT_PHONE_NUMBER:
      case CuaLibverifyError.UNSUPPORTED_NUMBER:
      case CuaLibverifyError.NETWORK:
        {
          libverifyFlowEnabled.current = false;
          currentState.current = CuaLibverifyStates.ERROR;
          sendStateLibverifyFallbackTo(castToAnalyticFactor(fallbackMethod.current));
          goToPage(fallbackMethod.current, true);
          break;
        }
    }
  };
  var libverifyStatesHandler = function libverifyStatesHandler(libverifyEventData, phone, goToPage) {
    var current_state = libverifyEventData.current_state,
      error = libverifyEventData.error,
      current_loader_state = libverifyEventData.current_loader_state,
      validate_session = libverifyEventData.validate_session,
      validate_token = libverifyEventData.validate_token;
    if (current_state !== CuaLibverifyStates.COMPLETED) {
      setLoading(current_loader_state);
    }
    if (currentState.current === current_state) {
      return;
    }
    if (current_state === CuaLibverifyStates.MOBILE_ID) {
      sendStatsConfirmationCode(AnalyticsFactors.mobileId, true);
    }
    if (currentState.current === CuaLibverifyStates.MOBILE_ID && current_state !== CuaLibverifyStates.COMPLETED) {
      sendStateLibverifyMobileIdFail(castToAnalyticFactor(current_state));
    }
    if (current_state === CuaLibverifyStates.ERROR) {
      switch (currentState.current) {
        case CuaLibverifyStates.SMS:
          fallbackMethod.current = CuaPages.SMS;
          break;
        case CuaLibverifyStates.CALL_RESET:
          fallbackMethod.current = CuaPages.CALL;
          break;
        default:
          fallbackMethod.current = CuaPages.MAIN;
      }
    }
    switch (current_state) {
      case CuaLibverifyStates.SMS:
        {
          currentState.current = current_state;
          goToPage(CuaPages.SMS);
          return;
        }
      case CuaLibverifyStates.CALL_RESET:
        {
          setMethods(function (prevMethods) {
            return Object.assign({}, prevMethods, {
              phone: Object.assign({}, prevMethods.phone, {
                code_length: libverifyEventData.digits_count
              })
            });
          });
          currentState.current = current_state;
          goToPage(CuaPages.CALL);
          return;
        }
      case CuaLibverifyStates.MOBILE_ID:
        {
          currentState.current = current_state;
          return;
        }
      case CuaLibverifyStates.COMPLETED:
        {
          libverifyFlowEnabled.current = false;
          var cuaState = getCuaState();
          var apiMethod = phone ? 'cua.checkLibverifyBindPhone' : 'cua.checkLibverify';
          void apiRequest(apiMethod, {
            libverify_session: validate_session,
            libverify_token: validate_token,
            session: session,
            phone: phone,
            cua_state: cuaState
          }).then(function (response) {
            if (response != null && response.cua_state) {
              setCuaState(response.cua_state);
            }
            sendStatsSuccess(castToAnalyticFactor(currentState.current), methods, wasTransitionToMethods, true);
            onSuccess({
              session: session
            });
          });
          setLoading(true);
          return;
        }
      case CuaLibverifyStates.ERROR:
        {
          console.log('error', error);
          libverifyErrorHandler(goToPage, error);
        }
        return;
    }
  };
  var bridgeHandler = useCallback(function (event) {
    if (event.detail.type === CuaLibverifyEvents.CHANGE_STATE) {
      libverifyStatesHandler(event.detail.data, bindedPhone.current, asyncGoToPage);
    }
  }, []);
  var stopLibverify = useCallback(function () {
    libverifyFlowEnabled.current = false;
    return vkBridge.send(CuaLibverifyEvents.CANCEL, {})["finally"](function () {
      vkBridge.unsubscribe(bridgeHandler);
    });
  }, []);
  useEffect(function () {
    if (isWebView && vkBridge.supports(CuaLibverifyEvents.SUPPORTED)) {
      void vkBridge.send(CuaLibverifyEvents.SUPPORTED, {})
      /**
       * TODO: поменять any на нормальную типизацию после обновления в бридже
       */.then(function (response) {
        if (response.supported) {
          var androidSupported = platform === Platform.ANDROID && response.version >= SUPPORTED_VERSION_ANDROID;
          var iosSupported = platform === Platform.IOS && response.version >= SUPPORTED_VERSION_IOS;
          if (androidSupported || iosSupported) {
            libverifySupported.current = true;
          }
        }
      })["catch"](function (reason) {
        console.warn('[Cua] bridge error:', reason);
      });
    }
    return function () {
      void stopLibverify();
    };
  }, []);
  var shouldUseLibverify = function shouldUseLibverify() {
    return libverifyEnabled && canUseLibverify.current && libverifySupported.current && !(currentState.current === CuaLibverifyStates.ERROR) && !libverifyFlowEnabled.current;
  };
  var phoneBindResponseCodeHandler = function phoneBindResponseCodeHandler(response) {
    switch (response.code) {
      case CuaCode.CODE_OTP_CODE_SENT:
        var page = response.phone_info.current_code_type;
        setCurrentPage(page);
        handleResponse(ValidationMethodsType.Phone, response);
        return;
      case CuaCode.CODE_ERROR_PHONE_BIND_CHECK_ERROR:
        sendStatsErrors(response.code);
        handleBindPhoneError(response.phone_error);
        break;
      default:
        handleResponse(ValidationMethodsType.Phone, response);
        return;
    }
  };
  var startLibverify = function startLibverify(goToPage, fallbackFunc) {
    var noopReturn = function noopReturn() {
      return new Promise(function () {
        return;
      });
    };
    if (libverifyFlowEnabled.current || currentState.current === CuaLibverifyStates.ERROR) {
      return noopReturn();
    }
    var cuaState = getCuaState();
    var method = bindedPhone.current ? 'cua.getLibverifyBindPhoneAuthKey' : 'cua.getLibverifyAuthKey';
    return apiRequest(method, {
      session: session,
      phone: bindedPhone.current,
      cua_state: cuaState
    }).then(function (result) {
      var _Object$assign2;
      if (bindedPhone.current && !result.auth_key) {
        phoneBindResponseCodeHandler(result);
        return;
      }
      if (!result.auth_key && fallbackFunc) {
        void fallbackFunc();
        return;
      }
      setMethods(Object.assign({}, methods, (_Object$assign2 = {}, _Object$assign2[ValidationMethodsType.Phone] = Object.assign({}, result.phone_info, {
        timeout: libverifyTimer
      }), _Object$assign2)));
      void vkBridge
      /**
       * TODO: поменять any на норм типизацию при подключении api
       */.send(CuaLibverifyEvents.START, {
        auth_key: result.auth_key
      })
      /**
       * TODO: поменять any на норм типизацию при подключении api
       */.then(function (response) {
        libverifyFlowEnabled.current = true;
        if (response.result) {
          void vkBridge.subscribe(bridgeHandler);
        }
      })["catch"](function () {
        libverifySupported.current = false;
        if (fallbackFunc) {
          void fallbackFunc();
        }
      });
    });
  };
  var checkLibverifyOTP = function checkLibverifyOTP(otp) {
    /**
     * TODO: поменять any на норм типизацию при подключении api
     */
    void vkBridge.send(CuaLibverifyEvents.CHECK, {
      otp: otp
    });
  };
  var nativeClientSaveCredentials = function nativeClientSaveCredentials(credentials) {
    void vkBridge.send('VKWebAppSaveCredentials', credentials);
  };
  var sendLibverifyOTP = function sendLibverifyOTP() {
    setLibverifyTimer(HARDCODED_TIMOUT);
    return vkBridge.send(CuaLibverifyEvents.RESEND, {})["catch"](function (error) {
      console.log('error', error);
    });
  };
  /**
   * actions
   */
  var showAlertError = function showAlertError(config, actions, actionsLayout, textParams) {
    var defaultActions = [{
      title: getLang('vkconnect_sak_cua_error_default_btn_text'),
      mode: 'default',
      action: hidePopout
    }];
    var text = textParams ? getLang(config.text).replace(textParams.nameKey, textParams == null ? void 0 : textParams.value) : getLang(config.text);
    showPopout(jsx(Alert, {
      actions: actions ? actions : defaultActions,
      title: getLang(config.header),
      description: text,
      onClose: hidePopout,
      actionsLayout: actionsLayout
    }));
  };
  var getMethods = function getMethods(withGlobalLoader, firstLoad) {
    if (withGlobalLoader === void 0) {
      withGlobalLoader = false;
    }
    if (firstLoad === void 0) {
      firstLoad = false;
    }
    var state = getCuaState();
    return apiRequest('cua.getValidationMethods', {
      session: session,
      cua_state: state
    }, {
      global: withGlobalLoader,
      local: !withGlobalLoader
    }).then(function (res) {
      var _methods$find, _phoneInfo$libverify;
      if (res.code === CuaCode.CODE_SKIP_CUA) {
        onSuccess({
          session: session
        });
        return;
      }
      var methods = res.methods.filter(function (_ref2) {
        var type = _ref2.type;
        return !!WHITE_LIST[type];
      });
      var phoneInfo = (_methods$find = methods.find(function (_ref3) {
        var type = _ref3.type;
        return type === 'phone';
      })) == null ? void 0 : _methods$find.phone_info;
      var hasPhone = phoneInfo == null ? void 0 : phoneInfo.has_phone;
      var isLibverify = phoneInfo == null || (_phoneInfo$libverify = phoneInfo.libverify) == null ? void 0 : _phoneInfo$libverify.enabled;
      var registeredPhoneCountryId = phoneInfo == null ? void 0 : phoneInfo.registered_phone_country_id;
      if (registeredPhoneCountryId) {
        applyAnalyticsParams({
          registered_phone_country_id: registeredPhoneCountryId
        });
      }
      if (libverifySupported.current && isLibverify) {
        canUseLibverify.current = true;
      }
      if (libverifyFlowEnabled.current) {
        void stopLibverify();
      }
      if (methods.length > 1 && hasPhone === false) {
        setCanBindPhone(true);
        methods = methods.filter(function (_ref4) {
          var type = _ref4.type;
          return type !== 'phone';
        });
      }
      var data = methods.reduce(function (acc, item) {
        var _Object$assign3;
        return Object.assign({}, acc, (_Object$assign3 = {}, _Object$assign3[item.type] = item[item.type + "_info"], _Object$assign3));
      }, {});
      setMethods(data);
      setCanChangeMethod(methods.length > 1);
      if (firstLoad && methods.length > 0) {
        var page = getPageByMethod(methods[0]);
        goToPage(page, withGlobalLoader);
      }
    })["catch"](function (err) {
      console.warn('[Cua] error:', err);
    });
  };
  var sendPushCodeToDevice = function sendPushCodeToDevice(withGlobalLoader) {
    if (withGlobalLoader === void 0) {
      withGlobalLoader = false;
    }
    var state = getCuaState();
    return apiRequest('cua.sendPushCode', {
      session: session,
      cua_state: state
    }, {
      global: withGlobalLoader,
      local: !withGlobalLoader
    }).then(function (response) {
      handleResponse(ValidationMethodsType.Push, response);
    })["catch"](function (err) {
      console.warn('[Cua] error:', err);
    });
  };
  var savePushCode = function savePushCode(code) {
    var state = getCuaState();
    void apiRequest('cua.checkPushCode', {
      session: session,
      code: code,
      cua_state: state
    }, {
      local: true
    }).then(function (response) {
      var _Object$assign4;
      if (response.cua_state) {
        setCuaState(response.cua_state);
      }
      switch (response.code) {
        case CuaCode.CODE_OK:
        case CuaCode.CODE_METHOD_OK:
        case CuaCode.CODE_SKIP_CUA:
          sendStatsSuccess(AnalyticsFactors.push, methods, wasTransitionToMethods);
          onSuccess({
            session: session
          });
          break;
        case CuaCode.CODE_NEED_MORE_VALIDATION:
          sendStatsSuccess(AnalyticsFactors.push, methods, wasTransitionToMethods);
          void getMethods(false, true);
          break;
        case CuaCode.CODE_ERROR_INCORRECT_CODE:
          sendStatsConfirmationCodeError(AnalyticsFactors.push);
          setErrors(Object.assign({}, errors, (_Object$assign4 = {}, _Object$assign4[ValidationMethodsType.Push] = getLang(CuaInputErrors[response.code]), _Object$assign4)));
          break;
        default:
          handleResponse(ValidationMethodsType.Push, response);
          break;
      }
    })["catch"](function (err) {
      console.warn('[Cua] error:', err);
    });
  };
  var checkMaxCode = function checkMaxCode(code) {
    var state = getCuaState();
    apiRequest('cua.checkMaxCode', {
      session: session,
      code: code,
      cua_state: state
    }, {
      local: true
    }).then(function (response) {
      if (response.cua_state) {
        setCuaState(response.cua_state);
      }
      switch (response.code) {
        case CuaCode.CODE_OK:
        case CuaCode.CODE_METHOD_OK:
        case CuaCode.CODE_SKIP_CUA:
          sendStatsSuccess(AnalyticsFactors.max, methods, wasTransitionToMethods);
          onSuccess({
            session: session
          });
          break;
        case CuaCode.CODE_NEED_MORE_VALIDATION:
          sendStatsSuccess(AnalyticsFactors.max, methods, wasTransitionToMethods);
          void getMethods(false, true);
          break;
        default:
          handleResponse(ValidationMethodsType.Max, response);
          return;
      }
    })["catch"](function (err) {
      console.warn('[Cua] error:', err);
    });
  };
  var sendMaxCode = function sendMaxCode(withGlobalLoader) {
    if (withGlobalLoader === void 0) {
      withGlobalLoader = false;
    }
    var fallbackToApiFunc = function fallbackToApiFunc() {
      var state = getCuaState();
      return apiRequest('cua.sendMaxCode', {
        session: session,
        cua_state: state
      }, {
        global: withGlobalLoader,
        local: !withGlobalLoader
      }).then(function (response) {
        switch (response.code) {
          case CuaCode.CODE_OTP_CODE_SENT:
            handleResponse(ValidationMethodsType.Max, response);
            startCheckMaxSession(response.max_messenger_hash, session, {
              onVerify: checkMaxCode,
              showAlertError: showAlertError
            });
            return response;
          default:
            handleResponse(ValidationMethodsType.Max, response);
            return response;
        }
      })["catch"](function (err) {
        if ((err == null ? void 0 : err.error_code) === CuaMaxErrorCode.INTERNAL_SERVER_ERROR) {
          sendStatsErrors(err.error_code);
          showAlertError(CuaMaxAlertError[err.error_code]);
        }
        console.warn('[Cua] error:', err);
      });
    };
    return fallbackToApiFunc();
  };
  var sendPhoneCode = function sendPhoneCode(withGlobalLoader) {
    if (withGlobalLoader === void 0) {
      withGlobalLoader = false;
    }
    var fallbackToApiFunc = function fallbackToApiFunc() {
      var state = getCuaState();
      return apiRequest('cua.sendPhoneCode', {
        session: session,
        cua_state: state
      }, {
        global: withGlobalLoader,
        local: !withGlobalLoader
      }).then(function (response) {
        var _Object$assign5, _Object$assign6;
        switch (response.code) {
          case CuaCode.CODE_OTP_CODE_SENT:
            setMethods(Object.assign({}, methods, (_Object$assign5 = {}, _Object$assign5[ValidationMethodsType.Phone] = response.phone_info, _Object$assign5)));
            var page = response.phone_info.current_code_type;
            setCurrentPage(page);
            handleResponse(ValidationMethodsType.Phone, response);
            return response;
          case CuaCode.CODE_ERROR_NEED_BIND_PHONE:
            sendStatsErrors(response.code);
            asyncGoToPage(CuaPages.SET_PHONE);
            setMethods(Object.assign({}, methods, (_Object$assign6 = {}, _Object$assign6[ValidationMethodsType.Phone] = response.phone_info, _Object$assign6)));
            return response;
          default:
            handleResponse(ValidationMethodsType.Phone, response);
            return response;
        }
      })["catch"](function (err) {
        if ((err == null ? void 0 : err.error_code) === CuaPhoneErrorCode.PHONE_VALIDATE_NO_METHOD_AVAILABLE) {
          showAlertError(CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_NO_METHOD_AVAILABLE]);
        }
        if (err != null && err.error_code) {
          stopMessengerCheck();
        }
        console.warn('[Cua] error:', err);
      });
    };
    if (libverifyFlowEnabled.current) {
      return sendLibverifyOTP();
    }
    return fallbackToApiFunc();
  };
  var checkPhoneCode = function checkPhoneCode(code) {
    if (libverifyFlowEnabled.current) {
      checkLibverifyOTP(code);
    } else {
      var state = getCuaState();
      var factor = castToAnalyticFactor(currentPage != null ? currentPage : CuaPages.SMS);
      // TODO: убрать & cua_state, когда зальется аписхема
      apiRequest('cua.checkPhoneCode', {
        session: session,
        code: code,
        cua_state: state
      }, {
        local: true
      }).then(function (response) {
        var _Object$assign7, _Object$assign8;
        if (response.cua_state) {
          setCuaState(response.cua_state);
        }
        switch (response.code) {
          case CuaCode.CODE_OK:
          case CuaCode.CODE_METHOD_OK:
          case CuaCode.CODE_SKIP_CUA:
            sendStatsSuccess(factor, methods, wasTransitionToMethods);
            onSuccess({
              session: session
            });
            break;
          case CuaCode.CODE_NEED_MORE_VALIDATION:
            sendStatsSuccess(factor, methods, wasTransitionToMethods);
            void getMethods(false, true);
            break;
          case CuaCode.CODE_ERROR_NEED_BIND_PHONE:
            sendStatsErrors(response.code);
            asyncGoToPage(CuaPages.SET_PHONE);
            setMethods(Object.assign({}, methods, (_Object$assign7 = {}, _Object$assign7[ValidationMethodsType.Phone] = response.phone_info, _Object$assign7)));
            break;
          case CuaCode.CODE_ERROR_INCORRECT_CODE:
            sendStatsConfirmationCodeError(factor);
            setErrors(Object.assign({}, errors, (_Object$assign8 = {}, _Object$assign8[ValidationMethodsType.Phone] = getLang(CuaInputErrors[response.code]), _Object$assign8)));
            break;
          default:
            handleResponse(ValidationMethodsType.Phone, response);
            break;
        }
      })["catch"](function (err) {
        console.warn('[Cua] error:', err);
      });
    }
  };
  var sendPhoneBindCode = function sendPhoneBindCode(phone) {
    var fallbackToApiFunc = function fallbackToApiFunc() {
      var state = getCuaState();
      return apiRequest('cua.sendPhoneBindCode', {
        session: session,
        phone: phone,
        cua_state: state
      }, {
        local: true
      }).then(function (response) {
        switch (response.code) {
          case CuaCode.CODE_OTP_CODE_SENT:
            var page = response.phone_info.current_code_type;
            setCurrentPage(page);
            handleResponse(ValidationMethodsType.Phone, response);
            return;
          case CuaCode.CODE_ERROR_PHONE_BIND_CHECK_ERROR:
            sendStatsErrors(response.code);
            handleBindPhoneError(response.phone_error);
            break;
          default:
            handleResponse(ValidationMethodsType.Phone, response);
            return;
        }
      })["catch"](function (err) {
        console.warn('[Cua] error:', err);
        // ошибка с кодом 9 - это flood control, отправляем в этом случае стату
        if ((err == null ? void 0 : err.error_code) === 9) {
          sendStatsErrors(CuaCode.CODE_ERROR_FLOOD);
        }
      });
    };
    bindedPhone.current = phone;
    if (shouldUseLibverify()) {
      return startLibverify(asyncGoToPage, fallbackToApiFunc);
    }
    if (libverifyFlowEnabled.current) {
      return sendLibverifyOTP();
    }
    return fallbackToApiFunc();
  };
  var checkPhoneBindCode = function checkPhoneBindCode(code) {
    if (libverifyFlowEnabled.current) {
      checkLibverifyOTP(code);
    } else {
      var state = getCuaState();
      var factor = AnalyticsFactors.callReset;
      switch (currentPage) {
        case CuaPages.CALL:
          factor = AnalyticsFactors.callReset;
          break;
        default:
          factor = AnalyticsFactors.smsOrMax;
          break;
      }
      // TODO: убрать & cua_state, когда зальется аписхема
      apiRequest('cua.checkPhoneBindCode', {
        session: session,
        code: code,
        phone: bindPhone,
        cua_state: state
      }, {
        local: true
      }).then(function (response) {
        var _Object$assign9;
        if (response.cua_state) {
          setCuaState(response.cua_state);
        }
        switch (response.code) {
          case CuaCode.CODE_OK:
          case CuaCode.CODE_METHOD_OK:
          case CuaCode.CODE_SKIP_CUA:
            sendStatsShowBindSuccess(factor, methods, wasTransitionToMethods);
            onSuccess({
              session: session,
              linkedPhone: bindPhone
            });
            break;
          case CuaCode.CODE_NEED_MORE_VALIDATION:
            sendStatsShowBindSuccess(factor, methods, wasTransitionToMethods);
            void getMethods(false, true);
            break;
          case CuaCode.CODE_ERROR_PHONE_BIND_CHECK_ERROR:
            sendStatsErrors(response.code);
            handleBindPhoneError(response.phone_error);
            break;
          case CuaCode.CODE_ERROR_INCORRECT_CODE:
            sendStatsConfirmationCodeError(factor);
            setErrors(Object.assign({}, errors, (_Object$assign9 = {}, _Object$assign9[ValidationMethodsType.Phone] = getLang(CuaInputErrors[response.code]), _Object$assign9)));
            break;
          default:
            handleResponse(ValidationMethodsType.Phone, response);
            return;
        }
      })["catch"](function (err) {
        console.warn('[Cua] error:', err);
      });
    }
  };
  var sendPhoneCodeToDevice = function sendPhoneCodeToDevice(withGlobalLoader) {
    var _methods$phone;
    if (withGlobalLoader === void 0) {
      withGlobalLoader = false;
    }
    var hasPhone = (_methods$phone = methods.phone) == null ? void 0 : _methods$phone.has_phone;
    if (hasPhone) {
      void sendPhoneCode(withGlobalLoader);
    } else {
      void sendPhoneBindCode(bindedPhone.current);
    }
  };
  var savePhoneCode = function savePhoneCode(code) {
    var _methods$phone2;
    var hasPhone = (_methods$phone2 = methods.phone) == null ? void 0 : _methods$phone2.has_phone;
    if (hasPhone) {
      checkPhoneCode(code);
    } else {
      checkPhoneBindCode(code);
    }
  };
  var sendEmailCodeToDevice = function sendEmailCodeToDevice(withGlobalLoader) {
    if (withGlobalLoader === void 0) {
      withGlobalLoader = false;
    }
    var state = getCuaState();
    return apiRequest('cua.sendEmailCode', {
      session: session,
      cua_state: state
    }, {
      global: withGlobalLoader,
      local: !withGlobalLoader
    }).then(function (response) {
      handleResponse(ValidationMethodsType.Email, response);
    })["catch"](function (err) {
      if ((err == null ? void 0 : err.error_code) === CuaEmailErrorCode.INTERNAL_SERVER_ERROR) {
        sendStatsErrors(err.error_code);
        showAlertError(CuaEmailAlertError[err.error_code]);
      }
      console.warn('[Cua] error:', err);
    });
  };
  function goToPage(page, withGlobalLoader) {
    if (withGlobalLoader === void 0) {
      withGlobalLoader = false;
    }
    setErrors({});
    switch (page) {
      case CuaPages.SMS:
        if (libverifyFlowEnabled.current) {
          setCurrentPage(page);
          return;
        }
        var fallbackSMSApi = function fallbackSMSApi(page) {
          if (bindedPhone.current) {
            void sendPhoneBindCode(bindedPhone.current).then(function () {
              if (page) {
                setCurrentPage(page);
              }
            });
          } else {
            void sendPhoneCode(withGlobalLoader).then(function () {
              if (page) {
                setCurrentPage(page);
              }
            });
          }
        };
        if (!shouldUseLibverify()) {
          fallbackSMSApi(currentPage !== page ? page : undefined);
          return;
        }
        void startLibverify(asyncGoToPage, fallbackSMSApi);
        return;
      case CuaPages.VIBER:
      case CuaPages.TELEGRAM:
      case CuaPages.WHATSAPP:
        if (page) setCurrentPage(page);
        void sendPhoneCode(true);
        return;
      case CuaPages.MAX:
        void sendMaxCode(withGlobalLoader).then(function () {
          setCurrentPage(page);
        });
        return;
      case CuaPages.CALL:
        if (libverifyFlowEnabled.current) {
          setCurrentPage(page);
          return;
        }
        var fallbackCallApi = function fallbackCallApi(page) {
          if (bindedPhone.current) {
            void sendPhoneBindCode(bindedPhone.current).then(function () {
              if (page) {
                setCurrentPage(page);
              }
            });
          } else {
            void sendPhoneCode(withGlobalLoader).then(function () {
              if (page) {
                setCurrentPage(page);
              }
            });
          }
        };
        if (!shouldUseLibverify()) {
          fallbackCallApi(currentPage !== page ? page : undefined);
          return;
        }
        void startLibverify(asyncGoToPage, fallbackCallApi);
        return;
      case CuaPages.PUSH:
        void sendPushCodeToDevice(withGlobalLoader).then(function () {
          setCurrentPage(page);
        });
        return;
      case CuaPages.EMAIL:
        void sendEmailCodeToDevice(withGlobalLoader).then(function () {
          setCurrentPage(page);
        });
        return;
      case CuaPages.PASSWORD:
      case CuaPages.SET_PHONE:
      case CuaPages.SET_EMAIL:
      case CuaPages.SET_PASSWORD:
        setCurrentPage(page);
        return;
      case CuaPages.MAIN:
        libverifyFlowEnabled.current = false;
        currentState.current = undefined;
        void stopLibverify();
        void getMethods().then(function () {
          setWasTransitionToMethods(true);
          setCurrentPage(page);
        });
        return;
      default:
        return;
    }
  }
  var saveEmailCode = function saveEmailCode(code) {
    var state = getCuaState();
    apiRequest('cua.checkEmailCode', {
      session: session,
      code: code,
      cua_state: state
    }, {
      local: true
    }).then(function (response) {
      var _Object$assign10;
      if (response.cua_state) {
        setCuaState(response.cua_state);
      }
      switch (response.code) {
        case CuaCode.CODE_OK:
        case CuaCode.CODE_METHOD_OK:
        case CuaCode.CODE_SKIP_CUA:
          sendStatsSuccess(AnalyticsFactors.email, methods, wasTransitionToMethods);
          onSuccess({
            session: session
          });
          break;
        case CuaCode.CODE_NEED_MORE_VALIDATION:
          sendStatsSuccess(AnalyticsFactors.email, methods, wasTransitionToMethods);
          void getMethods(false, true);
          break;
        case CuaCode.CODE_ERROR_INCORRECT_CODE:
          sendStatsConfirmationCodeError(AnalyticsFactors.email);
          setErrors(Object.assign({}, errors, (_Object$assign10 = {}, _Object$assign10[ValidationMethodsType.Email] = getLang(CuaInputErrors[response.code]), _Object$assign10)));
          break;
        default:
          handleResponse(ValidationMethodsType.Email, response);
          return;
      }
    })["catch"](function (err) {
      console.warn('[Cua] error:', err);
    });
  };
  var saveEmail = function saveEmail(email) {
    /**
     * TODO: поменять any на норм типизацию при подключении api
     */
    void apiRequest('cua.saveEmail', {
      session: session,
      email: email
    }, {
      local: true
    }).then(function (response) {
      handleResponse(ValidationMethodsType.Email, response);
    })["catch"](function (err) {
      console.warn('[Cua] error:', err);
    });
  };
  var savePasswordCode = function savePasswordCode(password) {
    var state = getCuaState();
    apiRequest('cua.checkPassword', {
      session: session,
      password: password,
      cua_state: state
    }, {
      local: true
    }).then(function (response) {
      var _Object$assign11, _Object$assign12;
      if (response.cua_state) {
        setCuaState(response.cua_state);
      }
      switch (response.code) {
        case CuaCode.CODE_OK:
        case CuaCode.CODE_METHOD_OK:
        case CuaCode.CODE_SKIP_CUA:
          sendStatsSuccess(AnalyticsFactors.password, methods, wasTransitionToMethods);
          onSuccess({
            session: session
          });
          break;
        case CuaCode.CODE_NEED_MORE_VALIDATION:
          sendStatsSuccess(AnalyticsFactors.password, methods, wasTransitionToMethods);
          void getMethods(false, true);
          break;
        case CuaCode.CODE_ERROR_FLOOD:
          sendStatsErrors(response.code);
          showAlertError({
            header: 'vkconnect_sak_cua_error_password_flood_header',
            text: 'vkconnect_sak_cua_error_password_flood_text'
          });
          break;
        case CuaCode.CODE_ERROR_PASSWORD_INCORRECT:
          sendStatsConfirmationCodeError(AnalyticsFactors.password);
          setErrors(Object.assign({}, errors, (_Object$assign11 = {}, _Object$assign11[ValidationMethodsType.Password] = getLang(CuaInputErrors[response.code]), _Object$assign11)));
          break;
        case CuaCode.CODE_ERROR_NEED_SET_PASSWORD:
          sendStatsErrors(response.code);
          asyncGoToPage(CuaPages.SET_PASSWORD);
          setMethods(Object.assign({}, methods, (_Object$assign12 = {}, _Object$assign12[ValidationMethodsType.Password] = response.password_info, _Object$assign12)));
          return;
        default:
          handleResponse(ValidationMethodsType.Password, response);
          break;
      }
    })["catch"](function (err) {
      console.warn('[Cua] error:', err);
    });
  };
  var setPassword = function setPassword(password) {
    getExchangeHash && getExchangeHash().then(function (hash) {
      var state = getCuaState();
      apiRequest('cua.setPassword', {
        session: session,
        password: password,
        cua_state: state
      }, {
        local: true
      }).then(function (response) {
        var _Object$assign13, _response$password_er;
        if (response.cua_state) {
          setCuaState(response.cua_state);
        }
        switch (response.code) {
          case CuaCode.CODE_OK:
          case CuaCode.CODE_METHOD_OK:
          case CuaCode.CODE_OTP_CODE_SENT:
          case CuaCode.CODE_NEED_MORE_VALIDATION:
            if (isWebView) {
              nativeClientSaveCredentials({
                login: response.password_info.login,
                password: password
              });
            }
            exchangeToken && exchangeToken({
              token: response.exchange_token || '',
              hash: hash
            }).then(function () {
              sendStatsShowBindPasswordSuccess();
              handleResponse(ValidationMethodsType.Password, response);
            })["catch"](function (err) {
              console.log(err);
              showAlertError(CuaAlertError[CuaCode.CODE_ERROR_INTERNAL]);
            });
            break;
          case CuaCode.CODE_ERROR_FLOOD:
            sendStatsErrors(response.code);
            showAlertError({
              header: 'vkconnect_sak_cua_error_password_flood_header',
              text: 'vkconnect_sak_cua_error_password_flood_text'
            });
            break;
          case CuaCode.CODE_ERROR_PASSWORD_INCORRECT:
            sendStatsConfirmationCodeError(AnalyticsFactors.password);
            setErrors(Object.assign({}, errors, (_Object$assign13 = {}, _Object$assign13[ValidationMethodsType.Password] = getLang(CuaInputErrors[response.code]), _Object$assign13)));
            break;
          case CuaCode.CODE_ERROR_SET_PASSWORD_ERROR:
            if ((response == null || (_response$password_er = response.password_error) == null ? void 0 : _response$password_er.code) === CuaPasswordErrorCode.DO_CHANGE_PASSWORD_DB_FAIL) {
              showAlertError({
                header: 'vkconnect_sak_cua_error_password_compromised_header',
                text: 'vkconnect_sak_cua_error_password_compromised_text'
              });
            } else {
              handleBindPasswordError(response.password_error);
            }
            break;
          default:
            handleResponse(ValidationMethodsType.Password, response);
            break;
        }
      })["catch"](function (err) {
        console.warn('[Cua] error:', err);
        showAlertError(CuaAlertError[CuaCode.CODE_ERROR_INTERNAL]);
      });
    })["catch"](function (err) {
      console.warn('[Cua] error:', err);
      showAlertError(CuaAlertError[CuaCode.CODE_ERROR_INTERNAL]);
    });
  };
  var checkPassword = function checkPassword(password) {
    return apiRequest('account.checkPassword', {
      password: password
    });
  };
  var generatePassword = function generatePassword() {
    return apiRequest('vkProtect.generatePassword', {});
  };
  function handleBindPasswordError(error) {
    var _Object$assign14;
    switch (error == null ? void 0 : error.code) {
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_PASSWORD_MINIMUM_LENGTH:
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_BAD_PASSWORD:
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_COMPROMISED_PASSWORD:
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_NUMERIC_PASSWORD:
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_LONG_PASSWORD:
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_NOT_HARDENING:
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_USED_IN_ANOTHER_PROFILE:
        sendStatsErrors(error == null ? void 0 : error.code);
        setErrors(Object.assign({}, errors, (_Object$assign14 = {}, _Object$assign14[ValidationMethodsType.Password] = getLang(CuaInputErrors[error.code]), _Object$assign14)));
        break;
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_SECURITY_ERROR:
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_DB_FAIL:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPasswordAlertError[error.code]);
        break;
      case CuaPasswordErrorCode.DO_CHANGE_PASSWORD_ALREADY_SET:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPasswordAlertError[error.code], [{
          title: getLang('vkconnect_sak_cua_error_password_alreadey_set_btn_text'),
          mode: 'default',
          action: hidePopout
        }]);
        break;
    }
  }
  function handleBindPhoneError(error) {
    var goToSetPhone = function goToSetPhone() {
      hidePopout();
      setBindPhone('');
      bindedPhone.current = '';
      goToPage(CuaPages.SET_PHONE);
    };
    switch (error == null ? void 0 : error.code) {
      case CuaPhoneErrorCode.PHONE_OTP_ENABLED:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPhoneAlertError[error.code], [{
          title: getLang('vkconnect_sak_cua_error_phone_otp_enabled_btn_use_phone'),
          mode: 'default',
          action: goToSetPhone
        }, {
          title: getLang('vkconnect_sak_cua_error_phone_otp_enabled_btn_support'),
          mode: 'default',
          action: function action() {
            window.open(PHONE_BANNED_SUPPORT_URL, '_blank');
          }
        }], 'vertical');
        break;
      case CuaPhoneErrorCode.PHONE_VALIDATE_RELEASE_RESTRISTED:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPhoneAlertError[error.code], [{
          title: getLang('vkconnect_sak_cua_error_phone_validate_release_restristed_btn_use_phone'),
          mode: 'default',
          action: goToSetPhone
        }, {
          title: getLang('vkconnect_sak_cua_error_phone_validate_release_restristed_btn_support'),
          mode: 'default',
          action: function action() {
            window.open(PHONE_BANNED_SUPPORT_URL, '_blank');
          }
        }], 'vertical');
        break;
      case CuaPhoneErrorCode.PHONE_VALIDATE_RELEASE_RESTRISTED_USER:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPhoneAlertError[error.code], [{
          title: getLang('vkconnect_sak_cua_error_phone_validate_release_restristed_user_btn_use_phone'),
          mode: 'default',
          action: goToSetPhone
        }, {
          title: getLang('vkconnect_sak_cua_error_phone_validate_release_restristed_user_btn_support'),
          mode: 'default',
          action: function action() {
            window.open(CHANGE_PHONE_SUPPORT_URL, '_blank');
          }
        }], 'vertical');
        break;
      case CuaPhoneErrorCode.PHONE_VALIDATE_INCORRECT_PHONE:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPhoneAlertError[error.code], [{
          title: getLang('vkconnect_sak_cua_error_phone_validate_incorrect_phone_text_btn_use_phone'),
          mode: 'default',
          action: goToSetPhone
        }]);
        break;
      case CuaPhoneErrorCode.PHONE_VALIDATE_OCCUPIED:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPhoneAlertError[error.code], [{
          title: getLang('vkconnect_sak_cua_error_phone_validate_occupied_btn_use_phone'),
          mode: 'default',
          action: goToSetPhone
        }, {
          title: getLang('vkconnect_sak_cua_error_default_btn_text'),
          mode: 'default',
          action: hidePopout
        }], 'vertical');
        break;
      case CuaPhoneErrorCode.PHONE_VALIDATE_USED_LAST_BIND:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPhoneAlertError[error.code], undefined, undefined, {
          nameKey: '{phone}',
          value: bindPhone
        });
        break;
      case CuaPhoneErrorCode.PHONE_VALIDATE_CURRENT_PHONE_ACTIVATED:
      case CuaPhoneErrorCode.PHONE_VALIDATE_USER_ALREADY_ACTIVATED_TODAY:
      case CuaPhoneErrorCode.PHONE_VALIDATE_ALREADY_USED_TODAY:
      case CuaPhoneErrorCode.PHONE_VALIDATE_BANNED:
      case CuaPhoneErrorCode.PHONE_VALIDATE_UNKNOWN_ERROR:
      case CuaPhoneErrorCode.PHONE_VALIDATE_ALREADY_PHONE_OWNER:
      case CuaPhoneErrorCode.PHONE_VALIDATE_MONTHLY_LIMIT:
      case CuaPhoneErrorCode.PHONE_VALIDATE_YEARLY_LIMIT:
        sendStatsErrors(error == null ? void 0 : error.code);
        showAlertError(CuaPhoneAlertError[error.code]);
        break;
    }
  }
  function handleResponse(type, response) {
    var _Object$assign15, _Object$assign16;
    switch (response.code) {
      case CuaCode.CODE_OK:
      case CuaCode.CODE_METHOD_OK:
        onSuccess({
          session: session
        });
        break;
      case CuaCode.CODE_OTP_CODE_SENT:
        if (type === 'phone' && 'phone_info' in response && 'messenger_available' in response.phone_info && response.phone_info.messenger_available) {
          startMessengerCheck();
        }
        setMethods(Object.assign({}, methods, (_Object$assign15 = {}, _Object$assign15[type] = response[type + "_info"], _Object$assign15)));
        break;
      case CuaCode.CODE_ERROR_RESEND_TIMEOUT:
        sendStatsErrors(response.code);
        setMethods(Object.assign({}, methods, (_Object$assign16 = {}, _Object$assign16[type] = response[type + "_info"], _Object$assign16)));
        break;
      case CuaCode.CODE_NEED_MORE_VALIDATION:
        void getMethods(false, true);
        break;
      // TODO: из-за https://jira.mvk.com/browse/VKIDACC-3873 ошибка flood control
      // приходит с кодом 9 и обычной ошибкой, а не с кодом 6 в формате ошибки для cua.
      // После раскрутки фичи нужно убрать кейс CODE_ERROR_FLOOD из handleResponse
      case CuaCode.CODE_ERROR_FLOOD:
      case CuaCode.CODE_ERROR_TRY_RESEND:
      case CuaCode.CODE_ERROR_INTERNAL:
        stopMessengerCheck();
        sendStatsErrors(response.code);
        showAlertError(CuaAlertError[response.code]);
        break;
    }
  }
  return {
    page: currentPage,
    goToPage: goToPage,
    loading: loading,
    globalLoading: globalLoading,
    errors: errors,
    setErrors: setErrors,
    // methods list
    methods: methods,
    canChangeMethod: canChangeMethod,
    getMethods: getMethods,
    // push
    sendPushCodeToDevice: sendPushCodeToDevice,
    savePushCode: savePushCode,
    // phone
    sendPhoneCodeToDevice: sendPhoneCodeToDevice,
    sendPhoneCode: sendPhoneCode,
    savePhoneCode: savePhoneCode,
    // bindPhone
    bindPhone: bindPhone,
    setBindPhone: setBindPhone,
    sendPhoneBindCode: sendPhoneBindCode,
    canBindPhone: canBindPhone,
    // email
    sendEmailCodeToDevice: sendEmailCodeToDevice,
    saveEmailCode: saveEmailCode,
    saveEmail: saveEmail,
    // password
    savePasswordCode: savePasswordCode,
    setPassword: setPassword,
    checkPassword: checkPassword,
    generatePassword: generatePassword,
    libverifyFlowEnabled: libverifyFlowEnabled.current,
    currentState: currentState.current,
    libverifyTimer: libverifyTimer,
    setLibverifyTimer: setLibverifyTimer,
    additionalServiceFooter: additionalServiceFooter,
    disableIcon: disableIcon,
    disableToggles: disableToggles,
    session: session
  };
};
var defaultValue = {};
var CuaStoreContext = createContext(defaultValue);
var useCuaStore = function useCuaStore() {
  return useContext(CuaStoreContext);
};
function CuaStoreProvider(_ref5) {
  var children = _ref5.children,
    props = _objectWithoutPropertiesLoose(_ref5, _excluded);
  var store = useInitCuaStore(Object.assign({}, props));
  return jsx(CuaStoreContext.Provider, {
    value: store,
    children: children
  });
}
export { CuaStoreContext, CuaStoreProvider, useCuaStore };
